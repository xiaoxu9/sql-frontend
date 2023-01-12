import FieldInfoCreateModal from '@/components/FieldInfoModal/FieldInfoCreateModal';
import ImportFieldDrawer from '@/components/ImportFieldDrawer';
import TableInfoCreateModal from '@/components/TableInfoModal/TableInfoCreateModal';
import {
    COMMON_FIELD_LIST,
    DEFAULT_ADD_FIELD,
    FIELD_TYPE_LIST,
    MOCK_PARAMS_RANDOM_TYPE_LIST,
    MOCK_TYPE_LIST,
    ON_UPDATE_LIST,
} from '@/constants';
import { listMyDict } from '@/services/dictService';
import { DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import {
    AutoComplete,
    Button,
    Checkbox,
    Collapse,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Select,
    Space,
} from 'antd';
import copy from 'copy-to-clipboard';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';
import './index.less';

const { Option } = Select;

interface Props {
    onSubmit: (values: TableSchema) => void;
    ref: any;
}

/**
 * 表单输入
 *
 */
const FormInput: React.FC<Props> = forwardRef((props, ref) => {
    const { onSubmit } = props;
    const [form] = Form.useForm();
    const [dictList, setDictList] = useState<DictType.Dict[]>([]);
    const [fieldInfoCreateModalVisible, setFieldInfoCreateModalVisible] =
        useState(false);
    const [tableInfoCreateModalVisible, setTableInfoCreateModalVisible] =
        useState(false);
    const [createFieldInfo, setCreateFieldInfo] =
        useState<FieldInfoType.FieldInfo>();
    const [createTableInfo, setCreateTableInfo] =
        useState<TableInfoType.TableInfo>();
    const [importFieldDrawerVisible, setImportFieldDrawerVisible] =
        useState(false);
    // 导入字段的位置
    const [importIndex, setImportIndex] = useState(0);
    // 字段折叠面板展开的键
    const [activeKey, setActiveKey] = useState([]);

    const onFinish = (values: any) => {
        if (!values.fieldList || values.fieldList.length < 1) {
            message.error('至少添加1个字段');
            return;
        }
        console.log('Received values of form:', values);
        onSubmit?.(values);
    }

    /**
     * 字段类型选项
     */
    const fieldTypeOptions = FIELD_TYPE_LIST.map((field) => {
        return {
            label: field,
            value: field,
        };
    });

    // 获取可选词库列表
    const loadDictList = () => {
        listMyDict({})
            .then((res) => {
                setDictList(res.data);
            })
            .catch((e) => {
                message.error('加载词库失败，' + e.message);
            });
    };

    useEffect(() => {
        loadDictList();
    }, []);

    // 供父组件调用
    useImperativeHandle(ref, () => ({
        setFormValues: (tableSchema: TableSchema) => {
            form.setFieldsValue(tableSchema);
        },
    }));

    /**
     * 字段类型选项
     */
    const onUpdateOptions = ON_UPDATE_LIST.map((field) => {
        return {
            label: field,
            value: field,
        };
    });

    /**
     * AutoComplete 过滤函数
     * @param inputValue
     * @param option
     */
    // indexOf 返回调用String对象中指定值第一次出现的索引，从fromIndex开始搜索。如果没有找到该值，则返回-1。
    const filterOption = (inputValue: string, option: any) =>
        option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;

    return (
        <>
            <Form<TableSchema>
                className="form-input"
                form={form}
                scrollToFirstError
                onFinish={onFinish}
                onReset={() => {
                    form.resetFields(['fieldList']);
                }}
            >
                <Form.Item name="dbName" label="库名">
                    <Input placeholder="多个单词间建议用下划线分割" />
                </Form.Item>
                <Form.Item
                    name="tableName"
                    label="表名"
                    initialValue="test_table"   // 初始值
                    rules={[{required: true}]}  // 校验规则：required 是否必须
                >
                    <Input placeholder="多个单词间建议用下划线分割" />
                </Form.Item>
                <Form.Item name="tableComment" label="表注释">
                    <Input placeholder="描述表的中文名称、作用等" />
                </Form.Item>
                <Form.Item
                    name="mockNum"
                    label="生成条数"
                    initialValue={20}   // 初始值
                    rules={[{required: true}]}  // 校验规则：required 是否必须
                >
                    <InputNumber min={10} max={100} />
                </Form.Item>
                <Form.List name="fieldList" >
                    {(fields, { add, remove, move }) => (
                        <>
                            {/* <Collapse>折叠面板 */}
                            <Collapse
                                activeKey={activeKey}
                                onChange={(key)=>{
                                    setActiveKey(key as []); // 设置key并断言类型为空数组
                                }}
                            >
                                {fields.map((field, index) => (
                                    <Collapse.Panel
                                        key={field.key}
                                        header={  // 展示内容
                                            <Form.Item
                                                style={{ maxWidth: 320, marginBottom: 0}}
                                                label='字段名'
                                                requiredMark='optional'
                                                name={[field.name, 'fieldName']}
                                                rules={[{required: true}]}
                                            >
                                                <Input placeholder="建议用纯英文" />
                                            </Form.Item>
                                        }
                                        extra={  // 额外功能
                                            <Space className="field-toolbar">
                                                {index !== null && index > 0 && (
                                                    // 点击收起来隐藏
                                                    <Button
                                                        type="text"
                                                        onClick={(e) => {
                                                            move(index, index - 1);
                                                            e.stopPropagation();  // 阻止向上传播
                                                        }}
                                                    >
                                                        <UpOutlined />
                                                    </Button>
                                                )}
                                                {index !== null && index < fields.length - 1 && (
                                                    // 点击下拉显示
                                                    <Button
                                                        type="text"
                                                        onClick={(e) => {
                                                            move(index, index + 1);
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <DownOutlined />
                                                    </Button>
                                                )}
                                                <Button
                                                    type="text"
                                                    onClick={(e) => {
                                                        const fieldInfo = form.getFieldsValue().fieldList[index];
                                                        // 设置到字段信息状态中
                                                        setCreateFieldInfo({
                                                            name: fieldInfo.comment,
                                                            content: JSON.stringify(fieldInfo),
                                                        } as FieldInfoType.FieldInfo);
                                                        // 弹出字段信息创建窗口
                                                        setFieldInfoCreateModalVisible(true);
                                                        e.stopPropagation();  // 阻止传播
                                                    }}
                                                >
                                                    保存
                                                </Button>
                                                <Button
                                                    type="text"
                                                    danger
                                                    onClick={(e) => {
                                                        remove(field.name);
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    删除
                                                </Button>
                                            </Space>
                                        }
                                    >
                                        <Space key={field.key} align="baseline" wrap size={[24, 0]}>
                                            <Form.Item
                                                label="字段类型"
                                                name={[field.name, 'fieldName']}
                                                rules={[{required: true}]}
                                            >
                                                <AutoComplete
                                                    options={fieldTypeOptions}
                                                    style={{ width: 120 }}
                                                    placeholder="请输入"
                                                    filterOption={filterOption}  // 根据输入项进行筛选
                                                />
                                            </Form.Item>
                                            <Form.Item label="默认值" name={[field.name, 'defaultValue']}>
                                                <Input placeholder="要和字段类型匹配" />
                                            </Form.Item>
                                            <Form.Item label="注释" name={[field.name, 'comment']}>
                                                <Input placeholder="描述中文名称、作用等" />
                                            </Form.Item>
                                            <Form.Item label="onUpdate" name={[field.name, 'onUpdate']}>
                                                <AutoComplete
                                                    options={onUpdateOptions}
                                                    style={{ width: 180 }}
                                                    placeholder="请输入"
                                                    filterOption={filterOption}  // 根据输入项进行筛选
                                                />
                                            </Form.Item>
                                            <Form.Item label="非空" name={[field.name, 'notNull']} valuePropName="checked">
                                                <Checkbox />
                                            </Form.Item>
                                            <Form.Item label="主键" name={[field.name, 'primaryKey']} valuePropName="checked">
                                                <Checkbox />
                                            </Form.Item>
                                            <Form.Item label="自增" name={[field.name, 'autoIncrement']} valuePropName="checked">
                                                <Checkbox />
                                            </Form.Item>
                                            <Form.Item label="模拟类型" name={[field.name, 'mockType']} initialValue="固定">
                                                <Select
                                                    style={{ width: 120 }}
                                                    onChange={() => {
                                                        form.setFieldValue(
                                                            ['fieldList', index, 'mockParams'],
                                                            '',
                                                        );
                                                    }}
                                                >
                                                    {MOCK_TYPE_LIST.map((item) => (
                                                        <Option key={item} value={item}>{item}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                noStyle  // 纯粹无样式绑定组件
                                                // 判断是否需要更新
                                                shouldUpdate={(prevValues, curValues) => {
                                                    return (
                                                        // 比较老的模拟数据类型和新的模拟数据类型是否一致，一致返回false，不一致返回true（需要更新）
                                                        prevValues.fieldList[index]?.mockType !==
                                                            curValues.fieldList[index]?.mockType
                                                    );
                                                }}
                                            >
                                                {(value) => {
                                                    const mockType = value.getFieldsValue().fieldList[index].mockType;
                                                    switch (mockType) {
                                                        case '固定':
                                                            return (
                                                                <Form.Item
                                                                    label="固定值"
                                                                    name={[field.name, 'mockParams']}
                                                                >
                                                                    <Input placeholder="请输入固定值"/>
                                                                </Form.Item>
                                                            );
                                                        case '随机':
                                                            return (
                                                                <Form.Item
                                                                    label="随机规则"
                                                                    name={[field.name, 'mockParams']}
                                                                >
                                                                    <Select style={{ width: 120}}>
                                                                        {MOCK_PARAMS_RANDOM_TYPE_LIST.map(item => (
                                                                            <Option key={item} value={item}>{item}</Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                            );
                                                        case '规则':
                                                            return (
                                                                <Form.Item
                                                                    label="规则"
                                                                    name={[field.name, 'mockParams']}
                                                                    rules={[{required: true}]}
                                                                >
                                                                    <Input placeholder="请输入正则表达式"/>
                                                                </Form.Item>
                                                            );
                                                        case '递增':
                                                            return (
                                                                <Form.Item
                                                                    label="起始值"
                                                                    name={[field.name, 'mockParams']}
                                                                    rules={[{required: true}]}
                                                                >
                                                                    <InputNumber />
                                                                </Form.Item>
                                                            )
                                                        case '词库':
                                                            return (
                                                                <Form.Item
                                                                    label="词库"
                                                                    name={[field.name, 'mockParams']}
                                                                    rules={[{required: true}]}
                                                                >
                                                                    <Select
                                                                        style={{ width: 150 }}
                                                                        showSearch
                                                                        dropdownRender={(menu => (
                                                                            <>
                                                                                {menu}
                                                                                <Divider style={{ margin: '8px 0'}} />
                                                                                <Space
                                                                                    align="center"
                                                                                    size={24}
                                                                                    style={{
                                                                                        marginLeft: 8,
                                                                                    }}
                                                                                >
                                                                                    <Button
                                                                                        size="small"
                                                                                        onClick={()=>{
                                                                                            window.open('/dict/add');
                                                                                        }}
                                                                                    >
                                                                                        创建
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="small"
                                                                                        onClick={()=>{
                                                                                            loadDictList();
                                                                                        }}
                                                                                    >
                                                                                        刷新
                                                                                    </Button>
                                                                                </Space>
                                                                            </>
                                                                        ))}
                                                                    >{dictList.map(item => (
                                                                        <Option key={item.id} value={item.id}>{item.name}</Option>
                                                                    ))}</Select>
                                                                </Form.Item>
                                                            );
                                                        default:
                                                            return <></>;
                                                    }
                                                }}
                                            </Form.Item>
                                        </Space>
                                    </Collapse.Panel>
                                ))}
                            </Collapse>
                            <Form.Item>
                                <Space
                                    direction="vertical"
                                    style={{ width: '100%', marginTop: 16 }}
                                >
                                    <Button
                                        type="dashed"
                                        onClick={() => add(DEFAULT_ADD_FIELD)}
                                        block  // 将按钮宽度调整为其父宽度的选项
                                        icon={<PlusOutlined />}
                                    >
                                        新增字段
                                    </Button>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            setImportIndex(
                                                form.getFieldsValue().fieldList?.length ?? 0,
                                            );
                                            setImportFieldDrawerVisible(true);
                                        }}
                                        block  // 将按钮宽度调整为其父宽度的选项
                                        icon={<PlusOutlined />}
                                    >
                                        导入字段
                                    </Button>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            COMMON_FIELD_LIST.forEach((field) => {
                                                add(field);
                                            });
                                        }}
                                        block  // 将按钮宽度调整为其父宽度的选项
                                        icon={<PlusOutlined />}
                                    >
                                        新增通用字段
                                    </Button>
                                </Space>
                            </Form.Item>
                            {/* 导入字段抽屉 */}
                            <ImportFieldDrawer
                                onImport={(fieldInfo) => {
                                    // 装换为json格式
                                    add(JSON.parse(fieldInfo.content), importIndex);
                                    // 关闭导入字段抽屉
                                    setImportFieldDrawerVisible(false);
                                    message.success('导入成功');
                                }}
                                // 控制显示隐藏
                                visible={importFieldDrawerVisible}
                                // 关闭导入字段抽屉
                                onClose={() => setImportFieldDrawerVisible(false)}
                            />
                        </>
                    )}
                </Form.List>
                <Form.Item>
                    <Space size="large" wrap>
                        {/* htmlType="submit" 表示点击此按钮时，自动提交表单 */}
                        <Button type="primary" htmlType="submit" style={{ width: 180 }}>一键生成</Button>
                        <Button onClick={() => {
                            const fieldList = form.getFieldsValue().fieldList;
                            if (!fieldList || fieldList.length < 1) {
                                message.error('至少新增1个字段');
                                return;
                            }
                            const values = form.getFieldsValue();
                            // 设置创建表信息状态
                            setCreateTableInfo({
                                name: values.tableComment,
                                content: JSON.stringify(values),
                            } as TableInfoType.TableInfo);
                            // 设置添加字段表单为可显示状态
                            setTableInfoCreateModalVisible(true);
                        }}>
                            保存表
                        </Button>
                        <Button
                            onClick={() => {
                                // 拷贝到粘贴板
                                copy(JSON.stringify(form.getFieldsValue()));
                                message.success('已复制到剪贴板')
                            }}
                        >
                            复制配置
                        </Button>
                         {/*htmlType="reset" 表示点击此按钮时，自动删除重置表单 */}
                        <Button htmlType="reset">重置</Button>
                    </Space>
                </Form.Item>
            </Form>
            <FieldInfoCreateModal
                modalVisible={fieldInfoCreateModalVisible}
                initialValues={createFieldInfo}
                onSubmit={() => setFieldInfoCreateModalVisible(false)}
                onCancel={() => setFieldInfoCreateModalVisible(false)}
            />
            <TableInfoCreateModal
                modalVisible={tableInfoCreateModalVisible}
                initialValues={createTableInfo}
                onSubmit={() => setTableInfoCreateModalVisible(false)}
                onCancel={() => setTableInfoCreateModalVisible(false)}
            />
        </>
    )
})

export default FormInput;