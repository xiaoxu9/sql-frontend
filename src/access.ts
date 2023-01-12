/**
 * 按照初始化数据定义项目中的权限，统一管理
 * 参考文档 https://next.umijs.org/docs/max/access
 * @param initialState
 */
export default (initialState: InitialState) => {
    const canUser = !!initialState.loginUser;  // 判断是否存在 （null、undefined、0 时， 返回false）
    const canAdmin =
        initialState.loginUser && initialState.loginUser.userRole === 'admin';  // 判断已登录，并且是管理员
    return {
        canUser,
        canAdmin,
    };
};