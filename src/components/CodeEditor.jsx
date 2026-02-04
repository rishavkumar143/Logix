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

  const displayName = fileName?.trim() !== "" ? fileName : "";

  /* ================= ACTIVE TAB ================= */
  const activeTabKey = `activeTab-${displayName || "blank"}`;
  const [activeTab, setActiveTab] = useState("code");

  useEffect(() => {
    localStorage.setItem(activeTabKey, activeTab);
  }, [activeTab, activeTabKey]);

  /* ================= EXPLANATION ================= */
  const explanationKey = `explanation-${displayName || "blank"}`;
  const [explanation, setExplanation] = useState(
    localStorage.getItem(explanationKey) || ""
  );

  useEffect(() => {
    localStorage.setItem(explanationKey, explanation);
  }, [explanation, explanationKey]);

  /* ================= TESTBENCH ================= */
  const testbenchKey = `testbench-${displayName || "blank"}`;

  const [testbench, setTestbench] = useState(
    localStorage.getItem(testbenchKey) || ""
  );

  const [showTestbenchTab, setShowTestbenchTab] = useState(
    !!localStorage.getItem(testbenchKey)
  );

  useEffect(() => {
    if (showTestbenchTab) {
      localStorage.setItem(testbenchKey, testbench);
    }
  }, [testbench, testbenchKey, showTestbenchTab]);

  /* ================= GLOBAL API SETTERS ================= */
  useEffect(() => {
    window.setExplanationFromAPI = (text) => {
      setExplanation(text);
      if(text && text.trim()){
      setActiveTab("explanation");
    }
    };

    window.setTestbenchFromAPI = (code) => {
      setTestbench(code);
      setShowTestbenchTab(true);
      setActiveTab("testbench");
    };
    window.resetTestBenchUI = () =>{
      setTestbench("");
      setShowTestbenchTab(false);
      setActiveTab("code");
      localStorage.removeItem(testbenchKey);
    }

    return () => {
      delete window.setExplanationFromAPI;
      delete window.setTestbenchFromAPI;
      delete window.resetTestBenchUI;
    };
  }, []);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= FILE SWITCH ================= */
  const handleFileSwitch = (index) => {
    const selected = projectFiles[index];
    if (!selected) return;

    setActiveFile(index);
    setEditorContent(selected.content);
    setFileName(selected.name);

    localStorage.setItem("activeFile", index.toString());

    setExplanation(
      localStorage.getItem(`explanation-${selected.name}`) || ""
    );

    const tb = localStorage.getItem(`testbench-${selected.name}`) || "";
    setTestbench(tb);
    setShowTestbenchTab(!!tb);

    const recent = JSON.parse(localStorage.getItem("recentFiles") || "[]");
    const updated = [
      { name: selected.name, content: selected.content },
      ...recent.filter((f) => f.name !== selected.name),
    ].slice(0, 15);

    localStorage.setItem("recentFiles", JSON.stringify(updated));
    window.dispatchEvent(new Event("recentFilesUpdated"));

    setShowDropdown(false);
  };

  /* ================= UI ================= */
  return (
    <div className="w-full flex-1 flex flex-col bg-[#1B1B1B] border border-amber-50 rounded relative">
      {/* ================= TABS ================= */}
      <div className="flex items-center border-b border-gray-700 bg-[#111]">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "code"
              ? "text-white border border-blue-400"
              : "text-gray-400"
          }`}
        >
          Code {displayName && <span className="text-sm">({displayName})</span>}
        </button>
        {explanation && (
        <button
          onClick={() => setActiveTab("explanation")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "explanation"
              ? "text-white border border-blue-400"
              : "text-gray-400"
          }`}
        >
          Explanation{" "}
          {displayName && <span className="text-sm">({displayName})</span>}
        </button>
      )}
        {/* {showTestbenchTab && (
          <button
            onClick={() => setActiveTab("testbench")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "testbench"
                ? "text-white border border-blue-400"
                : "text-gray-400"
            }`}
          >
            Testbench{" "}
            {displayName && <span className="text-sm">({displayName})</span>}
          </button>
        )} */}
      </div>

      {/* ================= FILE DROPDOWN ================= */}
      {projectFiles.length > 0 && (
        <div className="w-full bg-[#111] border-b border-gray-700 px-3 py-2">
          <div className="relative w-64" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-[#1E1E1E] text-white px-3 py-2 rounded-md border-2 border-white hover:border-blue-400 flex justify-between"
            >
              <span>{projectFiles[activeFile]?.name || "Select file"}</span>
              <span>{showDropdown ? "▲" : "▼"}</span>
            </button>

            {showDropdown && (
              <div className="absolute mt-1 w-full bg-gray-800 border border-blue-400 rounded-md z-50">
                {projectFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleFileSwitch(index)}
                    className="px-3 py-2 cursor-pointer text-blue-400 hover:bg-gray-600 hover:text-white"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= EDITORS ================= */}
      <div className="flex-1 overflow-auto">
        {activeTab === "code" && (
          <Editor
            height="100%"
            defaultLanguage="verilog"
            theme="vs-dark"
            value={editorContent}
            onMount={(e) => (window.monacoEditor = e)}
            options={{ automaticLayout: true, wordWrap: "on" ,
              minimap: { enabled: false }, 
            }}
          />
        )}

        {activeTab === "explanation" && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={explanation}
            onMount={(e) => (window.monacoExplanationEditor = e)}
            options={{ automaticLayout: true, wordWrap: "on",
              minimap: { enabled: false }, 
             }}
          />
        )}

        {activeTab === "testbench" && showTestbenchTab && (
          <Editor
            height="100%"
            defaultLanguage="verilog"
            theme="vs-dark"
            value={testbench}
            onMount={(e) => (window.monacoTestbenchEditor = e)}
            options={{ automaticLayout: true, wordWrap: "on",
              minimap: { enabled: false }, 
             }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
