import React, { useState, useEffect, useRef } from "react";
import { FaCaretRight } from "react-icons/fa";
import axios from "axios";
import { baseUrl } from "../baseUrl";

const Navbar = ({
  setEditorContent,
  setFileName,
  setProjectFiles,
  setActiveFile,
}) => {
  const [menu, setMenu] = useState({ open: null, recent: false });

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const menuRef = useRef(null);

  const [zoom, setZoom] = useState(14);

  const [recentFiles, setRecentFiles] = useState(
    JSON.parse(localStorage.getItem("recentFiles")) || []
  );

  const saveToRecent = (name, content) => {
    const updated = [
      { name, content },
      ...recentFiles.filter((f) => f.name !== name),
    ].slice(0, 15);

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

  useEffect(() => {
    const refreshRecent = () => {
      const list = JSON.parse(localStorage.getItem("recentFiles")) || [];
      setRecentFiles(list);
    };

    window.addEventListener("recentFilesUpdated", refreshRecent);
    return () =>
      window.removeEventListener("recentFilesUpdated", refreshRecent);
  }, []);

  /* ZOOM */
  const applyZoom = (fontSize) => {
    if (window.monacoEditor) {
      window.monacoEditor.updateOptions({ fontSize });
    }
    if (window.monacoExplanationEditor) {
      window.monacoExplanationEditor.updateOptions({ fontSize });
    }
  };

  const handleZoom = (amount) => {
    const newFont = Math.min(40, Math.max(6, zoom + amount));
    setZoom(newFont);
    applyZoom(newFont);
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.ctrlKey && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoom(+2);
      }
      if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        handleZoom(-2);
      }
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        handleZoom(14 - zoom);
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [zoom]);

  /* -------------------- FILE OPEN (SINGLE FILE) -------------------- */

  const openSingleFile = (name, content) => {
    setEditorContent(content);
    setFileName(name);

    // SINGLE FILE MODE → REMOVE FOLDER CONTEXT
    setProjectFiles([]);
    setActiveFile(null);

    localStorage.setItem("editorContent", content);
    localStorage.setItem("fileName", name);
    localStorage.removeItem("projectFiles");
    localStorage.removeItem("activeFile");

    saveToRecent(name, content);
  };

  // const handleUploadFile = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const ext = file.name.split(".").pop().toLowerCase();
  //   if (!["v", "sv"].includes(ext)) return alert("⚠ Only .v or .sv allowed!");

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     openSingleFile(file.name, reader.result.trim());
  //   };

  //   reader.readAsText(file);
  //   resetUI();
  // };

  const handleExplainCode = async () => {
  if (!window.monacoEditor) {
    alert("No code found!");
    return;
  }

  const code = window.monacoEditor.getValue();

  if (!code.trim()) {
    alert("Code empty hai");
    return;
  }

  try {
    const res = await axios.post(
      `${baseUrl}/explain`,
      { code }
    );

    if (res.data?.explanation) {
      window.setExplanationFromAPI(res.data.explanation);
    } else {
      window.setExplanationFromAPI("No explanation received");
    }
  } catch (err) {
    console.error(err);
    window.setExplanationFromAPI("Error while explaining code");
  }
};



  //Load File API Call Start

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: validate file type
    const allowedExt = ["v", "sv"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedExt.includes(ext)) {
      console.error("Invalid file type");
      return;
    }

    const formData = new FormData(); // ✅ correct
    formData.append("file", file);

    try {
      const response = await axios.post(`${baseUrl}/upload`, formData);

      if (!response.status) {
        alert("Failed to fetch Data");
        return;
      }

      let data = response.data;

      const reader = new FileReader();
      reader.onload = () => {
        openSingleFile(data.filename, data.preview.trim());
      };

      reader.readAsText(file);
      resetUI();

      // console.log("Upload success:", response.data.filename);
      // console.log("Upload success:", response.data.preview);
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
    }
  };


  /* -------------------- FOLDER OPEN -------------------- */

  const handleFolderUpload = async (e) => {
    const files = Array.from(e.target.files);

    const filtered = await Promise.all(
      files
        .filter((f) => /\.(v|sv)$/i.test(f.name))
        .map(async (f) => ({
          name: f.name,
          path: f.webkitRelativePath,
          content: await f.text(),
        }))
    );

    if (!filtered.length) {
      alert("⚠ No Verilog files found!");
      return;
    }

    setProjectFiles(filtered);
    setActiveFile(0);
    setFileName(filtered[0].name);
    setEditorContent(filtered[0].content);

    localStorage.setItem("projectFiles", JSON.stringify(filtered));
    localStorage.setItem("activeFile", "0");
    localStorage.removeItem("fileName");
    localStorage.removeItem("editorContent");

    // ADD FIRST FILE TO RECENT TOO
    saveToRecent(filtered[0].name, filtered[0].content);

    resetUI();
  };

  //Copy Explanation API Starts
  
