/**
 * 表 Schema 类型
 */
interface TableSchema {
  dbName?: string;
  tableName: string;
  tableComment?: string;
  mockNum: number;
  fieldList: Field[];
}

/**
 * 列类型
 */
interface Field {
  fieldName: string;  // 字段名
  fieldType: string;  // 字段类型
  defaultValue?: string;  // 默认数据
  notNull?: boolean;  // 不空
  comment?: string;  // 注释
  primaryKey?: boolean;  // 主键
  autoIncrement?: boolean;  // 自动递增
  mockType: string;  // 模拟数据类型
  mockParams?: string;  // 模拟参数
  onUpdate?: string;  // 在更新
}

/**
 * 生成返回封装类型
 */
interface GenerateVO {
  tableSchema: TableSchema;
  createSql: string;
  insertSql: string;
  dataJson: string;
  dataList: Record<string, any>[];
  javaEntityCode: string;
  javaObjectCode: string;
  typeScriptTypeCode: string;
}

/**
 * 智能生成请求
 */
interface GenerateByAutoRequest {
  content: string;
}

/**
 * 根据 SQL 生成请求
 */
interface GenerateBySqlRequest {
  sql: string;
}
