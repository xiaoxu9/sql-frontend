import { REVIEW_STATUS_ENUM } from '@/constants';
import { deleteDict, listDictByPage, updateDict } from '@/services/dictService';
import {
    ActionType,
    PageContainer,
    ProColumns,
    ProTable,
} from '@ant-design/pro-components';
import { Button, Divider, message, Popconfirm, Space, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import {useModel} from "@@/exports";

/**
 * 词库管理页面
 * @constructor
 */
const AdminDictPage: React.FC<unknown> = () => {
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
    const [updateData, setUpdateData] = useState<DictType.Dict>(
        {} as DictType.Dict,
    );
    const actionRef = useRef<ActionType>();
    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    /**
     * 删除节点
     * @param dict
     */
    const doDelete = async (dict: DictType.Dict) => {
        const hide = message.loading('正在删除');
        if (!dict?.id) {
            return;
        }
        try {
            await deleteDict({
                id: dict.id,
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
        dict: DictType.Dict,
        reviewStatus: number,
    ) => {
        const hide = message.loading('处理中');
        try {
            await updateDict({
                id: dict.id,
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
    const columns: ProColumns<DictType.Dict>[] = [
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
            title: '内容',
            dataIndex: 'content',
            valueType: 'textarea',
            fieldProps: {
                placeholder: '多个单词间用【英文或中文逗号】分割',
            },
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
                <Space split={<Divider type="vertical"/>}>
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
                                    // 已拒绝和待审核都可以通过
                                    (record.reviewStatus === 0 || record.reviewStatus === 2) && (
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
                                    // 下架已通过的
                                    record.reviewStatus === 1 && (
                                        <Typography.Link
                                            type="danger"
                                            onClick={() => {
                                                updateReviewStatus(record, 3);
                                            }}
                                        >
                                            下架
                                        </Typography.Link>
                                    )
                                }
                                {
                                    // 拒绝待审核的
                                    record.reviewStatus === 0 && (
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
            )
        },
    ];

    return (
        <PageContainer>
            <ProTable<DictType.Dict>
                headerTitle="词库管理"
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
                        新建词库
                    </Button>,
                ]}
                request={async (params, sorter) => {
                    const searchParams: DictType.DictQueryRequest = {
                        ...params,
                    };
                    // eslint-disable-next-line guard-for-in
                    for (const key in sorter) {
                        searchParams.sortField = key;
                        searchParams.sortOrder = sorter[key] as any;
                    }
                    const { data, code } = await listDictByPage(searchParams);
                    let count = 0;
                    return {
                        // 超级管理员只可以查看自己的以及用户请求公开的词库数据
                        data: loginUser?.userRole === 'admin' ? data.records.filter(item => !(item.userId !== loginUser.id && item.reviewStatus === 3)) : data.records.filter(item => {
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

export default AdminDictPage;