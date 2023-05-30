import GenerateResultCard from '@/components/GenerateResultCard';
import ReportModal from '@/components/ReportModal';
import {deleteDict, generateCreateDictTableSql, updateDict} from '@/services/dictService';
import { useModel } from '@umijs/max';
import {
    Button,
    Divider,
    Drawer,
    List,
    message,
    Popconfirm,
    Space,
    Tag,
    Typography,
} from 'antd';
import { PaginationConfig } from 'antd/es/pagination';
import React, {useEffect, useState} from 'react';

interface Props {
    title: string;
    pagination: PaginationConfig;
    loading?: boolean;
    dataList: DictType.Dict[];
    showTag?: boolean;
    onImport?: (values: DictType.Dict) => void;
}

const DictList: React.FC<Props> = (props) => {
    const { dataList, pagination, loading, showTag = true, title } = props;
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [currentDataList, setCurrentDataList] = useState<DictType.Dict[]>(dataList);
    const [reportedId, setReportedId] = useState(0);
    const [result, setResult] = useState<GenerateVO>();
    const [genLoading, setGenLoading] = useState(false);
    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    useEffect(()=>{
        setCurrentDataList(dataList);
    }, [dataList]);

    /**
     *  删除节点
     * @param id
     */
    const doDelete = async (id: number) => {
        const hide = message.loading('正在删除');
        if (!id) return true;
        try {
            await deleteDict({
                id,
            });
            message.success('操作成功');
            // 更新前端数据
            setCurrentDataList(currentDataList.filter((item)=>item.id !== id));
        } catch (e: any) {
            message.error('操作失败，' + e.message);
        } finally {
            hide();
        }
    };
    /**
     * 更新状态
     * @param fields
     */
    const handleUpdate = async (fields: DictType.Dict) => {
        const hide = message.loading('正在更新');
        try {
            await updateDict(fields);
            hide();
            message.success('更新成功');
            // 更新前端数据
            setCurrentDataList(currentDataList.filter((item)=>{
                if(item.id === fields.id) {
                    item.reviewStatus = fields.reviewStatus;
                }
                return item;
            }));
            return true;
        } catch (error) {
            hide();
            message.error('更新失败请重试！');
            return false;
        }
    };

    return (
        <div className="dict-list">
            <List<DictType.Dict>
                itemLayout="vertical"  // 设置为竖排
                size="large"  // 大小
                loading={loading}
                pagination={pagination}  // 分页配置
                dataSource={currentDataList}
                renderItem={(item, index) => {
                    if (title === '公开词库' && item.reviewStatus === 1) {
                        return (
                            <List.Item key={index} >
                                <List.Item.Meta
                                    title={
                                        <Space align="center">
                                            <div>{item.name}</div>
                                            <div>
                                                {showTag && item.reviewStatus === 1 && (
                                                    <Tag color="success">公开</Tag>
                                                )}
                                                {item.userId === 1 && <Tag color="gold">官方</Tag>}
                                            </div>
                                        </Space>
                                    }
                                    description={
                                        <Typography.Paragraph
                                            type="secondary"
                                            ellipsis={{
                                                rows: 6,  // 默认展示行数
                                                expandable: true,  // 是否开启展开展示
                                                symbol: '展开',
                                            }}
                                            copyable  // 复制按钮
                                        >
                                            {JSON.parse(item.content).join(',')}
                                        </Typography.Paragraph>
                                    }
                                />
                                {/* Divider 分割线*/}
                                <Space split={<Divider type="vertical" />} style={{fontSize: 14}}>
                                    <Typography.Text type="secondary">{item.createTime.toString().split('T')[0]}</Typography.Text>
                                    <Button
                                        type="default"
                                        shape='round'
                                        loading={loading}
                                        onClick={() => {
                                            setGenLoading(true);
                                            generateCreateDictTableSql(item.id)
                                                .then((res) => {
                                                    setResult(res.data);
                                                })
                                                .catch((e) => {
                                                    message.error('复制失败，' + e.message);
                                                })
                                                .finally(() => setGenLoading(false));
                                        }}
                                    >
                                        生成表
                                    </Button>
                                    <Button
                                        type="default"
                                        shape='round'
                                        onClick={() => {
                                            setReportedId(item.id);
                                            // 显示举报页面
                                            setReportModalVisible(true);
                                        }}
                                    >
                                        举报
                                    </Button>
                                    {loginUser && loginUser.id === item.userId && (
                                        <Popconfirm
                                            title="你确定要取消公开吗？"
                                            onConfirm={() => {
                                                //doDelete(item.id);
                                                handleUpdate({...item, reviewStatus: 3});
                                            }}
                                        >
                                            <Button type="primary" shape="round" ghost danger >
                                                取消公开
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                            </List.Item>
                        )
                    } else if (title === '个人词库' && item.userId === loginUser?.id) {
                        return (
                            <List.Item key={index} >
                                <List.Item.Meta
                                    title={
                                        <Space align="center">
                                            <div>{item.name}</div>
                                            <div>
                                                {showTag && item.reviewStatus === 1 && (
                                                    <Tag color="success">公开</Tag>
                                                )}
                                                {item.userId === 1 && <Tag color="gold">官方</Tag>}
                                            </div>
                                        </Space>
                                    }
                                    description={
                                        <Typography.Paragraph
                                            type="secondary"
                                            ellipsis={{
                                                rows: 6,  // 默认展示行数
                                                expandable: true,  // 是否开启展开展示
                                                symbol: '展开',
                                            }}
                                            copyable  // 复制按钮
                                        >
                                            {JSON.parse(item.content).join(',')}
                                        </Typography.Paragraph>
                                    }
                                />
                                {/* Divider 分割线*/}
                                <Space split={<Divider type="vertical" />} style={{fontSize: 14}}>
                                    <Typography.Text type="secondary">{item.createTime.toString().split('T')[0]}</Typography.Text>
                                    <Button
                                        type="default"
                                        shape='round'
                                        loading={loading}
                                        onClick={() => {
                                            setGenLoading(true);
                                            generateCreateDictTableSql(item.id)
                                                .then((res) => {
                                                    setResult(res.data);
                                                })
                                                .catch((e) => {
                                                    message.error('复制失败，' + e.message);
                                                })
                                                .finally(() => setGenLoading(false));
                                        }}
                                    >
                                        生成表
                                    </Button>
                                    <Button
                                        type="default"
                                        shape='round'
                                        onClick={() => {
                                            setReportedId(item.id);
                                            // 显示举报页面
                                            setReportModalVisible(true);
                                        }}
                                    >
                                        举报
                                    </Button>
                                    {loginUser && loginUser.id === item.userId && (
                                        <>
                                            {
                                                // 未提交以及拒绝状态时可请求公开
                                                (item.reviewStatus === 2 || item.reviewStatus === 3) && (
                                                    <Button type="primary" ghost shape="round" onClick={()=>{
                                                        handleUpdate({...item, reviewStatus: 0});
                                                    }}>
                                                        请求公开
                                                    </Button>
                                                )
                                            }
                                            <Popconfirm
                                                title="你确定要删除么？"
                                                onConfirm={() => {
                                                    doDelete(item.id);
                                                }}
                                            >
                                                <Button type="primary" ghost shape="round"  danger >
                                                    删除
                                                </Button>
                                            </Popconfirm>
                                        </>
                                    )}
                                </Space>
                            </List.Item>
                        )
                    }
                }}
            />
            <ReportModal
                visible={reportModalVisible}
                reportedId={reportedId}
                type='0'
                onClose={() => {
                    setReportModalVisible(false);
                }}
            />
            <Drawer
                title="生成字典表成功"
                contentWrapperStyle={{ width: '80%', minWidth: 320 }}
                open={!!result}
                onClose={() => setResult(undefined)}
            >
                <GenerateResultCard result={result} showCard={false} />
            </Drawer>
        </div>
    );
}

export default DictList;