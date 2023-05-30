import {
    ActionType,
    PageContainer,
    ProColumns,
    ProTable,
} from '@ant-design/pro-components';
import { Button, Divider, message, Popconfirm, Space, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import {deleteReport, listReportByPage, updateReport} from "@/services/reportService";
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import {useModel} from "@@/exports";

/**
 * 词库管理页面
 * @constructor
 */
const AdminReportPage: React.FC<unknown> = () => {
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
    const [updateData, setUpdateData] = useState<ReportType.Report>({} as ReportType.Report);
    const actionRef = useRef<ActionType>();
    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    /**
     * 删除节点
     * @param dict
     */
    const doDelete = async (report: ReportType.Report) => {
        const hide = message.loading('正在删除');
        if (!report?.id) {
            return;
        }
        try {
            await deleteReport({
                id: report.id,
            });
            message.success('操作成功');
            actionRef.current?.reload();
        } catch (e: any) {
            message.error('操作失败，' + e.message);
        } finally {
            hide();
        }
    };

    /**
     * 更新审核状态
     * @param dict
     * @param reviewStatus
     */
    const updateStatus = async (
        report: ReportType.Report,
        status: number,
    ) => {
        const hide = message.loading('处理中');
        try {
            await updateReport({
                id: report.id,
                status,
            });
            message.success('操作成功');
            actionRef.current?.reload();
        } catch (e: any) {
            message.error('操作失败，' + e.message);
        } finally {
            hide();
        }
    };

    /**
     * 状态枚举
     */
    const statusEnum = {
        0: {
            text: '未处理',
        },
        1: {
            text: '已处理',
        },
    };

    /**
     * 表格列配置
     */
    const columns: ProColumns<ReportType.Report>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            valueType: 'index',
        },

        {
            title: '内容',
            dataIndex: 'content',
            valueType: 'textarea',
        },
        {
            title: '类型',
            dataIndex: 'type',
        },
        {
            title: '被举报对象',
            dataIndex: 'reportedId',
            valueType: 'textarea',
        },
        {
            title: '被举报人',
            dataIndex: 'reportedUserId',
            hideInForm: true,
        },
        //{
        //    title: '审核状态',
        //    dataIndex: 'status',
        //    valueEnum: statusEnum,
        //},
        {
            title: '举报人',
            dataIndex: 'userId',
            valueType: 'text',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateTime',
            sorter: true,
            hideInForm: true,
            hideInSearch: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => (
                <Space split={<Divider type="vertical" />}>
                    <Typography.Link
                        onClick={() => {
                            setUpdateData(record);
                            setUpdateModalVisible(true);
                        }}
                    >
                        修改
                    </Typography.Link>
                    {
                        loginUser?.userRole === 'admin' ? (
                            <>
                                {
                                    record.status !== 1 && (
                                        <Typography.Link
                                            onClick={() => {
                                                updateStatus(record, 1);
                                            }}
                                        >
                                            处理
                                        </Typography.Link>
                                    )
                                }
                                {
                                    record.status === 1 && (
                                        <Typography.Link
                                            type="danger"
                                            onClick={() => {
                                                updateStatus(record, 0);
                                            }}
                                        >
                                            未处理
                                        </Typography.Link>
                                    )
                                }
                            </>
                        ) : (
                            <></>
                        )
                    }
                    <Popconfirm
                        title="您确定要删除么？"
                        onConfirm={() => doDelete(record)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Typography.Link type="danger">删除</Typography.Link>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer>
            <ProTable<ReportType.Report>
                headerTitle="举报管理"
                actionRef={actionRef}
                rowKey="id"
                search={{
                    defaultCollapsed: false,
                }}
                toolBarRender={() => [
                    <Button
                        key="1"
                        shape="round"
                        onClick={() => setCreateModalVisible(true)}
                    >
                        新建举报
                    </Button>,
                ]}
                request={async (params, sorter) => {
                    const searchParams: ReportType.ReportQueryRequest = {
                        ...params,
                    };
                    // eslint-disable-next-line guard-for-in
                    for (const key in sorter) {
                        searchParams.sortField = key;
                        searchParams.sortOrder = sorter[key] as any;
                    }
                    const { data, code } = await listReportByPage(searchParams);
                    let count = 0;
                    return {
                        data: loginUser?.userRole === 'admin' ? data.records : data.records.filter(item => {
                            if (item.userId === loginUser?.id) {
                                count++;
                                return item
                            }
                        }),
                        success: code === 0,
                        total: count,
                    } as any;
                }}
                columns={columns}
            />
            <CreateModal
                modalVisible={createModalVisible}
                columns={columns}
                onSubmit={() => {}}
                onOk={()=>{
                    // 关闭表单窗口
                    setCreateModalVisible(false)
                    // 刷新
                    actionRef.current?.reload();
                }}
                onCancel={() => setCreateModalVisible(false)}
            />
            <UpdateModal
                modalVisible={updateModalVisible}
                oldData={updateData}
                columns={columns}
                onSubmit={() => {}}
                onOk={()=>{
                    // 关闭表单窗口
                    setUpdateModalVisible(false)
                    // 刷新
                    actionRef.current?.reload();
                }}
                onCancel={() => setUpdateModalVisible(false)}
            />
        </PageContainer>
    );
};

export default AdminReportPage;