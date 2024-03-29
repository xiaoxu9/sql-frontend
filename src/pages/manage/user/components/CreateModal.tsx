import { addUser } from '@/services/userService';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import {message, Modal, Popconfirm, Typography} from 'antd';
import React, {PropsWithChildren, useEffect} from 'react';

interface CreateModalProps {
    modalVisible: boolean;
    columns: ProColumns<UserType.User>[];
    onSubmit: () => void;
    onCancel: () => void;
    onOk: () => void;
}

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: UserType.User) => {
    const hide = message.loading('正在添加');
    try {
        await addUser({ ...fields } as UserType.UserAddRequest);
        hide();
        message.success('添加成功');
        return true;
    } catch (error) {
        message.error('账号已存在或系统错误，请重试');
        return false;
    }
};

/**
 * 创建数据模态框
 * @param props
 * @constructor
 */
const CreateModal: React.FC<PropsWithChildren<CreateModalProps>> = (props) => {
    const { modalVisible, columns, onSubmit, onCancel, onOk } = props;

    useEffect(()=>{
        columns.push(
            {
                title: '密码',
                dataIndex: 'userPassword',
                valueType: 'text',
                hideInTable: true,
                formItemProps: {
                    rules: [
                        {
                            required: true,
                            min: 8,
                            max: 12,
                            message: '新密码长度范围在（8 ~ 12）个字符',
                        },
                    ],
                },
            },
        )
    }, [columns])

    return (
        <Modal
            destroyOnClose
            title="新建"
            open={modalVisible}
            onCancel={() => onCancel()                          }
            footer={null}
        >
            <ProTable<UserType.User, UserType.User>
                onSubmit={async (value) => {
                    const success = await handleAdd(value);
                    if (success) {
                        onSubmit?.();
                    }
                    onOk();
                }}
                rowKey="id"
                type="form"
                columns={columns}
            />
        </Modal>
    );
};

export default CreateModal;
