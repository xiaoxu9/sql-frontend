import {deleteUser, listUserByPage, updateUser} from '@/services/userService';
import type {ActionType, ProColumns,} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {Button, message, Popconfirm, Typography} from 'antd';
import React, {useRef, useState} from 'react';
import CreateModal from './components/CreateModal';
import {useModel} from "@@/exports";
import UpdatePasswordModal from "@/pages/manage/user/components/UpdatePasswordModal";
import AvatarUpload from "@/pages/manage/user/components/AvatarUpload";

/**
 *  删除节点
 * @param selectedRows
 */
const doDelete = async (selectedRows: UserType.User[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
        await deleteUser({
            id: selectedRows.find((row) => row.id)?.id || 0,
        });
        message.success('操作成功');
    } catch (e: any) {
        message.error('操作失败，' + e.message);
    } finally {
        hide();
    }
};

/**
 * 用户管理页面
 * @constructor
 */
const AdminUserPage: React.FC<unknown> = () => {
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [updatePasswordModalVisible, setUpdatePasswordModalVisible] = useState<boolean>(false);
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const actionRef = useRef<ActionType>();
    const {initialState} = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    /**
     * 更新数据模态框
     * @param fields
     */
    const handleUpdate = async (fields: UserType.UserUpdateRequest) => {
        const hide = message.loading('正在更新');
        try {
            await updateUser({...fields});
            hide();
            message.success('更新成功');
        } catch (error) {
            hide();
            message.error('更新失败请重试！');
        }
    };

    /**
     * 表格列配置
     */
    const columns: ProColumns<UserType.User>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '用户昵称',
            dataIndex: 'userName',
            key: 'userName',
            valueType: 'text',
            ellipsis: true,
            tip: '账号过长会自动收缩',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: '账号',
            dataIndex: 'userAccount',
            key: 'userAccount',
            valueType: 'text',
            copyable: true,
            ellipsis: true,
            editable: false,
            tip: '账号过长会自动收缩',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            valueEnum: {
                0: {text: '男'},
                1: {text: '女'},
            },
        },
        {
            title: '用户角色',
            dataIndex: 'userRole',
            key: 'userRole',
            disable: true,
            filters: true,
            onFilter: true,
            ellipsis: true,
            valueType: 'select',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '此项为必填项',
                    },
                ],
            },
            valueEnum: {
                user: {
                    text: 'user',
                    status: 'Processing',
                },
                admin: {
                    text: 'admin',
                    status: loginUser?.id === 1 ? 'Processing' : 'Success',
                    disabled: loginUser?.id !== 1,
                },
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            valueType: 'dateTime',
            editable: false,
            hideInForm: true,
        },
        {
            title: '更新时间',
            dataIndex: 'updateTime',
            valueType: 'dateTime',
            key: 'updateTime',
            editable: false,
            hideInForm: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            key: 'option',
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id !== undefined ? record.id : '');
                    }}
                >
                    编辑
                </a>,
                <Popconfirm
                    title="您确定要删除么？"
                    onConfirm={() => doDelete([record])}
                    okText="确认"
                    cancelText="取消"
                >
                    <Typography.Link type="danger">删除</Typography.Link>
                </Popconfirm>,
            ],
        },
    ];

    return (
        <PageContainer>
            <ProTable<UserType.User>
                headerTitle="用户管理"
                rowKey="id"
                search={{
                    defaultCollapsed: false,
                }}
                actionRef={actionRef}
                toolBarRender={() => loginUser?.userRole === 'admin' ? [
                    <Button
                        key="add"
                        shape="round"
                        style={{color: "#00a3a3"}}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        新建用户
                    </Button>,
                    <Button
                        key='updatePassword'
                        shape="round"
                        style={{color: "blue"}}
                        onClick={()=>setUpdatePasswordModalVisible(true)}
                    >更改密码</Button>,
                    <AvatarUpload id={loginUser?.id}/>
                ] : [
                    <Button
                        key='updatePassword'
                        type="primary"
                        onClick={()=>setUpdatePasswordModalVisible(true)}
                    >更改密码</Button>,
                    <AvatarUpload id={loginUser?.id}/>
                ]}
                request={
                    async (params, sorter, filter) => {
                        const {data, code} = await listUserByPage({
                            ...params,
                            // @ts-ignore
                            sorter,
                            filter,
                        })
                        // 根据用户权限过滤用户
                        let count = 0;
                        return {
                            data: loginUser?.userRole === 'admin' ? data.records : data.records.filter(item => {
                                if (item.id === loginUser?.id) {
                                    count++;
                                    return item;
                                }
                            }),
                            success: code === 0,
                            total: count,
                        } as any;
                    }
                }
                columns={columns}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onSave: async (rowKey, data) => {
                        // 保存操作
                        await handleUpdate({...data, id: Number(rowKey)});
                    },
                    onCancel: () => {
                        actionRef.current?.reload();
                        return Promise.resolve();
                    },
                    onChange: setEditableRowKeys,
                    actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
                }}
            />

            <CreateModal
                modalVisible={createModalVisible}
                columns={columns}
                onSubmit={() => {
                }}
                onOk={() => {
                    // 关闭表单窗口
                    setCreateModalVisible(false)
                    // 刷新
                    actionRef.current?.reload();
                }}
                onCancel={() => setCreateModalVisible(false)}
            />

            <UpdatePasswordModal
                modalVisible={updatePasswordModalVisible}
                onSubmit={() => {
                }}
                onOk={() => {
                    // 关闭表单窗口
                    setUpdatePasswordModalVisible(false)
                    // 刷新
                    actionRef.current?.reload();
                }}
                onCancel={() => setUpdatePasswordModalVisible(false)}
            />
        </PageContainer>
    );
};

export default AdminUserPage;