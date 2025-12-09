import React, { useState, useEffect } from "react";
import Navbar from "./Icons";
import Button from "./Button";
import CodeEditor from "./CodeEditor";

function Code() {

  // Editor content
  const [editorContent, setEditorContent] = useState(
    localStorage.getItem("editorContent") || ""
  );

  // File name
  const [fileName, setFileName] = useState(
    localStorage.getItem("fileName") || ""
  );

  // Project files: [{ name, path, content }]
  const [projectFiles, setProjectFiles] = useState([]);

  // Active opened file index
  const [activeFile, setActiveFile] = useState(null);

  // Restore project files on load
  useEffect(() => {
    const saved = localStorage.getItem("projectFiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProjectFiles(parsed);
        }
      } catch (err) {
        console.error("Error loading project files:", err);
      }
    }

    const savedActive = localStorage.getItem("activeFile");
    if (savedActive !== null) {
      const index = parseInt(savedActive, 10);
      setActiveFile(index);

      // Restore last file opened
      const savedProj = localStorage.getItem("projectFiles");
      if (savedProj) {
        const arr = JSON.parse(savedProj);
        if (arr[index]) {
          setEditorContent(arr[index].content);
          setFileName(arr[index].name);
        }
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <Navbar />

      <Button
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        fileName={fileName}
        setFileName={setFileName}
        projectFiles={projectFiles}
        setProjectFiles={setProjectFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
      />

      {/* CodeEditor ALWAYS visible */}
      <CodeEditor
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        fileName={fileName}
        projectFiles={projectFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
      />

    </div>
  );
}

export default Code;
