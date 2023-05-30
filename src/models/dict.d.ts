/**
 * 词条类型定义
 */
declare namespace DictType {
    /**
     * 实体
     */
    interface Dict {
        id: number;
        name: string;  // 词条名
        content: string;  // 内容
        reviewStatus: number;  // 审核状态
        reviewMessage?: string;  // 审核消息
        userId: number;  // 用户id
        createTime: Date;  // 创建时间
        updateTime: Date;  // 更新时间
    }

    /**
     * 创建请求
     */
    interface DictAddRequest {
        name: string;
        content: string;
        reviewStatus: number;
    }

    /**
     * 更新请求
     */
    interface DictUpdateRequest {
        id: number;
        name?: string;
        content?: string;
        reviewStatus?: number;
        reviewMessage?: string;
    }

    /**
     * 查询请求
     */
    interface DictQueryRequest extends PageRequest {
        name?: string;
        content?: string;
        userId?: number;
        reviewStatus?: number;
    }
}