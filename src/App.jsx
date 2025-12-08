import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Icons";
import Button from "./components/Button";
import CodeEditor from "./components/CodeEditor";

function App() {
  const [editorContent, setEditorContent] = useState(
    localStorage.getItem("editorContent") || ""
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ⭐ Navbar (top fixed) */}
      <Navbar />

      {/* ⭐ Toolbar Buttons */}
      <Button
        editorContent={editorContent}
        setEditorContent={setEditorContent}
      />

      {/* ⭐ Code Editor (only when content exists) */}
      {editorContent.trim() !== "" && (
        <CodeEditor
          editorContent={editorContent}
          setEditorContent={setEditorContent}
        />
      )}
    </div>
  );
}

export default App;
