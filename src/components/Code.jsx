import React, { useState, useEffect } from "react";
import Navbar from "./Icons";
import Button from "./Button";
import CodeEditor from "./CodeEditor";

function Code() {

  const [editorContent, setEditorContent] = useState("");

  const [fileName, setFileName] = useState(
    localStorage.getItem("fileName") || ""
  );

  useEffect(() => {
    localStorage.setItem("fileName", fileName);
  }, [fileName]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <Navbar />

      <Button
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        fileName={fileName}
        setFileName={setFileName}
      />

      {editorContent.trim() === "" && (
        <div className="flex-1 bg-[url('/bg.png')] bg-cover bg-center">
          <div className="text-white text-xl p-6">
            Open a file to start editing...
          </div>
        </div>
      )}

      {editorContent.trim() !== "" && (
        <CodeEditor
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          fileName={fileName}
        />
      )}

    </div>
  );
}

export default Code;
