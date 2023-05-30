import React, {useEffect, useState} from "react";
import {useModel} from "@umijs/max";
import {listFieldInfoByPage} from "@/services/fieldInfoService";
import {Button, Card, Empty, Input, message, Space} from "antd";
import {Link} from "@@/exports";
import FieldInfoList from "@/components/FieldInfoList";

// 默认分页大小
const DEFAULT_PAGE_SIZE = 10;

interface Props {
    title?: string,
    needLogin?: boolean,  // 需要登录
    showTag?: boolean,    // 显示标签
    onLoad?: (
        searchParams: FieldInfoType.FieldInfoQueryRequest,
        setDataList: (dataList: FieldInfoType.FieldInfo[]) => void,
        setTotal: (total: number) => void,
    ) => void;
    onImport?: (values: FieldInfoType.FieldInfo) => void;
}

/**
 * 字段信息抽屉卡片
 * @constructor
 */
const FieldInfoCard: React.FC<Props> = (props) => {
    const { title = '字段信息列表', needLogin = false, showTag = true, onLoad, onImport } = props;

    // 公开数据
    const [dataList, setDataList] = useState<FieldInfoType.FieldInfo[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const initSearchParams: FieldInfoType.FieldInfoQueryRequest = {
        current: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        sortField: 'createTime',
        sortOrder: 'descend',
    };
    const [searchParams, setSearchParams] = useState<FieldInfoType.FieldInfoQueryRequest>(initSearchParams);
    const { initialState } = useModel('@@initialState')
    const loginUser = initialState?.loginUser;

    /**
     * 加载数据
     */
    const innerOnLoad = () => {
        listFieldInfoByPage({
            ...searchParams,
            // 只展示已审核通过的
            reviewStatus: 1,
        }).then(res => {
            setDataList(res.data.records);
            setTotal(res.data.total);
        }).catch(e => {
            message.error('加载失败，' + e.message)
        });
    }

    // 加载数据
    useEffect(() => {
        // 需要登录
        if (needLogin && !loginUser) {
            return;
        }
        setLoading(true);
        if (onLoad) {
            // 数据在加载
            onLoad(searchParams, setDataList, setTotal);
        } else {
            // 数据未加载，加载数据
            innerOnLoad();
        }
        setLoading(false);
    }, [searchParams])

    return(
        <div className="field-info-card">
            <Card
                title={title}
                extra={
                    title === '个人字段信息' ?
                        <Link to="/">
                            <Button type="primary">去创建</Button>
                        </Link> : <></>

                }
                >
                {!needLogin || loginUser ? (
                    <>
                        <Space>
                            <Input.Search
                                placeholder="请输入名称"
                                enterButton="搜索"
                                onSearch={(value) => {
                                    setSearchParams({
                                        ...initSearchParams,
                                        searchName: value,
                                    });
                                }}
                            />
                        </Space>
                        {/* 导入字段列表信息组件 */}
                        <FieldInfoList
                            pagination={{  // 分页配置
                                total,
                                onChange: (current) => {
                                    setSearchParams({
                                        ...initSearchParams,
                                        current,
                                    })
                                    // 设置滚动位置
                                    window.scrollTo({
                                        top: 0,
                                    });
                                },
                                pageSize: DEFAULT_PAGE_SIZE,
                            }}
                            dataList={dataList}
                            loading={loading}
                            showTag={showTag}
                            onImport={onImport}
                            title={title}
                        />
                    </>
                ) : (
                    <Empty
                        description={
                            <Link to="/user/login">
                                <Button type="primary" ghost style={{marginTop: 8}}>请先登录</Button>
                            </Link>
                        }
                    />
                )}
            </Card>
        </div>
    )
}

export default FieldInfoCard;