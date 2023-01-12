import React from "react";
import {useModel} from "@umijs/max";
import {listFieldInfoByPage} from "@/services/fieldInfoService";
import {Drawer, message} from "antd";
import FieldInfoCard from "@/components/FieldInfoCard";

interface Props {
    onImport?: (values: FieldInfoType.FieldInfo) => void;
    visible: boolean;
    onClose: () => void;
}

/**
 * 导入字段抽屉
 *
 * @constructor
 * @author https://github.com/xiaoxu9
 */
const ImportFieldDrawer: React.FC<Props> = (props) => {
    const { visible, onImport, onClose } = props;
    const { initialState } = useModel('@@initialState');
    const loginUser = initialState?.loginUser;

    /**
     * 加载我的数据
     * @param searchParams
     * @param setDataList
     * @param setTotal
     */
    const loadMyData = loginUser ? (
        searchParams: FieldInfoType.FieldInfoQueryRequest,
        setDataList: (dataList: FieldInfoType.FieldInfo[]) => void,
        setTotal: (total: number) => void,
    ) => {
        listFieldInfoByPage(searchParams)
            .then(res => {
                setDataList(res.data.records);
                setTotal(res.data.total);
            }).catch(e => {
                message.error('加载失败，' + e.message);
            });
    } : undefined;

    return (
        <Drawer
            title="导入字段"
            contentWrapperStyle={{ width: '60%', minWidth: 320 }}
            open={visible}
            onClose={onClose}
        >
            {/* 字段信息卡片抽屉 组件 */}
            <FieldInfoCard title="导入字段" onLoad={loadMyData} onImport={onImport} />
        </Drawer>
    );
}

export default ImportFieldDrawer;