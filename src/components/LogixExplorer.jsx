import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import CodeEditor from "./CodeEditor";


function LogixExplorer() {
  const [editorContent, setEditorContent] = useState(
    localStorage.getItem("editorContent") || ""
  );

  const [fileName, setFileName] = useState(
    localStorage.getItem("fileName") || ""
  );

  const [projectFiles, setProjectFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    const savedFolder = localStorage.getItem("projectFiles");

    if (savedFolder) {
      try {
        const parsed = JSON.parse(savedFolder);

        if (Array.isArray(parsed)) {
          setProjectFiles(parsed);

          const savedActive = localStorage.getItem("activeFile");
          if (savedActive !== null) {
            const idx = parseInt(savedActive, 10);

            if (parsed[idx]) {
              setActiveFile(idx);
              setEditorContent(parsed[idx].content);
              setFileName(parsed[idx].name);
            }
          }
        }
      } catch (err) {
        console.log("Folder parse error:", err);
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        setEditorContent={setEditorContent}
        setFileName={setFileName}
        setProjectFiles={setProjectFiles}
        setActiveFile={setActiveFile}
      />

      <CodeEditor
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

export default LogixExplorer;
