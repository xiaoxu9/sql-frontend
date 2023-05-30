import React, {useEffect, useState} from 'react';
import {Link} from "@@/exports";
import {Button, Card, Empty, Input, message, Space} from "antd";
import {useModel} from "@umijs/max";
import {listDictByPage} from "@/services/dictService";
import DictList from '../DictList';

// 默认分页大小
const DEFAULT_PAGE_SIZE = 10;

interface Props {
    title?: string;  // 标题
    needLogin?: boolean;  // 是否需要登录
    showTag?: boolean;
    onLoad?: (
        searchParams: DictType.DictQueryRequest,
        setDataList: (dataList: DictType.Dict[]) => void,
        setTotal: (total: number) => void,
    ) => void;
    onImport?: (values: DictType.Dict) => void;
}

/**
 * 词库卡片
 *
 * @author https://github.com/xiaoxu9
 */
const DictCard: React.FC<Props> = (props) => {
    const { title = '公开词库', needLogin = false, showTag = true, onLoad, onImport } = props;

    // 公开数据
    const [dataList, setDataList] = useState<DictType.Dict[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const initSearchParams: DictType.DictQueryRequest = {
        current: 1,  // 当前页
        pageSize: DEFAULT_PAGE_SIZE,  // 页面大小
        sortField: 'createTime',  // 排序字段
        sortOrder: 'descend',  // 排序顺序方式
    };
    const [searchParams, setSearchParams] = useState<DictType.DictQueryRequest>(initSearchParams);

    const { initialState } = useModel('@@initialState');
    const loginUser= initialState?.loginUser;

    /**
     * 加载数据
     */
    const innerOnLoad = () => {
        listDictByPage({
            ...searchParams,
            // 只显示已审核通过的
            reviewStatus: 1,
        }).then(res => {
            setDataList(res.data.records);
            setTotal(res.data.total);
        }).catch(e => {
            message.error('加载失败，' + e.message);
        })
    }

    /**
     * 加载数据
     */
    useEffect(() => {
        // 需要登录
        if (needLogin && !loginUser) {
            return;
        }
        setLoading(true);
        if (onLoad) {
            // 在加载中
            onLoad(searchParams, setDataList, setTotal);
        } else {
            // 未加载，设置去加载
            innerOnLoad();
        }
        setLoading(false);
    }, [searchParams]);

    return (
        <div>
            <Card
                title={title}
                extra={
                    title === '个人词库' ? <Link to="/dict/add">
                        <Button type="primary">创建词库</Button>
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
                                        name: value,
                                    });
                                }}
                            />
                        </Space>
                        <DictList
                            pagination={{
                                total,
                                onChange: (current) => {
                                    setSearchParams({...searchParams, current});
                                    window.scrollTo({
                                        top: 0,
                                    })
                                }
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
                )
                }
            </Card>
        </div>
    );
}

export default DictCard;