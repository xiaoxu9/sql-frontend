import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import { PageContainer } from '@ant-design/pro-components';
import {
    BackTop,
    Button,
    Card,
    Col,
    message,
    Radio,
    RadioChangeEvent,
    Row,
    Select,
    Space,
    Upload,
    UploadProps,
} from 'antd';
import {useSearchParams} from "@@/exports";
import FormInput from '@/components/FormInput';
import { generateBySchema, getSchemaByExcel } from '@/services/sqlService';
import './index.less'
import AutoInputModal from "@/components/AutoInputModal";
import JsonInputModal from "@/components/JsonInputModal";
import SqlInputModal from "@/components/SqlInputModal";
import ImportTableDrawer from "@/components/ImportTableDrawer";
import GenerateResultCard from "@/components/GenerateResultCard";
import { useParams } from 'umi';
import {generateCreateTableSql, getTableInfoById} from "@/services/tableInfoService";
import {generateCreateDictTableSql} from "@/services/dictService";


const IndexPage: React.FC = () => {
    // 控制显示布局
    const [layout, setLayout] = useState('half');
    // 存放生成代码结果对象
    const [result, setResult] = useState<GenerateVO>();
    // 控制表单是否显示
    const [autoInputModalVisible, setAutoInputModalVisible] = useState(false);
    const [jsonInputModalVisible, setJsonInputModalVisible] = useState(false);
    const [sqlInputModalVisible, setSqlInputModalVisible] = useState(false);
    const [importTableDrawerVisible, setImportTableDrawerVisible] =
        useState(false);
    // 控制是否显示加载中
    const [genLoading, setGenLoading] = useState(false);
    // 表单引用
    const formInputRef: any = useRef();
    // 搜索参数
    const [searchParams] = useSearchParams();
    // 根据表 id 字段从搜索参数中获取表 id
    const tableId = searchParams.get('table_id');

    /**
     * 根据 Schema 生成
     * @param values
     */
    const doGenerateBySchema = async (values: TableSchema) => {
        setGenLoading(true);
        try {
            const res = await generateBySchema(values);
            setResult(res.data);
            message.success('已生成');
        } catch (e: any) {
            message.error('生成错误，' + e.message);
        }
        setGenLoading(false);
    };

    /**
     * 更改布局
     * @param e
     */
    const onLayoutChange = (e: RadioChangeEvent) => {
        setLayout(e.target.value);
    };

    /**
     * 导入 tableSchema
     * @param tableSchema
     */
    const importTableSchema = (tableSchema: TableSchema) => {
        // 把导入的tableSchema设置到表单中
        formInputRef.current.setFormValues(tableSchema);
        // 关闭其它表单
        setAutoInputModalVisible(false);
        setJsonInputModalVisible(false);
        setSqlInputModalVisible(false);
        message.success('导入成功');
    };

    // 根据 url 参数导入表
    useEffect(() => {
        if (!tableId) {
            return;
        }
        getTableInfoById(Number(tableId))
            .then((res) => {
                const tableSchema = JSON.parse(res.data.content);
                importTableSchema(tableSchema);
            })
            .catch((e) => {
                message.error('导入表失败，' + e.message);
            });
    }, [tableId]);

    /**
     * Excel 上传组件属性
     */
    const uploadProps: UploadProps = {
        name: 'file',
        showUploadList: false,
        customRequest: async (options) => {
            if (!options) {
                return;
            }
            try {
                const res = await getSchemaByExcel(options.file);
                importTableSchema(res.data);
            } catch (e: any) {
                message.error('操作失败，' + e.message);
            }
        },
    };

    /**
     * 输入配置视图
     */
    const inputConfigView = (
        <Card
            title="输入配置"
            extra={
                <Select
                    defaultValue="MySQL"
                    style={{ width: 120 }}
                    disabled
                    options={[
                        {
                            value: 'MySQL',
                            label: 'MySQL',
                        },
                    ]}
                />
            }
        >
            <Space size="middle" wrap>
                <Button
                    type="primary"
                    ghost
                    onClick={() => setAutoInputModalVisible(true)}  // 点击时更改表单显示状态，触发显示表单
                >
                    智能导入
                </Button>
                <Button onClick={() => setImportTableDrawerVisible(true)}>
                    导入表
                </Button>
                <Button onClick={() => setJsonInputModalVisible(true)}>导入配置</Button>
                <Button onClick={() => setSqlInputModalVisible(true)}>
                    导入建表 SQL
                </Button>
                {/* 文件上传 */}
                <Upload {...uploadProps}>
                    <Button>导入 Excel</Button>
                </Upload>
            </Space>
            <div style={{ marginTop: 16 }} />
            <FormInput ref={formInputRef} onSubmit={doGenerateBySchema} />
        </Card>
    );

    return (
        <div id="indexPage">
            <PageContainer
                title={
                    <>
                        快速生成 SQL 和模拟数据，大幅提高开发测试效率！
                    </>
                }
                extra={
                    <div style={{ marginLeft: 0 }}>
                        切换布局：
                        <Radio.Group onChange={onLayoutChange} value={layout}>
                            <Radio.Button value="input">配置</Radio.Button>
                            <Radio.Button value="half">同屏</Radio.Button>
                            <Radio.Button value="output">结果</Radio.Button>
                        </Radio.Group>
                    </div>
                }
            >
                <Row gutter={[12, 12]}>
                    {/* 配置表格 */}
                    <Col
                        xs={24}  // 屏幕 < 576px 沾满
                        xl={layout === 'half' ? 12 : 24}  // 屏幕 ≥ 1200px 如果选择了 half（同屏）那么只占一半，否则沾满
                        order={layout === 'output' ? 2 : 1}  // 栅格顺序（设置为2，（数字越大，顺序越靠后显示））
                    >
                        { inputConfigView }
                    </Col>
                    {/* 结果 */}
                    <Col
                        xs={24}  // 屏幕 < 576px 沾满
                        xl={layout === 'half' ? 12 : 24}  // 屏幕 ≥ 1200px 如果选择了 half（同屏）那么只占一半，否则沾满
                        order={layout === 'output' ? 1 : 2}  // 栅格顺序（设置为1，（数字越小，顺序越靠前显示））
                    >
                        <GenerateResultCard result={result} loading={genLoading} />
                    </Col>
                </Row>
                {/* 回滚到顶部按钮 */}
                <BackTop />
            </PageContainer>
            {/* 智能导入按钮弹窗 */}
            <AutoInputModal
                onSubmit={importTableSchema}
                visible={autoInputModalVisible}
                onClose={() => setAutoInputModalVisible(false)}
            />
            {/* Json导入按钮弹窗 */}
            <JsonInputModal
                onSubmit={importTableSchema}
                visible={jsonInputModalVisible}
                onClose={() => setJsonInputModalVisible(false)}
            />
            <SqlInputModal
                onSubmit={importTableSchema}
                visible={sqlInputModalVisible}
                onClose={() => setSqlInputModalVisible(false)}
            />
            <ImportTableDrawer
                onImport={(tableInfo) => {
                    formInputRef.current.setFormValues(JSON.parse(tableInfo.content));
                    setImportTableDrawerVisible(false);
                    message.success('导入成功');
                }}
                visible={importTableDrawerVisible}
                onClose={() => setImportTableDrawerVisible(false)}
            />
        </div>
    );
}

export default IndexPage;