const handleCopyExplanation = async () => {
  // Explanation editor must exist
  if (!window.monacoExplanationEditor) {
    alert("Explanation editor not ready");
    return;
  }

  // Read CURRENT content from editor (including user edits)
  const explanationText = window.monacoExplanationEditor.getValue();

  if (!explanationText || !explanationText.trim()) {
    alert("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(explanationText);

    alert("Explanation copied successfully");
  } catch (err) {
    console.error("Copy Explanation error:", err.message);
  }
};

  /* -------------------- CLEAR ALL -------------------- */

  const clearAll = () => {
    localStorage.clear();
    setEditorContent("");
    setFileName("");
    setProjectFiles([]);
    setActiveFile(null);

    setRecentFiles([]);
    localStorage.setItem("recentFiles", JSON.stringify([]));

    resetUI();
  };

  const handleExit = () => clearAll();

  /* UI STYLES */

  const rowStyle =
    "flex justify-between px-3 py-[6px] text-[13px] hover:bg-[#0078d4] hover:text-white cursor-pointer";

  return (
    <>
      <nav
        ref={menuRef}
        className="bg-white border-b border-gray-300 h-7 flex items-center px-3 gap-5 text-[13px] select-none"
      >
        {["File", "Edit", "View", "Generate", "Generate View", "Help"].map(
          (label) => {
            const key = label.toLowerCase().replace(" ", "");

            return (
              <div key={key} className="relative">
                <span
                  onClick={() => toggleMenu(key)}
                  className={`px-2 py-0.5 cursor-pointer transition-all ${
                    menu.open === key
                      ? "text-[#0078d4] font-medium border-b-2 border-[#0078d4]"
                      : "hover:text-[#0078d4]"
                  }`}
                >
                  {label}
                </span>

                {menu.open === key && (
                  <ul
                    className="absolute left-0 mt-1 bg-[#f9f9f9] shadow-lg border border-gray-300
                    rounded-sm w-60 py-1 text-[13px] z-9999 animate-fadeIn"
                  >
                    {/* FILE MENU */}
                    {key === "file" && (
                      <>
                        <li className={rowStyle} onClick={handleExit}>
                          New <span className="opacity-60">Ctrl+N</span>
                        </li>

                        <li
                          className={rowStyle}
                          onClick={() => fileInputRef.current.click()}
                        >
                          Load File <span className="opacity-60">Ctrl+O</span>
                        </li>

                        <li
                          className={rowStyle}
                          onClick={() => folderInputRef.current.click()}
                        >
                          Load Project Folder
                        </li>

                        {/* RECENT FILES */}
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
                              className="absolute top-0 left-full bg-black border border-black shadow-lg rounded-sm 
                              w-[220px] py-1 text-[13px] z-9999 animate-fadeIn"
                            >
                              {recentFiles.length > 0 ? (
                                recentFiles.map((f, i) => (
                                  <li
                                    key={i}
                                    className="px-3 py-1.5 cursor-pointer hover:bg-[#0078d4] hover:text-white"
                                    onClick={() => {
                                      openSingleFile(f.name, f.content);
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
                          className={`${rowStyle} text-red-600 hover:bg-red-600 hover:text-white`}
                          onClick={handleExit}
                        >
                          Exit
                        </li>
                      </>
                    )}

                    {/* EDIT MENU */}
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

                    {/* VIEW MENU */}
                    {key === "view" && (
                      <>
                        <li className={rowStyle} onClick={() => handleZoom(+2)}>
                          Zoom In <span className="opacity-60">Ctrl++</span>
                        </li>
                        <li className={rowStyle} onClick={() => handleZoom(-2)}>
                          Zoom Out <span className="opacity-60">Ctrl --</span>
                        </li>
                        <li
                          className={rowStyle}
                          onClick={() => handleZoom(14 - zoom)}
                        >
                          Reset Zoom <span className="opacity-60">Ctrl+0</span>
                        </li>
                      </>
                    )}
                    {/* ================= GENERATE ================= */}
                    {key === "generate" && (
                      <>
                        <li className={rowStyle}>Generate APB/UVM TB</li>
                        <li className={rowStyle}>Generate AXI TB</li>
                        <li className={rowStyle}>Generate Report</li>
                        <li className="border-t border-gray-300 my-1"></li>
                        <li className={rowStyle}>Include Header File</li>
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

      {/* Toolbar */}
      <div className="w-full h-10 bg-[#1E2A33] border-b border-[#3b4b55] flex items-center px-2 gap-1 select-none">
        {[
          {
            label: "Explain Code",
            action: handleExplainCode,
          },
          {
            label: "Copy Explanation",
            action: handleCopyExplanation,
          },
          {
            label: "Clear All",
            action: clearAll,
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer text-gray-200 rounded hover:bg-[#2A3A45] transition-all"
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}

        {/* <div className="w-px h-6 bg-[#3b4b55] mx-2" />
        <span className="text-xs text-gray-400">Ready</span> */}
      </div>

      {/* File Inputs */}
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