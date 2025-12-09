import React, { useState, useEffect, useRef } from "react";

const Button = ({
  editorContent,
  setEditorContent,
  fileName,
  setFileName,
  projectFiles,
  setProjectFiles,
  activeFile,
  setActiveFile,
}) => {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("editorContent", editorContent);
  }, [editorContent]);

  useEffect(() => {
    localStorage.setItem("fileName", fileName);
  }, [fileName]);

  useEffect(() => {
    if (projectFiles.length > 0) {
      const formatted = projectFiles.map((f) => ({
        name: f.name,
        webkitRelativePath: f.webkitRelativePath,
        content: f.content,
      }));
      localStorage.setItem("projectFiles", JSON.stringify(formatted));
    }
  }, [projectFiles]);

  useEffect(() => {
    if (activeFile !== null) {
      localStorage.setItem("activeFile", activeFile.toString());
    }
  }, [activeFile]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const allowed = [".v", ".sv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(ext)) {
      alert("Only .v or .sv files allowed!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const cleaned = reader.result.replace(/\n+$/, "");
      setEditorContent(cleaned);

      setProjectFiles([]);
      localStorage.removeItem("projectFiles");
      setActiveFile(null);
    };
    reader.readAsText(file);
  };

  const handleFolderUpload = async (e) => {
    const files = Array.from(e.target.files);
    let verilog = [];

    for (const file of files) {
      if (file.name.endsWith(".v") || file.name.endsWith(".sv")) {
        const content = await file.text();
        verilog.push({
          name: file.name,
          webkitRelativePath: file.webkitRelativePath,
          content,
        });
      }
    }

    if (verilog.length === 0) {
      alert("No .v or .sv files found in selected folder.");
      return;
    }

    setProjectFiles(verilog);
    setActiveFile(0);
    setFileName(verilog[0].name);
    setEditorContent(verilog[0].content);
  };

  const clearAll = () => {
    setEditorContent("");
    setFileName("");
    setProjectFiles([]);
    setActiveFile(null);

    localStorage.removeItem("editorContent");
    localStorage.removeItem("fileName");
    localStorage.removeItem("projectFiles");
    localStorage.removeItem("activeFile");
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div className="relative bg-gray-800 h-11 flex justify-between items-center px-3 shadow-md w-full">
        <div className="space-x-4 hidden md:flex">
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs 
            transition-all hover:bg-orange-600 cursor-pointer"
          >
            Load File
          </button>

          <button
            onClick={() => folderInputRef.current.click()}
            className="bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs 
            transition-all hover:bg-orange-600 cursor-pointer"
          >
            Load Project
          </button>

          <button
            className="bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs 
          transition-all hover:bg-orange-600 cursor-pointer"
          >
            Explain Code
          </button>

          <button
            className="bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs 
          transition-all hover:bg-orange-600 cursor-pointer"
          >
            Copy Explanation
          </button>

          <button
            onClick={clearAll}
            className="bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs 
            transition-all hover:bg-orange-600 cursor-pointer"
          >
            Clear All
          </button>
        </div>

        <button
          className="md:hidden flex flex-col space-y-[3px] cursor-pointer"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <span className="w-5 h-[3px] bg-white"></span>
          <span className="w-5 h-[3px] bg-white"></span>
          <span className="w-5 h-[3px] bg-white"></span>
        </button>
      </div>

      {openMenu && (
        <div
          ref={menuRef}
          className="absolute top-12 left-3 z-[9999] md:hidden bg-gray-900 rounded-xl 
          p-3 space-y-2 shadow-xl border border-gray-700"
        >
          <button
            onClick={() => {
              fileInputRef.current.click();
              setOpenMenu(false);
            }}
            className="bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
            flex items-center justify-center hover:bg-orange-600 transition cursor-pointer"
          >
            Load File
          </button>

          <button
            onClick={() => {
              folderInputRef.current.click();
              setOpenMenu(false);
            }}
            className="bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
            flex items-center justify-center hover:bg-orange-600 transition cursor-pointer"
          >
            Load Project
          </button>

          <button
            className="bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
          flex items-center justify-center hover:bg-orange-600 transition cursor-pointer"
          >
            Explain Code
          </button>

          <button
            className="bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
          flex items-center justify-center hover:bg-orange-600 transition cursor-pointer"
          >
            Copy Explanation
          </button>

          <button
            onClick={() => {
              clearAll();
              setOpenMenu(false);
            }}
            className="bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
            flex items-center justify-center hover:bg-orange-600 transition cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept=".v,.sv"
        className="hidden"
        onChange={handleUpload}
      />

      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory="true"
        directory=""
        className="hidden"
        onChange={handleFolderUpload}
      />
    </>
  );
};

export default Button;
