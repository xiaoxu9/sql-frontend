import Logo from '@/assets/logo.png';
import { userLogin } from '@/services/userService';
import { Link } from '@@/exports';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { message } from 'antd';
import { useSearchParams } from 'umi';
import React from "react";
import LoginBG from '@/assets/loginbg.png';
import './index.less'

/**
 * 用户登录页面
 *
 * @author https://github.com/xiaoxu9
 */
const Login: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { initialState, setInitialState } = useModel('@@initialState');

    /**
     * 用户登录
     */
    const doUserLogin = async (fields: UserType.UserLoginRequest) => {
        const hide = message.loading('登录中');
        try {
            const res = await userLogin(fields);
            //console.log("登录成功" + res.data);
            setInitialState({
                ...initialState,
                loginUser: res.data,
            } as InitialState);
            // 重定向到之前页面
            window.location.href = searchParams.get('register' ) ?? '/';
            //message.success("亲爱的 " + res.data.userName + " ,欢迎您登录智能SQL系统。当前时间为：" + Date.now() + " 祝您使用愉快！");
        }catch (e: any) {
            message.error(e.message);
        } finally {
            hide();
        }

    }
    return (
        <div
            style={{
                height: '100vh',
                //background:
                //    'url(https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png)',
                backgroundImage: `url(${LoginBG})`,
                backgroundSize: '100% 100%',
                //padding: '32px 0 24px',
            }}
        >
            <div
                style={{
                    paddingTop: '12%',
                }}
            >
                <LoginForm<UserType.UserLoginRequest>
                    logo={Logo}
                    title="智能SQL"
                    subTitle="快速生成代码和数据"
                    submitter={{  // 登录这个可省略，默认为 "登录"
                        searchConfig: {
                            submitText: '登录',
                        },
                    }}
                    onFinish={async (formData) => {
                        await doUserLogin(formData);
                    }}
                >
                    <>
                        <ProFormText
                            name="userAccount"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'请输入账号'}
                            rules={[
                                {
                                    required: true,
                                    message: '账号长度取值范围（4 - 16）个字符',
                                    min: 4,
                                    max: 16,
                                },
                            ]}
                        />
                        <ProFormText.Password
                            name="userPassword"
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'请输入密码！'}
                            rules={[
                                {
                                    required: true,
                                    message: '密码长度取值范围（8 - 16）个字符',
                                    min:8,
                                    max:16,
                                },
                            ]}
                        />
                    </>
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Link to="/user/register">新用户注册</Link>
                        <Link
                            to="/"
                            style={{
                                float: 'right',
                            }}
                        >
                            返回主页
                        </Link>
                    </div>
                </LoginForm>
            </div>
        </div>
    );
}

export default Login;