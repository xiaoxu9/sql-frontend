import {useModel} from '@umijs/max';
import {Alert, Avatar, Button, Dropdown, message, Space} from "antd";
import type {MenuProps} from 'antd';
import {Link} from "@@/exports";
import React, {useEffect} from 'react';
import {getLoginUserAvatar, userLogout} from "@/services/userService";
import {history} from "umi";
import {stringify} from "querystring";
import {LogoutOutlined, UserOutlined} from "@ant-design/icons";
import Marquee from 'react-fast-marquee';
import moment from "moment";

/**
 * 头像下拉菜单
 */
const AvatarDropdown: React.FC = () => {
    const {initialState, setInitialState} = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    const items: MenuProps['items'] = [
        {
            label: loginUser?.userAccount ?? '无名',
            key: 'login',
        },
        {
            label: '退出登录',
            key: 'logout',
            icon: <LogoutOutlined/>,
            danger: true,
        }
    ];
    const onClick: MenuProps['onClick'] = async (event) => {
        const {key} = event;
        //console.log(event);
        if (key === 'logout') {
            try {
                await userLogout();
                message.success('已退出登录');
            } catch (e: any) {
                message.error('操作失败');
            }
            // 更新前端状态
            await setInitialState({...initialState, loginUser: undefined});
            // 跳转到登录页面
            history.replace({
                pathname: '/user/login',
                search: stringify({
                    redirect: window.location.href
                }),
            });
        }
        if (key === 'login') {
            // 跳转到登录页面
            history.replace({
                pathname: '/manage/user',
                search: stringify({
                    redirect: window.location.href
                }),
            });
        }
    };

    const getUserAvatar = async (id: number) => {
        try {
            const res = await getLoginUserAvatar(id);
            let blob = new Blob([res]);
            let url = window.URL.createObjectURL(blob);
            let avatarImage = document.getElementById('avatarImage');
            if(avatarImage){
                // @ts-ignore
                avatarImage.src = url
                avatarImage.onload = function () {
                    URL.revokeObjectURL(url)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(()=>{
        getUserAvatar(loginUser?.id || -1)
    },[loginUser?.userAvatar])

    return (
        <div className="rightHead">
            {
                loginUser?.id !== undefined ? (
                    <Alert
                        banner
                        style={{backgroundColor: '#eaf0e9'}}
                        message={
                            <Marquee pauseOnHover gradient={false}>
                                亲爱的  {loginUser?.userName} ,欢迎您登录智能SQL系统。当前时间为：{moment().format('YYYY年MM月DD日')}  祝您使用愉快！
                            </Marquee>
                        }
                    />
                ) : <></>
            }
            {
                loginUser ? (
                    // 已登录
                    <Dropdown menu={{items, onClick}}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                <Avatar icon={loginUser.userAvatar === undefined ? <UserOutlined /> :  <img id="avatarImage"/>} />
                            </Space>
                        </a>
                    </Dropdown>
                ) : (
                    // 未登录
                    <>
                        <Link to="/user/login">
                            <Button type="primary" shape="round" ghost style={{marginRight: 16}}>
                                登录
                            </Button>
                        </Link>
                    </>
                )
            }
        </div>

    )
}

export default AvatarDropdown;