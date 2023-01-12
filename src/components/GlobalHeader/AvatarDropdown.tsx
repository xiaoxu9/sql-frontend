import { useModel } from '@umijs/max';
import {Avatar, Button, Dropdown, Menu, message, Space} from "antd";
import type { MenuProps } from 'antd';
import { Link } from "@@/exports";
import React from 'react';
import { userLogout } from "@/services/userService";
import { history } from "umi";
import { stringify } from "querystring";
import {LogoutOutlined, UserOutlined} from "@ant-design/icons";

type MenuItem = Required<MenuProps>['items'][number];

/**
 * 登录菜单列表定义
 * @param label
 * @param key
 * @param children
 */
function getItem(
    label: React.ReactNode,
    key: React.Key,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        label,
        children,
    } as MenuItem;
}

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
            disabled: true,
        },
        {
            label: '退出登录',
            key: 'logout',
            icon: <LogoutOutlined />,
            danger: true,
        }
    ];
    const onClick: MenuProps['onClick'] = async (event) => {
        const { key } = event;
        //console.log(event);
        if ( key === 'logout') {
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
            return;
        }
    };

    return loginUser ? (
        // 已登录
        //<Menu
        //    onClick={onClick}
        //    style={{ width: 256 }}
        //    mode="inline"
        //    items={items}
        ///>
        <Dropdown menu={{ items, onClick }}>
            <a onClick={(e) => e.preventDefault()}>
                <Space>
                    <Avatar icon={<UserOutlined />} />
                </Space>
            </a>
        </Dropdown>
    ) : (
        // 未登录
        <>
            <Link to="/user/login">
                <Button type="primary" ghost style={{ marginRight: 16 }}>
                    登录
                </Button>
            </Link>
        </>
    )
}


export default AvatarDropdown;