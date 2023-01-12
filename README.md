# 智能 SQL 模拟数据生成器



`@umijs/max` 模板项目，更多功能参考 [Umi Max 简介](https://umijs.org/docs/max/introduce)



前端代码仓库：[https://github.com/xiaoxu9/sql-frontend](https://github.com/xiaoxu9/sql-frontend)

后端代码仓库：[https://github.com/xiaoxu9/sql-backend](https://github.com/xiaoxu9/sql-backend)


## 项目背景 
为了解决日常项目开发时反复写 SQL 建表和造数据的麻烦


## 应用场景
解决前端后端数据创建问题

1）通过填写可视化表单形式，快速生成建表语句！

2）支持多种快速导入方式，比如有现成的数据表，可以直接导入建表语句，一键生成模拟数据；还可以直接导入 Excel 表格，快速完成建表；
甚至还支持智能导入，输入几个单词就自动生成表格和数据！


## 功能大全

### 用户前台

- 可视化建表
- 快捷导入建表
    - 智能导入
    - 导入表
    - 导入配置
    - 导入建表 SQL
    - 导入 Excel
- 一键生成
    - SQL 建表、插入数据语句
    - 模拟数据
    - JSON 数据
    - Java 代码
    - 前端代码
- 多种模拟数据生成规则
    - 固定值
    - 随机值
    - 正则表达式
    - 递增
    - 定制词库
- 词库共享
    - 创建词库
    - 词库继承
    - 一键创建字典表
    - 根据词库生成模拟数据
- 表信息共享
    - 创建表信息
    - 一键复制建表语句
    - 一键导入表
- 字段共享
    - 创建字段
    - 一键复制创建字段语句
    - 一键导入字段
- 举报

### 管理后台

- 用户管理
- 词库管理
- 表信息管理
- 字段信息管理
- 举报管理

## 技术栈

### 前端

主要技术：

- React 18
- Umi 4.x
- Ant Design 4.x 组件库
- Ant Design Pro Components 高级组件
- TypeScript 类型控制
- Eslint 代码规范控制
- Prettier 美化代码

依赖库：

- monaco-editor 代码编辑器
- copy-to-clipboard 剪切板复制



### 后端

主要技术：

- Spring Boot 2.7.x
- MyBatis Plus 3.5.x
- MySQL 8.x
- Spring AOP

依赖库：

- FreeMarker：模板引擎
- Druid：SQL 解析
- datafaker：模拟数据
- Apache Commons Lang3：工具库
- Hutool：工具库
- Gson：Json 解析
- Easy Excel：Excel 导入导出
- Knife4j：接口文档生成
## 快速启动

### 后端

1. 运行 sql 目录下的 create_table.sql 建表
2. 修改 application.yml 中的数据库地址为自己的
3. 安装完 Maven 依赖后，直接运行即可
4. 已经编写好了 Dockerfile，支持 Docker 镜像部署。



### 前端

安装依赖：

```bash
npm run install
```

运行：

```bash
npm run dev
```

打包：

```bash
npm run build
```


### Schema 定义

用于保存表和字段的信息，结构如下：

```json
{
  "dbName": "库名",
  "tableName": "test_table",
  "tableComment": "表注释",
  "mockNum": 20,
  "fieldList": [{
    "fieldName": "username",
    "comment": "用户名",
    "fieldType": "varchar(256)",
    "mockType": "随机",
    "mockParams": "人名",
    "notNull": true,
    "primaryKey": false,
    "autoIncrement": false
  }]
}
```