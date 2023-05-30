import { ProColumns, ProTable } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import React, { PropsWithChildren } from 'react';
import {updatePassword} from "@/services/userService";
import {useModel, useNavigate} from "@@/exports";

interface UpdatePasswordProps {
    modalVisible: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    onOk: () => void;
}

/**
 * 更新密码
 * @param fields
 */
const handleUpdate = async (fields: UserType.UserUpdatePasswordRequest) => {
    const hide = message.loading('正在添加');
    try{
        if (fields.userPassword !== fields.checkPassword) {
            throw new Error("新密码不一致");
        }
    } catch (e) {
        message.error('新密码不一致，请重新输入');
    }
    try {
        await updatePassword({ ...fields } );
        //console.log(fields)
        hide();
        message.success('更改密码成功，请重新登录');
        return true;
    } catch (error) {
        hide();
        message.error('更改密码失败，请重试');
        return false;
    }
};

/**
 * 更新密码模态框
 * @param props
 * @constructor
 */
const CreateModal: React.FC<PropsWithChildren<UpdatePasswordProps>> = (props) => {
    const { modalVisible, onCancel, onOk, onSubmit } = props;
    const {initialState} = useModel('@@initialState');
    const loginUser = initialState?.loginUser;
    const navigate = useNavigate();

    const columns: ProColumns<UserType.UserUpdatePasswordRequest>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            valueType: 'indexBorder',
            width: 48,
            hideInForm: true,
        },
        {
            title: '账号',
            dataIndex: 'userAccount',
            valueType: 'indexBorder',
            hideInForm: true,
        },
        {
            title: '旧密码',
            dataIndex: 'oldPassword',
            valueType: 'text',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        min: 8,
                        max: 12,
                        message: '旧密码长度范围在（8 ~ 12）个字符',

                    },
                ],
            },
        },
        {
            title: '新密码',
            dataIndex: 'userPassword',
            valueType: 'text',
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
        {
            title: '再次确认新密码',
            dataIndex: 'checkPassword',
            valueType: 'text',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        min: 8,
                        max: 12,
                        message: '确认密码长度范围在（8 ~ 12）个字符',
                    },
                ],
            },
        },
    ];

    return (
        <Modal
            destroyOnClose
            title="更改密码"
            open={modalVisible}
            onCancel={() => onCancel()}
            footer={null}
        >
            <ProTable<UserType.UserUpdatePasswordRequest, UserType.UserUpdatePasswordRequest>
                onSubmit={async (values) => {
                    const success = await handleUpdate({
                        id: loginUser?.id,
                        ...values,
                        userAccount: loginUser?.userAccount,
                    });
                    if (success) {
                        onSubmit?.();
                        // 清除本地账号，重新登录
                        localStorage.clear();
                        // 跳转重新登录
                        navigate('/user/login', {replace: true})
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