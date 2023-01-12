import React, {useState} from "react";
import {BackTop, Col, message, Radio, RadioChangeEvent, Row} from "antd";
import {PageContainer} from "@ant-design/pro-components";
import DictCard from "@/components/DictCard";
import {listMyDictByPage} from "@/services/dictService";

const IndexPage: React.FC = () => {
    // 控制显示布局
    const [layout, setLayout] = useState('half');

    /**
     * 加载我的数据
     * @param searchParams
     * @param setDataList
     * @param setTotal
     */
    const loadMyData = (
        searchParams: DictType.DictQueryRequest,
        setDataList: (dataList: DictType.Dict[]) => void,
        setTotal: (total: number) => void,
    ) => {
        listMyDictByPage(searchParams)
            .then((res) => {
                setDataList(res.data.records);
                setTotal(res.data.total);
            })
            .catch((e) => {
                message.error('加载失败，' + e.message);
            });
    };

    /**
     * 更改布局
     * @param e
     */
    const onLayoutChange = (e: RadioChangeEvent) => {
        setLayout(e.target.value);
    }

    return (
        <div id='indexPage'>
            <PageContainer
                title={
                    <>
                        使用现成的词库来生成特定数据，或用作研究数据集！
                    </>
                }
                extra={
                    <div style={{ marginLeft: 0 }}>
                        切换布局：
                        <Radio.Group onChange={onLayoutChange} value={layout}>
                            <Radio.Button value="input">公开</Radio.Button>
                            <Radio.Button value="half">同屏</Radio.Button>
                            <Radio.Button value="output">个人</Radio.Button>
                        </Radio.Group>
                    </div>
                }
            >
                <Row gutter={[12, 12]}>
                    {/* 配置表格 */}
                    <Col
                        xs={24}  // 屏幕 < 576px 沾满
                        xl={layout === 'half' ? 12 : 24}  // 屏幕 ≥ 1200px 如果选择了 half（同屏）那么只占一半，否则沾满
                        order={layout === 'output' ? 2 : 1}  // 栅格顺序（设置为2，（数字越大，顺序越靠后显示））
                    >
                        <DictCard title="公开词库" showTag={true} />
                    </Col>
                    {/* 结果 */}
                    <Col
                        xs={24}  // 屏幕 < 576px 沾满
                        xl={layout === 'half' ? 12 : 24}  // 屏幕 ≥ 1200px 如果选择了 half（同屏）那么只占一半，否则沾满
                        order={layout === 'output' ? 1 : 2}  // 栅格顺序（设置为1，（数字越小，顺序越靠前显示））
                    >
                        <DictCard title="个人词库" onLoad={loadMyData} needLogin />
                    </Col>
                </Row>
                {/* 回滚到顶部按钮 */}
                <BackTop />
            </PageContainer>
        </div>
    )
}

export default IndexPage;