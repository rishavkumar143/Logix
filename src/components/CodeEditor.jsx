import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({
  editorContent,
  setEditorContent,

  fileName,
  setFileName,

  projectFiles,
  activeFile,
  setActiveFile,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = fileName?.trim() !== "" ? fileName : "";

  const tabKey = `activeTab-${displayName || "blank"}`;

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem(tabKey) || "code"
  );

  useEffect(() => {
    localStorage.setItem(tabKey, activeTab);
  }, [activeTab, tabKey]);

  const explanationKey = `explanation-${displayName || "blank"}`;

  const [explanation, setExplanation] = useState(
    localStorage.getItem(explanationKey) || ""
  );

  useEffect(() => {
    localStorage.setItem(explanationKey, explanation);
  }, [explanation, explanationKey]);

  const handleFileSwitch = (path) => {
    const selected = projectFiles.find((f) => f.webkitRelativePath === path);
    if (!selected) return;

    const index = projectFiles.indexOf(selected);
    setActiveFile(index);

    setEditorContent(selected.content);
    setFileName(selected.name);
    localStorage.setItem("fileName", selected.name);

    setExplanation(localStorage.getItem(`explanation-${selected.name}`) || "");

    setShowDropdown(false);
  };

  const showPlaceholder = activeTab === "code" && editorContent.trim() === "";

  return (
    <div className="w-full flex-1 flex flex-col bg-[#1B1B1B] border border-amber-50 rounded relative">
      <div className="flex items-center border-b border-gray-700 bg-[#111]">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "code"
              ? "text-white border border-blue-400 "
              : "text-gray-400"
          }`}
        >
          Code{" "}
          {displayName && (
            <span className="text-gray-500 text-sm">({displayName})</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("explanation")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "explanation"
              ? "text-white border border-blue-400 "
              : "text-gray-400"
          }`}
        >
          Explanation{" "}
          {displayName && (
            <span className="text-gray-500 text-sm">({displayName})</span>
          )}
        </button>
      </div>

      {projectFiles.length > 0 && (
        <div className="w-full bg-[#111] border-b border-gray-700 px-3 py-2">
          <div className="relative w-64" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-[#1E1E1E] text-white text-sm px-3 py-2 rounded-md 
                         border-2 border-white hover:border-blue-400 hover:text-blue-400
                         text-left shadow-md"
            >
              {projectFiles[activeFile]?.name || "Select file"}
            </button>

            {showDropdown && (
              <div
                className="absolute mt-1 w-full bg-gray-800 border border-blue-400
                           rounded-md shadow-lg z-50 py-1 
                           overflow-hidden select-none"
              >
                {projectFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleFileSwitch(file.webkitRelativePath)}
                    className="px-3 py-2 text-blue-400 cursor-pointer text-sm 
                               hover:bg-gray-600 hover:text-white transition-all"
                    title={file.webkitRelativePath}
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative">
        {activeTab === "code" && (
          <Editor
            height="100%"
            defaultLanguage="verilog"
            theme="vs-dark"
            value={editorContent}
            onChange={() => {}}
            options={{
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbersMinChars: 3,
              minimap: { enabled: false },
              wordWrap: "on",
              // readOnly: true,
              readOnly: false,
              domReadOnly: true,
            }}
          />
        )}

        {activeTab === "explanation" && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={explanation}
            onChange={() => {}}
            options={{
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
              lineNumbers: "on",
              wordWrap: "on",
              readOnly: true,
              domReadOnly: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
