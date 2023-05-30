import React from "react";
import {message, Modal, Typography} from "antd";
import { ProTable } from "@ant-design/pro-components";
import {ProColumns} from "@ant-design/pro-table/lib";
import {addFieldInfo} from "@/services/fieldInfoService";

interface Props {
    modalVisible: boolean;
    initialValues?: FieldInfoType.FieldInfo;  // 初始值
    onSubmit: () => void;  // 父组件暴露提交方法
    onCancel: () => void;  // 父组件暴露取消方法
}

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: FieldInfoType.FieldInfo) => {
    const hide = message.loading('正在添加');
    try {
        await addFieldInfo({ ...fields, reviewStatus: 3 } as FieldInfoType.FieldInfoAddRequest);
        hide();
        message.success('添加成功');
        return true;
    } catch (e: any) {
        hide();
        message.error('添加失败，' + e.message);
        return false;
    }
};

/**
 * 创建数据模态框
 * @param props
 * @constructor
 */
const FieldInfoCreateModal: React.FC<Props> = (props) => {
    const { modalVisible, initialValues, onSubmit, onCancel } = props;

    /**
     * 表格列配置
     */
    const columns: ProColumns<FieldInfoType.FieldInfo>[] = [
        {
            title: '名称',
            dataIndex: 'name',
            formItemProps: {
                rules: [{ required: true }],
            },
            fieldProps: {
                autoFocus: true,
                placeholder: '请输入中文名称',
            },
        },
        {
            title: '内容（不建议在此处修改）',
            dataIndex: 'content',
            valueType: 'textarea',
        },
    ];

    return(
        <Modal
            destroyOnClose
            title="保存字段信息（后续可直接导入）"
            open={modalVisible}
            onCancel={() => onCancel()}
            footer={null}
        >
            <Typography.Text type="secondary">注意，你提交的内容可能会被公开！</Typography.Text>
            <div style={{ marginBottom: 16 }} />
            <ProTable<FieldInfoType.FieldInfo, FieldInfoType.FieldInfo>
                form={{
                    initialValues,
                    submitter: {
                        render: (props, dom) => [...dom.reverse()]
                    },
                }}
                onSubmit={async (value) => {
                    const success = await handleAdd(value);
                    if (success) {
                        onSubmit?.();
                    }
                }}
                rowKey="id"
                type="form"
                columns={columns}
            >

            </ProTable>
        </Modal>
    )
}

export default FieldInfoCreateModal;