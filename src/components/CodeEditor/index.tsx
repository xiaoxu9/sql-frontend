import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface Props {
    value: string;
    language?: string;
    height?: number;
    onChange?: (value: string) => void;
}

/**
 * 代码编辑器
 * @constructor
 * @author https://github.com/xiaoxu9
 */
const CodeEditor: React.FC<Props> = (props) => {
    const {value, height = 480, language = 'sql', onChange} = props;

    const options = {
        selectOnLineNumbers: true,  // 是否显示行号
        fontSize: 14,  // 字体大小
        formatOnPaste: true,  // 格式粘贴
        automaticLayout: true,  // 是否自动布局
        minimap: {  // 是否启用小地图
            enabled: false,
        },
    };

    return (
        <MonacoEditor
            height={height}
            language={language}  // 解析语言
            theme="vs-dark"  // 编辑器主题
            value={value}
            options={options}
            onChange={onChange}
            // editorDidMount={editorDidMount}
        />
    )
}

export default CodeEditor;