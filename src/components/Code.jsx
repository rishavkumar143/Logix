import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import CodeExplanationPage from "./CodeExplanationPage";

function Code() {
  const [editorContent, setEditorContent] = useState(
    localStorage.getItem("editorContent") || ""
  );

  const [fileName, setFileName] = useState(
    localStorage.getItem("fileName") || ""
  );

  const [projectFiles, setProjectFiles] = useState([]);

  const [activeFile, setActiveFile] = useState(null);

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
      <Navbar
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        fileName={fileName}
        setFileName={setFileName}
        projectFiles={projectFiles}
        setProjectFiles={setProjectFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
      />

      <CodeExplanationPage
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        fileName={fileName}
        setFileName={setFileName}
        projectFiles={projectFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
      />
    </div>
  );
}

export default Code;
