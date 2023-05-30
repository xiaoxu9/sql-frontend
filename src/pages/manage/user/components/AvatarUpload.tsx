import React, {useEffect, useState} from 'react';
import {Button, message, Upload} from 'antd';
import {useModel} from "@@/exports";

interface AvatarUploadProps {
    id?: number;
}

const beforeUpload = (file: any) => {
    console.debug("file type:", file.type);
    const allowFormat = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!allowFormat) {
        message.error('只允许 JPG/PNG 文件!', 1)
    }
    const fileSize = file.size / 1024 / 1024 < 1;
    if (!fileSize) {
        message.error('图片应当小于1MB!', 1)
    }
    return allowFormat && fileSize;
}

const AvatarUpload: React.FC<AvatarUploadProps> = (props) => {
    const {initialState} = useModel('@@initialState');
    const loginUser = initialState?.loginUser;
    const [avatarState, setAvatarState] = useState<string | undefined>(loginUser?.userAvatar);

    useEffect(() => {
        if (loginUser != undefined) {
            loginUser.userAvatar = avatarState;
        }
    },[avatarState]);

    //@ts-ignore
    const handleChange = async({file, fileList }) => {
        //若文件上传成功 =>请求服务器成功
        if(file.status === 'done'){
            message.success("头像更换成功！");
            setAvatarState(file.response.data);    //response是后台返回的数据，url为服务器返回的图片地址，默认没有url
        }
    };

    return (
        <>
            <Upload
                name="avatar"
                action={`https://sql.xiaoxu9.cn/api/user/avatarUpload?id=${loginUser?.id}`}
                //action={`http://localhost:8081/api/user/avatarUpload?id=${loginUser?.id}`}
                method="POST"
                listType="picture"
                accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
                maxCount={1}
                beforeUpload={(file, fileList)=>{beforeUpload(file)}}
                onChange={handleChange}
            >
                <Button shape="round">更换头像</Button>
            </Upload>
        </>
    );
}

export default AvatarUpload;