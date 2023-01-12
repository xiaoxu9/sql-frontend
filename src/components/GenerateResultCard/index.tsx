import CodeEditor from '@/components/CodeEditor';
import { downloadDataExcel } from '@/services/sqlService';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Collapse,
    Empty,
    message,
    Space,
    Table,
    Tabs,
} from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';

interface Props {
    result?: GenerateVO;
    loading?: boolean;
    showCard?: boolean;
}

/**
 * 生成结果卡片
 *
 * @constructor
 * @author https://github.com/liyupi
 */
const GenerateResultCard: React.FC<Props> = (props) => {
    const { result, loading = false, showCard = true } = props;

    /**
     * 下载 excel 数据
     */
    const doDownloadDataExcel = async () => {
        if (!result) {
            return;
        }
        try {
            const res = await downloadDataExcel(result);
            // 下载文件
            const blob = new Blob([res]);
            const url = URL.createObjectURL(blob);
            const btn = document.createElement('a');
            btn.download = `${result.tableSchema.tableName}表数据.xlsx`;
            btn.href = url;
            btn.click();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            message.error('操作失败，' + e.message);
        }
    };

    /**
     * 生成表格列
     * @param tableSchema
     */
    const schemaToColumn = (tableSchema: TableSchema) => {
        if (!tableSchema?.fieldList) {
            return [];
        }
        return tableSchema.fieldList.map((column) => {
            return {
                title: column.fieldName,
                dataIndex: column.fieldName,
                key: column.fieldName,
            };
        });
    };

    const tabContent = result ? (
        // 选项卡切换组件
        <Tabs
            items={[
                {
                    label: `SQL 代码`,
                    key: 'createSql',
                    children: (
                        <>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<CopyOutlined />}
                                    onClick={(e) => {
                                        if (!result) {
                                            return;
                                        }
                                        copy(`${result.createSql}\n\n${result.insertSql}`);
                                        e.stopPropagation();
                                        message.success('已复制到剪切板');
                                    }}
                                >
                                    复制全部
                                </Button>
                            </Space>
                            <div style={{ marginTop: 16 }} />
                            <Collapse defaultActiveKey={['1', '2']}>
                                <Collapse.Panel
                                    key="1"
                                    header="建表语句"
                                    className="code-collapse-panel"
                                    extra={
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={(e) => {
                                                copy(result?.createSql);
                                                e.stopPropagation();
                                                message.success('已复制到剪切板');
                                            }}
                                        >
                                            复制
                                        </Button>
                                    }
                                >
                                    {/* 代码美化编辑面板组件 */}
                                    <CodeEditor value={result.createSql} language="sql" />
                                </Collapse.Panel>
                                <Collapse.Panel
                                    key="2"
                                    header="插入语句"
                                    className="code-collapse-panel"
                                    extra={
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={(e) => {
                                                copy(result?.insertSql);
                                                e.stopPropagation();
                                                message.success('已复制到剪切板');
                                            }}
                                        >
                                            复制
                                        </Button>
                                    }
                                >
                                    {/* 代码美化编辑面板组件 */}
                                    <CodeEditor value={result.insertSql} language="sql" />
                                </Collapse.Panel>
                            </Collapse>

                        </>
                    )
                },
                {
                    label: `模拟数据`,
                    key: 'mockData',
                    children: (
                        <>
                            <Space>
                                <Button
                                    icon={<DownloadOutlined />}
                                    type="primary"
                                    onClick={() => doDownloadDataExcel()}
                                >
                                    下载数据
                                </Button>
                            </Space>
                            <div style={{ marginTop: 16 }} />
                            <Table
                                bordered={true}  // 是否有边框
                                dataSource={result.dataList}  // 数据源
                                columns={schemaToColumn(result.tableSchema)}  // 表字段
                            />
                        </>
                    ),
                },
                {
                    label: `JSON 数据`,
                    key: 'dataJson',
                    children: (
                        <>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<CopyOutlined />}
                                    onClick={(e) => {
                                        if (!result) {
                                            return;
                                        }
                                        copy(`${result.dataJson}`);
                                        e.stopPropagation();
                                        message.success('已复制到剪切板');
                                    }}
                                >
                                    复制代码
                                </Button>
                            </Space>
                            <div style={{ marginTop: 16 }} />
                            {/* 代码美化编辑面板组件 */}
                            <CodeEditor value={result.dataJson} language="json" />

                        </>
                    )
                },
                {
                    label: `Java 代码`,
                    key: 'javaCode',
                    children: (
                        <>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<CopyOutlined />}
                                    onClick={(e) => {
                                        if (!result) {
                                            return;
                                        }
                                        copy(`${result.javaEntityCode}\n\n${result.javaObjectCode}`);
                                        e.stopPropagation();
                                        message.success('已复制到剪切板');
                                    }}
                                >
                                    复制全部
                                </Button>
                            </Space>
                            <div style={{ marginTop: 16 }} />
                            <Collapse defaultActiveKey={['1', '2']}>
                                <Collapse.Panel
                                    key="1"
                                    header="实体代码"
                                    className="code-collapse-panel"
                                    extra={
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={(e) => {
                                                copy(result?.javaEntityCode);
                                                e.stopPropagation();
                                                message.success('已复制到剪切板');
                                            }}
                                        >
                                            复制
                                        </Button>
                                    }
                                >
                                    {/* 代码美化编辑面板组件 */}
                                    <CodeEditor value={result.javaEntityCode} language="java" />
                                </Collapse.Panel>
                                <Collapse.Panel
                                    key="2"
                                    header="对象代码"
                                    className="code-collapse-panel"
                                    extra={
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={(e) => {
                                                copy(result?.javaObjectCode);
                                                e.stopPropagation();
                                                message.success('已复制到剪切板');
                                            }}
                                        >
                                            复制
                                        </Button>
                                    }
                                >
                                    {/* 代码美化编辑面板组件 */}
                                    <CodeEditor value={result.javaObjectCode} language="java" />
                                </Collapse.Panel>
                            </Collapse>

                        </>
                    )
                },
                {
                    label: `前端 代码`,
                    key: 'frontendCode',
                    children: (
                        <>
                            <div style={{ marginTop: 16 }} />
                            <Collapse defaultActiveKey={['1']}>
                                <Collapse.Panel
                                    key="1"
                                    header="实体代码"
                                    className="code-collapse-panel"
                                    extra={
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={(e) => {
                                                copy(result?.typescriptTypeCode);
                                                e.stopPropagation();
                                                message.success('已复制到剪切板');
                                            }}
                                        >
                                            复制
                                        </Button>
                                    }
                                >
                                    {/* 代码美化编辑面板组件 */}
                                    <CodeEditor value={result.typescriptTypeCode} language="typescript" />
                                </Collapse.Panel>
                            </Collapse>

                        </>
                    )
                },
            ]}
        ></Tabs>
    ) : (
        <Empty description="请先输入配置并点击【一键生成】" />
    );

    return showCard ? (
        <Card
            title="生成结果"
            loading={loading}
        >
            {tabContent}
        </Card>
    ) : (
        tabContent
    );
};

export default GenerateResultCard;
