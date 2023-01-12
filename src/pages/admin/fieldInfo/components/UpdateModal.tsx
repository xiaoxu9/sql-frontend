import { ProColumns, ProTable } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import React, { PropsWithChildren } from 'react';
import {updateFieldInfo} from "@/services/fieldInfoService";

interface UpdateModalProps {
    oldData: FieldInfoType.FieldInfo;
    modalVisible: boolean;
    columns: ProColumns<FieldInfoType.FieldInfo>[];
    onSubmit: () => void;
    onCancel: () => void;
    onOk: () => void;
}

/**
 * 更新数据模态框
 * @param fields
 */
const handleUpdate = async (fields: FieldInfoType.FieldInfo) => {
    const hide = message.loading('正在更新');
    try {
        await updateFieldInfo(fields);
        hide();

        message.success('更新成功');
        return true;
    } catch (error) {
        hide();
        message.error('更新失败请重试！');
        return false;
    }
};

/**
 * 更新数据模态框
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<PropsWithChildren<UpdateModalProps>> = (props) => {
    const { oldData, columns, modalVisible, onSubmit, onCancel, onOk } = props;

    return (
        <Modal
            destroyOnClose
            title="更新"
            visible={modalVisible}
            onCancel={() => onCancel()}
            footer={null}
        >
            <ProTable<FieldInfoType.FieldInfo, FieldInfoType.FieldInfo>
                onSubmit={async (values) => {
                    const success = await handleUpdate({
                        ...values,
                        id: oldData.id,
                    });
                    if (success) {
                        onSubmit?.();
                    }
                    onOk();
                }}
                rowKey="id"
                type="form"
                form={{
                    initialValues: oldData,
                }}
                columns={columns}
            />
        </Modal>
    );
};

export default UpdateModal;
