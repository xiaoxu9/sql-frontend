import React, {useRef, useState} from 'react';
import {ActionType, PageContainer, ProColumns, ProTable} from "@ant-design/pro-components";
import {Button, Divider, message, Popconfirm, Space, Typography} from "antd";
import {REVIEW_STATUS_ENUM} from "@/constants";
import {deleteFieldInfo, listFieldInfoByPage, updateFieldInfo} from "@/services/fieldInfoService";
import CreateModal from "./components/CreateModal";
import UpdateModal from "./components/UpdateModal";
import {useModel} from "@@/exports";

const AdminFieldInfoPage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
    const [updateData, setUpdateData] = useState<FieldInfoType.FieldInfo>({} as FieldInfoType.FieldInfo);
    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    /**
     * 删除节点
     * @param dict
     */
    const doDelete = async (field: FieldInfoType.FieldInfo) => {
        const hide = message.loading('正在删除');
        if (!field?.id) {
            return;
        }
        try {
            await deleteFieldInfo({
                id: field.id,
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
    const updateReviewStatus = async (
        field: FieldInfoType.FieldInfo,
        reviewStatus: number,
    ) => {
        const hide = message.loading('处理中');
        try {
            await updateFieldInfo({
                id: field.id,
                reviewStatus,
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
     * 表格列配置
     */
    const columns: ProColumns<FieldInfoType.FieldInfo>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            valueType: 'index',
        },
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '字段名称',
            dataIndex: 'fieldName',
        },
        {
            title: '内容',
            dataIndex: 'content',
            valueType: 'textarea',
        },
        //{
        //    title: '审核状态',
        //    dataIndex: 'reviewStatus',
        //    valueEnum: REVIEW_STATUS_ENUM,
        //},
        //{
        //    title: '审核信息',
        //    dataIndex: 'reviewMessage',
        //},
        {
            title: '创建者',
            dataIndex: 'userId',
            valueType: 'text',
            hideInForm: true,
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
                                    record.reviewStatus !== 1 && (
                                    <Typography.Link
                                        onClick={() => {
                                            updateReviewStatus(record, 1);
                                        }}
                                    >
                                        通过
                                    </Typography.Link>
                                    )
                                }
                                {
                                    record.reviewStatus !== 2 && (
                                    <Typography.Link
                                        type="danger"
                                        onClick={() => {
                                            updateReviewStatus(record, 2);
                                        }}
                                    >
                                        拒绝
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
            <ProTable<FieldInfoType.FieldInfo>
                headerTitle="字段管理"
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
                        新建字段
                    </Button>,
                ]}
                request={async (params, sorter) => {
                    const searchParams: FieldInfoType.FieldInfoQueryRequest = {
                        ...params,
                    };
                    // eslint-disable-next-line guard-for-in
                    for (const key in sorter) {
                        searchParams.sortField = key;
                        searchParams.sortOrder = sorter[key] as any;
                    }
                    const { data, code } = await listFieldInfoByPage(searchParams);
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
}

export default AdminFieldInfoPage;