import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({
  editorContent,
  setEditorContent,
  fileName,
  projectFiles,
  activeFile,
  setActiveFile
}) => {

  const displayName = fileName || "untitled.sv";

  // ACTIVE TAB RESTORE
  const tabKey = `activeTab-${displayName}`;

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem(tabKey) || "code"
  );

  useEffect(() => {
    localStorage.setItem(tabKey, activeTab);
  }, [activeTab, tabKey]);

  // EXPLANATION RESTORE
  const explanationKey = `explanation-${displayName}`;

  const [explanation, setExplanation] = useState(
    localStorage.getItem(explanationKey) || ""
  );

  useEffect(() => {
    localStorage.setItem(explanationKey, explanation);
  }, [explanation, explanationKey]);


  // WHEN SELECTING A FILE FROM DROPDOWN
  const handleFileSwitch = (path) => {
    const selected = projectFiles.find(f => f.webkitRelativePath === path);
    if (!selected) return;

    setActiveFile(projectFiles.indexOf(selected));
    setEditorContent(selected.content);
    setExplanation(localStorage.getItem(`explanation-${selected.name}`) || "");
    localStorage.setItem("fileName", selected.name);
  };


  // SHOW PLACEHOLDER WHEN CODE EMPTY
  const showPlaceholder =
    activeTab === "code" && editorContent.trim() === "";


  return (
    <div className="w-full flex-1 flex flex-col bg-[#1B1B1B] border border-amber-50 rounded relative">

      {/* TABS + DROPDOWN */}
      <div className="flex items-center border-b border-gray-700 bg-[#111]">

        {/* CODE TAB */}
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "code"
              ? "text-white border-b-2 border-orange-500"
              : "text-gray-400"
          }`}
        >
          Code <span className="text-gray-500 text-sm">({displayName})</span>
        </button>

        {/* EXPLANATION TAB */}
        <button
          onClick={() => setActiveTab("explanation")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "explanation"
              ? "text-white border-b-2 border-orange-500"
              : "text-gray-400"
          }`}
        >
          Explanation <span className="text-gray-500 text-sm">({displayName})</span>
        </button>

        {/* DROPDOWN RIGHT SIDE */}
        {projectFiles.length > 0 && (
          <div className="ml-auto relative flex items-center pr-3">

            <select
              className="bg-[#222] text-gray-300 text-sm px-3 py-1 rounded-md border cursor-pointer hover:border-blue-400 hover:text-blue-400"
              value={projectFiles[activeFile]?.webkitRelativePath || ""}
              onChange={(e) => handleFileSwitch(e.target.value)}
            >
              {projectFiles.map((file, index) => (
                <option
                  key={index}
                  value={file.webkitRelativePath}
                  title={file.webkitRelativePath} // hover full path
                >
                  {file.name}
                </option>
              ))}
            </select>

          </div>
        )}

      </div>

      {/* EDITOR AREA */}
      <div className="flex-1 overflow-auto relative">

        {/* CODE TAB */}
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

        {/* EXPLANATION TAB */}
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
              minimap: { enabled: false },
              lineNumbers: "on",
              wordWrap: "on",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
