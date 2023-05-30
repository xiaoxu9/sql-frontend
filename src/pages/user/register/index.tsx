import { useNavigate } from '@umijs/max';
import React, {useEffect, useState} from 'react';
import {Col, Input, message, Statistic} from "antd";
import {getCheckCode, getCode, userRegister} from "@/services/userService";
import Logo from "@/assets/logo.png";
import {LoginForm, ProFormText} from "@ant-design/pro-components";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Link} from "@@/exports";
import LoginBG from '@/assets/loginbg.png';

const { Countdown } = Statistic;

/**
 * 用户注册页面
 *
 * @author https://github.com/xiaoxu9
 */
const Register: React.FC = () => {
    const navigate = useNavigate();
    // 记录验证码验证是否通过（0-默认，1-通过，2-失败）
    const [checkStatu, setCheStatu] = useState<number>(0)
    // 倒计时
    const [date, setDate] = useState(Date.now());

    /**
     * 用户注册
     * @param fields
     */
    const doUserRegister = async (fields: UserType.UserRegisterRequest) => {
        const hide = message.loading('注册中');
        if (checkStatu === 1) {
            try {
                await userRegister({...fields});
                // 还原验证码状态
                setCheStatu(0);
                // 更新验证码
                getCaptcha();
                hide();
                message.success('注册成功');
                // 跳转页面
                navigate('/user/login', {replace: true});
            } catch (e: any) {
                hide();
                message.error('注册失败，' + e.message);
            }
        } else {
            message.error("请确定验证码是否填写正确！")
        }

    };

    //const deadline = Date.now() + 1000 * 60;

    /**
     * 获取验证码以及验证码图片
     */
    const getCaptcha = async ()=>{
        try {
            const res = await getCode();
            // 设置倒计时
            setDate(Date.now() + 60 * 1000);
            const blob = new Blob([res]);
            let url = window.URL.createObjectURL(blob);
            let captchaImg = document.getElementById('captchaImg');
            if(captchaImg){
                // @ts-ignore
                captchaImg.src = url
                captchaImg.onload = function () {
                    URL.revokeObjectURL(url)
                }
            }
        } catch (e) {
            console.log(e)
        }

    }

    /**
     * 获取验证码校验
     */
    const handlerCheckCode = async (e : string) => {
        try {
            const res = await getCheckCode(e);
            if (res.data === true) {
                // 验证通过
                setCheStatu(1);
            } else {
                // 验证失败
                message.error(res.data);
                setCheStatu(2)
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(()=>{
        getCaptcha();
        setDate(Date.now() + 60*1000);
    }, [])

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
                    padding: '32px 0 24px',
                }}
            >
                <LoginForm<UserType.UserRegisterRequest>
                    logo={Logo}
                    title="智能SQL"
                    subTitle="快速生成代码和数据"
                    submitter={{
                        searchConfig: {
                            submitText: '注册',
                        },
                    }}
                    onFinish={async (formData) => {
                        await doUserRegister(formData);
                    }}
                >
                    <>
                        <ProFormText
                            name="userName"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'请输入用户名'}
                            rules={[
                                {
                                    required: true,
                                    message: '账号长度取值范围（4 - 16）个字符',
                                    min: 4,
                                    max: 16,
                                },
                            ]}
                        />
                        <ProFormText
                            name="userAccount"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'请输入账号（至少 4 位）'}
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
                            placeholder={'请输入密码（至少 8 位）'}
                            rules={[
                                {
                                    required: true,
                                    message: '密码长度取值范围（8 - 16）个字符',
                                    min:8,
                                    max:16,
                                },
                            ]}
                        />
                        <ProFormText.Password
                            name="checkPassword"
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined className={'prefixIcon'} />,
                            }}
                            placeholder={'请输入确认密码！'}
                            rules={[
                                {
                                    required: true,
                                    message: '密码长度取值范围（8 - 16）个字符',
                                    min:8,
                                    max:16,
                                },
                            ]}
                        />
                        <>
                            <Input status={checkStatu === 2 ? 'error' : undefined} placeholder={"请输入图中的验证码！"} required={true} onBlur={e => {handlerCheckCode(e.target.value)}}/>
                            <img
                                id='captchaImg'
                                alt="点击刷新"
                                onClick={()=>getCaptcha()}
                            />
                            <Col span={24} style={{ marginTop: 32 }}>
                                <Countdown title="" value={date} format=" s 秒" />
                            </Col>
                        </>

                    </>
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Link to="/user/login">老用户登录</Link>
                    </div>
                </LoginForm>
            </div>
        </div>
    );
}

export default Register;