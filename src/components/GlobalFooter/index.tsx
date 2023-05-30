import {
    GithubOutlined,
} from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';
import './index.less';

/**
 * 全局 Footer
 * @author https://github.com/xiaoxu9
 */
const GlobalFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <DefaultFooter
            className="default-footer"
            copyright={`${currentYear} 程序猿小许`}
            links={[
                {
                    key: 'github',
                    title: (
                        <>
                            <GithubOutlined /> Github
                        </>
                    ),
                    href: 'https://github.com/xiaoxu9',
                    blankTarget: true,
                },
                {
                    key: 'masterbeian',
                    title: (
                        <>
                            粤ICP备2023007087号-1
                        </>
                    ),
                    href: 'https://beian.miit.gov.cn/',
                    blankTarget: true,
                },
            ]}
        />
    )
}

export default GlobalFooter;