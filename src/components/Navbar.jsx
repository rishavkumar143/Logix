import React, { useState, useEffect, useRef } from "react";
import { FaCaretRight } from "react-icons/fa";
import {
  VscFolderOpened,
  VscFolderLibrary,
  VscFile,
  VscTrash,
  VscCopy,
  VscCircuitBoard,
} from "react-icons/vsc";

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
  const [menu, setMenu] = useState({ open: null, recent: false });

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const menuRef = useRef(null);

  const [zoom, setZoom] = useState(100);
  const [recentFiles, setRecentFiles] = useState(
    JSON.parse(localStorage.getItem("recentFiles")) || []
  );

  /** -------------------- Helpers ---------------------- */

  const saveToRecent = (name, content) => {
    const updated = [
      { name, content },
      ...recentFiles.filter((f) => f.name !== name),
    ].slice(0, 6);

    setRecentFiles(updated);
    localStorage.setItem("recentFiles", JSON.stringify(updated));
  };

  const toggleMenu = (key) => {
    setMenu((prev) => ({
      ...prev,
      open: prev.open === key ? null : key,
      recent: false,
    }));
  };

  const resetUI = () => setMenu({ open: null, recent: false });

  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) resetUI();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** -------------------- File Actions ---------------------- */

  const handleNewFile = () => {
    setEditorContent("");
    setFileName("untitled.sv");
    saveToRecent("untitled.sv", "");
    resetUI();
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["v", "sv"].includes(ext)) return alert("⚠ Only .v or .sv allowed!");

    const reader = new FileReader();
    reader.onload = () => {
      setEditorContent(reader.result.trim());
      setFileName(file.name);
      saveToRecent(file.name, reader.result.trim());
      setProjectFiles([]);
      setActiveFile(null);
    };
    reader.readAsText(file);

    resetUI();
  };

  const handleFolderUpload = async (e) => {
    const files = [...e.target.files];

    const filtered = await Promise.all(
      files
        .filter((f) => f.name.match(/\.(v|sv)$/))
        .map(async (f) => ({ name: f.name, content: await f.text() }))
    );

    if (!filtered.length) return alert("⚠ No Verilog files found!");

    setProjectFiles(filtered);
    setActiveFile(0);
    setFileName(filtered[0].name);
    setEditorContent(filtered[0].content);
    saveToRecent(filtered[0].name, filtered[0].content);

    resetUI();
  };

  const clearAll = () => {
    localStorage.clear();
    setEditorContent("");
    setFileName("");
    setProjectFiles([]);
    setActiveFile(null);
    resetUI();
  };

  const handleExit = () => clearAll();

  /** -------------------- Zoom ---------------------- */
  const handleZoom = (amount) => {
    const newZoom = Math.min(200, Math.max(50, zoom + amount));
    setZoom(newZoom);

    document
      .querySelector(".monaco-editor")
      ?.style.setProperty("transform", `scale(${newZoom / 100})`);
  };

  /** -------------------- UI Classes ---------------------- */

  const rowStyle =
    "flex justify-between px-3 py-[6px] text-[13px] hover:bg-[#0078d4] hover:text-white cursor-pointer";

  return (
    <>
      {/* ==================== MENU BAR ==================== */}
      <nav
        ref={menuRef}
        className="bg-white border-b border-gray-300 h-7 flex items-center px-3 gap-5 text-[13px] select-none"
      >
        {["File", "Edit", "View", "Generate", "Generate View", "Help"].map(
          (label) => {
            const key = label.toLowerCase().replace(" ", "");

            return (
              <div key={key} className="relative">
                {/* Menu Label */}
                <span
                  onClick={() => toggleMenu(key)}
                  className={`px-2 py-0.5 cursor-pointer transition-all
        ${
          menu.open === key
            ? "text-[#0078d4] font-medium border-b-2 border-[#0078d4]"
            : "hover:text-[#0078d4]"
        }`}
                >
                  {label}
                </span>

                {/* --- SHARED DROPDOWN CONTAINER --- */}
                {menu.open === key && (
                  <ul
                    className="absolute left-0 mt-1 bg-[#f9f9f9] shadow-lg border border-gray-300
          rounded-sm w-60 py-1 text-[13px] z-9999 animate-fadeIn"
                  >
                    {/* ================= FILE ================= */}
                    {key === "file" && (
                      <>
                        <li className={rowStyle} onClick={handleNewFile}>
                          New <span className="opacity-60">Ctrl+N</span>
                        </li>

                        <li
                          className={rowStyle}
                          onClick={() => fileInputRef.current.click()}
                        >
                          Open File <span className="opacity-60">Ctrl+O</span>
                        </li>

                        {/* ---- RECENT SUBMENU ---- */}
                        <li
                          className={`${rowStyle} relative`}
                          onMouseEnter={() =>
                            setMenu((p) => ({ ...p, recent: true }))
                          }
                          onMouseLeave={() =>
                            setMenu((p) => ({ ...p, recent: false }))
                          }
                        >
                          <span>Open Recent</span>
                          <FaCaretRight />

                          {menu.recent && (
                            <ul
                              className="absolute top-0 translate-y-[-2px] left-[100%] 
      bg-black border border-black-300 shadow-lg rounded-sm 
      w-[220px] py-1 text-[13px] z-[9999] animate-fadeIn"
                            >
                              {recentFiles && recentFiles.length > 0 ? (
                                recentFiles.map((f, i) => (
                                  <li
                                    key={i}
                                    className="px-3 py-[6px] cursor-pointer hover:bg-[#0078d4] hover:text-white"
                                    onClick={() => {
                                      setEditorContent(f.content);
                                      setFileName(f.name);
                                      saveToRecent(f.name, f.content);
                                      setMenu({ open: null, recent: false });
                                    }}
                                  >
                                    {f.name}
                                  </li>
                                ))
                              ) : (
                                <li className="px-4 py-2 text-gray-500 text-sm">
                                  No Recent Files
                                </li>
                              )}
                            </ul>
                          )}
                        </li>

                        <li className="border-t border-gray-300 my-1"></li>

                        <li
                          className={rowStyle}
                          onClick={() => folderInputRef.current.click()}
                        >
                          Open Project Folder
                        </li>

                        <li
                          className={`${rowStyle} text-red-600 hover:bg-red-600 hover:text-white`}
                          onClick={handleExit}
                        >
                          Exit
                        </li>
                      </>
                    )}

                    {/* ================= EDIT ================= */}
                    {key === "edit" && (
                      <>
                        <li className={rowStyle}>
                          Undo <span className="opacity-60">Ctrl+Z</span>
                        </li>
                        <li className={rowStyle}>
                          Redo <span className="opacity-60">Ctrl+Y</span>
                        </li>
                        <li className={rowStyle}>
                          Find <span className="opacity-60">Ctrl+F</span>
                        </li>
                      </>
                    )}

                    {/* ================= VIEW ================= */}
                    {key === "view" && (
                      <>
                        <li
                          className={rowStyle}
                          onClick={() => handleZoom(+10)}
                        >
                          Zoom In <span className="opacity-60">Ctrl++</span>
                        </li>
                        <li
                          className={rowStyle}
                          onClick={() => handleZoom(-10)}
                        >
                          Zoom Out <span className="opacity-60">Ctrl+-</span>
                        </li>
                        <li
                          className={rowStyle}
                          onClick={() => handleZoom(100 - zoom)}
                        >
                          Reset Zoom <span className="opacity-60">Ctrl+0</span>
                        </li>
                      </>
                    )}

                    {/* ================= GENERATE ================= */}
                    {key === "generate" && (
                      <>
                        <li className={rowStyle}>Generate Testbench</li>
                        <li className={rowStyle}>Generate UVM Testbench</li>
                        <li className={rowStyle}>Generate Report</li>
                      </>
                    )}

                    {/* ================= GENERATE VIEW ================= */}
                    {key === "generateview" && (
                      <li className={rowStyle}>Hierarchy View</li>
                    )}

                    {/* ================= HELP ================= */}
                    {key === "help" && (
                      <>
                        <li className={rowStyle}>Documentation</li>
                        <li className={rowStyle}>About</li>
                      </>
                    )}
                  </ul>
                )}
              </div>
            );
          }
        )}
      </nav>

      {/* ==================== TOOLBAR ==================== */}
      <div className="w-full h-10 bg-[#1E2A33] border-b border-[#3b4b55] flex items-center px-2 gap-1 select-none">
        {[
          {
            label: "Load File",
            action: () => fileInputRef.current.click(),
            icon: <VscFile size={18} />,
          },
          {
            label: "Load Project",
            action: () => folderInputRef.current.click(),
            icon: <VscFolderOpened size={18} />,
          },
          {
            label: "Explain Code",
            action: () => {},
            icon: <VscCircuitBoard size={18} />,
          },
          {
            label: "Copy Explanation",
            action: () => {},
            icon: <VscCopy size={18} />,
          },
          {
            label: "Clear All",
            action: clearAll,
            icon: <VscTrash size={18} />,
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="flex items-center gap-2 px-3 py-[6px] text-sm cursor-pointer text-gray-200 rounded hover:bg-[#2A3A45] transition-all"
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}

        <div className="w-[1px] h-6 bg-[#3b4b55] mx-2" />
        <span className="text-xs text-gray-400">Ready</span>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".v,.sv"
        className="hidden"
        onChange={handleUploadFile}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory=""
        className="hidden"
        onChange={handleFolderUpload}
      />
    </>
  );
};

export default Navbar;
