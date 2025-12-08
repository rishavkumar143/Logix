import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ editorContent, setEditorContent }) => {
  return (
    <div className="w-full flex-1 bg-[#1B1B1B]">
      <Editor
        height="100%"
        defaultLanguage="verilog"
        theme="vs-dark"
        value={editorContent}
        onChange={(value) => setEditorContent(value)}
        options={{
          fontSize: 14,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          wordWrap: "on",
        }}
      />
    </div>
  );
};

export default CodeEditor;
