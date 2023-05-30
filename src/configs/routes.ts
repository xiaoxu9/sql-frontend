/**
 * 路由
 * 配置参考：https://umijs.org/docs/max/layout-menu#%E6%89%A9%E5%B1%95%E7%9A%84%E8%B7%AF%E7%94%B1%E9%85%8D%E7%BD%AE
 */
export default [
    {
        name: '代码生成',
        path: '/',
        component: 'index',
        routes: [
            {
                name: '代码生成',
                path: '/user/:table_id',
                component: 'index',
                hideInMenu: true,  // 隐藏自己和子菜单
            },
        ],
    },
    {
        name: '词库大全',
        path: '/dict/all',
        component: 'dict',
    },
    {
        name: '表大全',
        path: '/table/all',
        component: 'tableInfo',
    },
    {
        name: '字段大全',
        path: '/field/all',
        component: 'fieldInfo',
    },
    {
        name: '创建词库',
        path: '/dict/add',
        component: 'dict/add',
        wrappers: [
            '@/wrappers/auth',
        ],
    },
    {
        name: '创建词库成功',
        path: '/dict/add_result',
        component: 'dict/add_result',
        hideInMenu: true,  // 隐藏自己和子菜单
        wrappers: [
            '@/wrappers/auth',
        ],
    },
    {
        path: '/user',
        hideInMenu: true,
        headerRender: false,  // 不展示顶栏
        routes: [
            {
                name: '用户登录',
                path: '/user/login',
                component: 'user/login',
            },
            {
                name: '用户注册',
                path: '/user/register',
                component: 'user/register',
            },
        ],
    },
    {
        path: '/manage',
        access: 'canUser',
        name: '管理',
        // flatMenu: true,
        routes: [
            {
                name: '用户管理',
                path: '/manage/user',
                component: 'manage/user',
            },
            {
                name: '词库管理',
                path: '/manage/dict',
                component: 'manage/dict',
            },
            {
                name: '表管理',
                path: '/manage/table',
                component: 'manage/tableInfo',
            },
            {
                name: '字段管理',
                path: '/manage/field',
                component: 'manage/fieldInfo',
            },
            {
                name: '举报管理',
                path: '/manage/report',
                component: 'manage/report',
            },
        ],
    },
];