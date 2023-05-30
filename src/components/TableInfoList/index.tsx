import React, {useEffect, useState} from "react";
import { PaginationConfig } from 'antd/es/pagination';
import {useModel} from "@umijs/max";
import {Button, Descriptions, Divider, List, message, Popconfirm, Space, Tag, Typography} from "antd";
import {deleteFieldInfo} from "@/services/fieldInfoService";
import copy from "copy-to-clipboard";
import ReportModal from "@/components/ReportModal";
import {generateCreateTableSql, updateTableInfo} from "@/services/tableInfoService";

interface Props {
    pagination: PaginationConfig;
    loading?: boolean;
    showTag?: boolean;
    dataList: TableInfoType.TableInfo[];
    onImport?: (values: TableInfoType.TableInfo) => void;
    title: string;
}

/**
 * 导入字段列表信息组件
 * @param props
 * @constructor
 */
const TableInfoList: React.FC<Props> = (props) => {
    const { dataList, pagination, loading, showTag = true, onImport, title } = props;
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [currentDataList, setCurrentDataList] = useState<TableInfoType.TableInfo[]>(dataList);
    const [reportedId, setReportedId] = useState(0);

    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    useEffect(()=>{
        setCurrentDataList(dataList);
    }, [dataList]);

    /**
     * 删除节点
     * @param id
     */
    const doDelete = async (id: number) => {
        const hide = message.loading('正在删除');
        // id不存在，表示已删除
        if (!id) return true;
        try {
            await deleteFieldInfo({
                id,
            });
            // 更新前端数据
            setCurrentDataList(currentDataList.filter((item)=>item.id !== id));
            message.success('操作成功');
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
    const handleUpdate = async (fields: TableInfoType.TableInfo) => {
        const hide = message.loading('正在更新');
        try {
            await updateTableInfo(fields);
            hide();
            message.success('更新成功');
            // 更新前端数据
            setCurrentDataList(currentDataList.filter(item => {
                if (item.id === fields.id) {
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
        <div className="table-info-list">
            <List<TableInfoType.TableInfo>
                itemLayout="vertical"  // 设置为竖排
                size="large"  // 大小
                loading={loading}
                pagination={pagination}  // 分页配置
                dataSource={currentDataList}
                renderItem={(item, index) => {
                    const content: TableSchema = JSON.parse(item.content)
                    if ( title === '公开表信息' || title === '导入表') {
                        // 显示公开的
                        if (item.reviewStatus === 1) {
                            return (
                                <List.Item
                                    key={index}
                                    extra={
                                        onImport && (
                                            <Button onClick={() => {
                                                onImport(item);  // 传递数据
                                            }}>
                                                导入
                                            </Button>
                                        )
                                    }
                                >
                                    <Descriptions
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
                                        column={2}
                                    >
                                        <Descriptions.Item label="表名">{content.tableName}</Descriptions.Item>
                                        <Descriptions.Item label="表注释">{content.tableComment ?? '无'}</Descriptions.Item>
                                        <Descriptions.Item label="字段列表">{content.fieldList.map(field => field.fieldName).join(",")}</Descriptions.Item>
                                    </Descriptions>
                                    {/* Divider 分割线*/}
                                    <Space
                                        split={<Divider type="vertical" />}
                                        style={{fontSize: 14}}
                                    >
                                        <Typography.Text type="secondary">{item.createTime.toString().split('T')[0]}</Typography.Text>
                                        <Button
                                            type="default"
                                            shape='round'
                                            onClick={() => {
                                                generateCreateTableSql(item.id)
                                                    .then(res => {
                                                        copy(res.data);
                                                        message.success('复制创建字段 SQL 成功')
                                                    }).catch(e => {
                                                    message.error('复制失败，' + e.message);
                                                });
                                            }}
                                        >
                                            复制语句
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
                                            // 气泡提示框
                                            <Popconfirm
                                                title="你确定要取消公开吗？"
                                                onConfirm={() => {
                                                    handleUpdate({...item, reviewStatus: 3});
                                                }}
                                            >
                                                <Button type="primary" ghost shape="round" danger >
                                                    取消公开
                                                </Button>
                                            </Popconfirm>
                                        )}
                                    </Space>
                                </List.Item>
                            )
                        }
                    } else if ( title === '个人表信息' || title === '导入表') {
                        if (item.userId === loginUser?.id) {
                            return (
                                <List.Item
                                    key={index}
                                    extra={
                                        onImport && (
                                            <Button onClick={() => {
                                                onImport(item);  // 传递数据
                                            }}>
                                                导入
                                            </Button>
                                        )
                                    }
                                >
                                    <Descriptions
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
                                        column={2}
                                    >
                                        <Descriptions.Item label="表名">{content.tableName}</Descriptions.Item>
                                        <Descriptions.Item
                                            label="表注释">{content.tableComment ?? '无'}</Descriptions.Item>
                                        <Descriptions.Item
                                            label="字段列表">{content.fieldList.map(field => field.fieldName).join(",")}</Descriptions.Item>
                                    </Descriptions>
                                    {/* Divider 分割线*/}
                                    <Space
                                        split={<Divider type="vertical"/>}
                                        style={{fontSize: 14}}
                                    >
                                        <Typography.Text
                                            type="secondary">{item.createTime.toString().split('T')[0]}</Typography.Text>
                                        <Button
                                            type="default"
                                            shape='round'
                                            onClick={() => {
                                                generateCreateTableSql(item.id)
                                                    .then(res => {
                                                        copy(res.data);
                                                        message.success('复制创建字段 SQL 成功')
                                                    }).catch(e => {
                                                    message.error('复制失败，' + e.message);
                                                });
                                            }}
                                        >
                                            复制语句
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
                                                            // 设置为待审核状态
                                                            handleUpdate({...item, reviewStatus: 0});
                                                        }}>
                                                            请求公开
                                                        </Button>
                                                    )
                                                }
                                                {/*气泡提示框*/}
                                                <Popconfirm
                                                    title="你确定要删除么？"
                                                    onConfirm={() => {
                                                        doDelete(item.id);
                                                    }}
                                                >
                                                    <Button type="primary" ghost shape="round" danger>
                                                        删除
                                                    </Button>
                                                </Popconfirm>
                                            </>
                                        )}
                                    </Space>
                                </List.Item>
                            )
                        }
                    }
                }}
            />
            <ReportModal
                visible={reportModalVisible}
                reportedId={reportedId}
                type="1"
                onClose={() => {
                    setReportModalVisible(false);
                }}
            />
        </div>
    )
}

export default TableInfoList;