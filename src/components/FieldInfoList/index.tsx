import React, {useState} from "react";
import { PaginationConfig } from 'antd/es/pagination';
import {useModel} from "@umijs/max";
import {Button, Descriptions, Divider, List, message, Popconfirm, Space, Tag, Typography} from "antd";
import {deleteFieldInfo, generateCreateFieldSql} from "@/services/fieldInfoService";
import copy from "copy-to-clipboard";
import ReportModal from "@/components/ReportModal";

interface Props {
    pagination: PaginationConfig;
    loading?: boolean;
    showTag?: boolean;
    dataList: FieldInfoType.FieldInfo[];
    onImport?: (values: FieldInfoType.FieldInfo) => void;
    title: string;
}

/**
 * 导入字段列表信息组件
 * @param props
 * @constructor
 */
const FieldInfoList: React.FC<Props> = (props) => {
    const { dataList, pagination, loading, showTag = true, onImport, title } = props;
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportedId, setReportedId] = useState(0);
    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    /**
     * 删除节点
     * @param id
     */
    const doDelete = async (id: number) => {
        const hide = message.loading('正在删除');
        // id不存在，表示已删除
        if (!id) {
            return true
        }
        try {
            await deleteFieldInfo({
                id,
            });
            message.success('操作成功');
            // 触发页面刷新
            window.location.reload();
        } catch (e: any) {
            message.error('操作失败，' + e.message);
        } finally {
            hide();
        }
    };

    return (
        <div className="field-info-list">
            <List<FieldInfoType.FieldInfo>
                itemLayout="vertical"  // 设置为竖排
                size="large"  // 大小
                loading={loading}
                pagination={pagination}  // 分页配置
                dataSource={dataList}
                renderItem={(item, index) => {
                    const content: Field = JSON.parse(item.content)
                    if ( title === '公开字段信息' && item.reviewStatus === 1 || title === '导入字段') {
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
                                    column={3}
                                >
                                    <Descriptions.Item label="字段名">{content.fieldName}</Descriptions.Item>
                                    <Descriptions.Item label="类型">{content.fieldType ?? '无'}</Descriptions.Item>
                                    <Descriptions.Item label="注释">{content.comment ?? '无'}</Descriptions.Item>
                                    <Descriptions.Item label="默认值">{content.defaultValue ?? '无'}</Descriptions.Item>
                                    <Descriptions.Item label="自增">{content.autoIncrement ? '是' : '否'}</Descriptions.Item>
                                    <Descriptions.Item label="主键">{content.primaryKey ? '是' : '否'}</Descriptions.Item>
                                    <Descriptions.Item label="非空">{content.notNull ? '是' : '否'}</Descriptions.Item>
                                    <Descriptions.Item label="onUpdate">{content.onUpdate ?? '无'}</Descriptions.Item>
                                </Descriptions>
                                {/* Divider 分割线*/}
                                <Space
                                    split={<Divider type="vertical" />}
                                    style={{fontSize: 14}}
                                >
                                    <Typography.Text type="secondary">{item.createTime.toString().split('T')[0]}</Typography.Text>
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            generateCreateFieldSql(item.id)
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
                                        type="text"
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
                                            title="你确定要删除么？"
                                            onConfirm={() => {
                                                doDelete(item.id);
                                            }}
                                        >
                                            <Button type="text" danger>
                                                删除
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                            </List.Item>
                        )
                    } else if ( title === '个人字段信息' && item.reviewStatus !== 1 || title === '导入字段') {
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
                                                {item.userId === 1 && <Tag color="gold">官方</Tag>}
                                            </div>
                                        </Space>
                                    }
                                    column={3}
                                >
                                    <Descriptions.Item label="字段名">{content.fieldName}</Descriptions.Item>
                                    <Descriptions.Item label="类型">{content.fieldType ?? '无'}</Descriptions.Item>
                                    <Descriptions.Item label="注释">{content.comment ?? '无'}</Descriptions.Item>
                                    <Descriptions.Item label="默认值">{content.defaultValue ?? '无'}</Descriptions.Item>
                                    <Descriptions.Item label="自增">{content.autoIncrement ? '是' : '否'}</Descriptions.Item>
                                    <Descriptions.Item label="主键">{content.primaryKey ? '是' : '否'}</Descriptions.Item>
                                    <Descriptions.Item label="非空">{content.notNull ? '是' : '否'}</Descriptions.Item>
                                    <Descriptions.Item label="onUpdate">{content.onUpdate ?? '无'}</Descriptions.Item>
                                </Descriptions>
                                {/* Divider 分割线*/}
                                <Space
                                    split={<Divider type="vertical" />}
                                    style={{fontSize: 14}}
                                >
                                    <Typography.Text type="secondary">{item.createTime.toString().split('T')[0]}</Typography.Text>
                                    <Button
                                        type="text"
                                        onClick={() => {
                                            generateCreateFieldSql(item.id)
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
                                        type="text"
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
                                            title="你确定要删除么？"
                                            onConfirm={() => {
                                                doDelete(item.id);
                                            }}
                                        >
                                            <Button type="text" danger>
                                                删除
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                            </List.Item>
                        )
                    } else {
                        return <></>
                    }

                }}
            />
            <ReportModal
                visible={reportModalVisible}
                reportedId={reportedId}
                type='2'
                onClose={() => {
                    setReportModalVisible(false);
                }}
            />
        </div>
    )
}

export default FieldInfoList;