import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ editorContent, setEditorContent, fileName }) => {

  const displayName = fileName || "untitled.sv";

  const tabKey = `activeTab-${displayName}`;

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem(tabKey) || "code"    
  );

  useEffect(() => {
    localStorage.setItem(tabKey, activeTab);
  }, [activeTab, tabKey]);

  const storageKey = `explanation-${displayName}`;

  const [explanation, setExplanation] = useState(
    localStorage.getItem(storageKey) || ""
  );

  useEffect(() => {
    localStorage.setItem(storageKey, explanation);
  }, [explanation, storageKey]);

  return (
    <div className="w-full flex-1 flex flex-col bg-[#1B1B1B] border border-amber-50 rounded">

      <div className="flex items-center border-b border-gray-700 bg-[#111]">

        <button
         onClick={() => setActiveTab("code")}
          className={`px-4 py-2 font-semibold 
            ${activeTab === "code"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-400"
            }`}
        >
          Code <span className="text-gray-400">({displayName})</span>
        </button>

        <button
          onClick={() => setActiveTab("explanation")}
          className={`px-4 py-2 font-semibold 
            ${activeTab === "explanation"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-400"
            }`}
        >
          Explanation <span className="text-gray-400">({displayName})</span>
        </button>

      </div>

      <div className="flex-1 overflow-auto">

        {activeTab === "code" && (
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
        )}

        {activeTab === "explanation" && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={explanation}
            onChange={(value) => setExplanation(value)}
            options={{
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              minimap: { enabled: false },
              wordWrap: "on",
            }}
          />
        )}

      </div>
    </div>
  );
};

export default CodeEditor;
