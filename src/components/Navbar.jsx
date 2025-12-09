import React, { useState, useEffect, useRef } from "react";
import { FaCaretRight } from "react-icons/fa";

const Navbar = ({
  editorContent,
  setEditorContent,
  fileName,
  setFileName,
  projectFiles,
  setProjectFiles,
  activeFile,
  setActiveFile,
}) => {
  const [menu, setMenu] = useState({
    file: false,
    edit: false,
    view: false,
    generate: false,
    genView: false,
    help: false,
    recent: false,
  });

  const [zoom, setZoom] = useState(100);
  const [recentFiles, setRecentFiles] = useState(
    JSON.parse(localStorage.getItem("recentFiles")) || []
  );

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const menuRef = useRef(null);

  // ---------------- SAVE RECENT ----------------
  const saveToRecent = (name, content) => {
    const updated = [
      { name, content },
      ...recentFiles.filter((f) => f.name !== name),
    ].slice(0, 5);
    setRecentFiles(updated);
    localStorage.setItem("recentFiles", JSON.stringify(updated));
  };

  // ---------------- NEW FILE ----------------
  const handleNewFile = () => {
    setEditorContent("");
    setFileName("untitled.sv");
    saveToRecent("untitled.sv", "");
  };

  // ---------------- EXIT ----------------
  const handleExit = () => {
    localStorage.clear();
    setActiveFile(null);
    setEditorContent("");
    setProjectFiles([]);
    setFileName("");
  };

  // ---------------- FILE UPLOAD ----------------
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".v", ".sv"].includes(ext)) return alert("⚠ Only .v or .sv allowed!");

    const reader = new FileReader();
    reader.onload = () => {
      setEditorContent(reader.result.trim());
      setFileName(file.name);
      saveToRecent(file.name, reader.result.trim());
      setProjectFiles([]);
      setActiveFile(null);
    };
    reader.readAsText(file);
  };

  // ---------------- FOLDER UPLOAD ----------------
  const handleFolderUpload = async (e) => {
    const files = [...e.target.files];

    const filtered = await Promise.all(
      files
        .filter((f) => f.name.endsWith(".v") || f.name.endsWith(".sv"))
        .map(async (f) => ({
          name: f.name,
          content: await f.text(),
        }))
    );

    if (!filtered.length) return alert("No Verilog files found!");

    setProjectFiles(filtered);
    setActiveFile(0);
    setFileName(filtered[0].name);
    setEditorContent(filtered[0].content);
    saveToRecent(filtered[0].name, filtered[0].content);
  };


  // ---------------- CLEAR ALL ----------------
  const clearAll = () => {
    setEditorContent("");
    setFileName("");
    setProjectFiles([]);
    setActiveFile(null);
    localStorage.clear();
  };

  // ---------------- ZOOM ----------------
  const handleZoom = (amount) => {
    const newZoom = Math.min(200, Math.max(50, zoom + amount));
    setZoom(newZoom);
    document
      .querySelector(".monaco-editor")
      ?.style.setProperty("transform", `scale(${newZoom / 100})`);
  };

  // ---------------- SHORTCUT HANDLER ----------------
  useEffect(() => {
    const shortcut = (e) => {
      if (e.ctrlKey && e.key === "o") fileInputRef.current.click();
      if (e.ctrlKey && e.key === "n") handleNewFile();
      if (e.ctrlKey && e.key === "=") handleZoom(+10);
      if (e.ctrlKey && e.key === "-") handleZoom(-10);
      if (e.ctrlKey && e.key === "0") handleZoom(0);
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  });

  const dropdownBase =
    "absolute top-6 left-0 bg-[#F5F5F5] text-black shadow-xl border border-gray-400 w-60 py-1 text-sm z-[999]";

  const rowStyle =
    "flex justify-between px-4 py-[6px] hover:bg-blue-600 hover:text-white cursor-pointer select-none";

  const divider = "border-b border-gray-300 my-1";

  return (
    <>
      <nav className="bg-white text-black px-2 h-6 flex items-center gap-6 border-b border-gray-400 text-sm select-none">
        {[
          { label: "File", key: "file" },
          { label: "Edit", key: "edit" },
          { label: "View", key: "view" },
          { label: "Generate", key: "generate" },
          { label: "Generate View", key: "genView" },
          { label: "Help", key: "help" },
        ].map((item) => (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() =>
              setMenu((prev) => ({ ...prev, [item.key]: true }))
            }
            onMouseLeave={() =>
              setMenu((prev) => ({ ...prev, [item.key]: false }))
            }
          >
            <span className="cursor-pointer hover:text-blue-600">
              {item.label}
            </span>

            {/* FILE MENU */}
            {item.key === "file" && menu.file && (
              <ul className={dropdownBase}>
                <li className={rowStyle} onClick={handleNewFile}>
                  <span>New</span>
                  <span>Ctrl+N</span>
                </li>

                <li
                  className={rowStyle}
                  onClick={() => fileInputRef.current.click()}
                >
                  <span>Open File</span>
                  <span>Ctrl+O</span>
                </li>

                {/* RECENT */}
                <li
                  className={`${rowStyle} flex justify-between`}
                  onMouseEnter={() =>
                    setMenu((prev) => ({ ...prev, recent: true }))
                  }
                >
                  <span>Open Recent</span>
                  <FaCaretRight />
                </li>

                {menu.recent && (
                  <ul className="absolute left-60 top-24 bg-white text-black border shadow-md w-52">
                    {recentFiles.map((f, i) => (
                      <li
                        key={i}
                        className={rowStyle}
                        onClick={() => {
                          setEditorContent(f.content);
                          setFileName(f.name);
                          saveToRecent(f.name, f.content);
                        }}
                      >
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}

                <li className={divider}></li>

                <li
                  className={rowStyle}
                  onClick={() => folderInputRef.current.click()}
                >
                  Open Project Folder
                </li>

                <li
                  className={rowStyle + " text-red-600 hover:text-white"}
                  onClick={handleExit}
                >
                  Exit
                </li>
              </ul>
            )}

            {/* EDIT MENU */}
            {item.key === "edit" && menu.edit && (
              <ul className={dropdownBase}>
                <li className={rowStyle}>
                  Undo <span>Ctrl+Z</span>
                </li>
                <li className={rowStyle}>
                  Redo <span>Ctrl+Y</span>
                </li>
                <li className={rowStyle}>
                  Find <span>Ctrl+F</span>
                </li>
              </ul>
            )}

            {/* VIEW MENU */}
            {item.key === "view" && menu.view && (
              <ul className={dropdownBase}>
                <li className={rowStyle} onClick={() => handleZoom(+10)}>
                  Zoom In <span>Ctrl++</span>
                </li>
                <li className={rowStyle} onClick={() => handleZoom(-10)}>
                  Zoom Out <span>Ctrl+-</span>
                </li>
                <li className={rowStyle} onClick={() => handleZoom(100 - zoom)}>
                  Reset Zoom <span>Ctrl+0</span>
                </li>
              </ul>
            )}

            {/* GENERATE MENU */}
            {item.key === "generate" && menu.generate && (
              <ul className={dropdownBase}>
                <li className={rowStyle}>Generate Testbench</li>
                <li className={rowStyle}>Generate UVM Testbench</li>
                <li className={rowStyle}>Generate Report</li>
                <li className={divider}></li>
                <li className={rowStyle}>Include Header Preview</li>
              </ul>
            )}

            {/* GENERATE VIEW */}
            {item.key === "genView" && menu.genView && (
              <ul className={dropdownBase}>
                <li className={rowStyle}>Hierarchy View</li>
              </ul>
            )}

            {/* HELP */}
            {item.key === "help" && menu.help && (
              <ul className={dropdownBase}>
                <li className={rowStyle}>Documentation</li>
                <li className={rowStyle}>About</li>
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* TOOLBAR */}
      <div className="bg-[#0067A3] w-full h-10 flex items-center gap-3 px-3 text-white font-medium">
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-1 bg-[#10A9DC] cursor-pointer"
        >
          Load File
        </button>
        <button
          onClick={() => folderInputRef.current.click()}
          className="px-4 py-1 bg-[#10A9DC] cursor-pointer"
        >
          Load Project
        </button>
        <button className="px-4 py-1 bg-[#10A9DC] cursor-pointer">
          Explain Code
        </button>
        <button className="px-4 py-1 bg-[#10A9DC] cursor-pointer">
          Copy Explanation
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-1 bg-[#10A9DC] cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".v,.sv"
        className="hidden"
        onChange={handleUploadFile}
      />
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory="true"
        className="hidden"
        onChange={handleFolderUpload}
      />
    </>
  );
};

export default Navbar;
