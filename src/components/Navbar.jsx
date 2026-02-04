import React, { useState, useEffect, useRef } from "react";
import { FaCaretRight } from "react-icons/fa";
import axios from "axios";
import { baseUrl } from "../baseUrl";
import { baseUrl_1 } from "../baseUrl";
import { baseUrl_2 } from "../baseUrl";
import Hierarchy from "./Hirearchy";
import GenerateReport from "./GenerateReport";
import Schematic from "./Schematic";


// const Modal = ({ open, onClose, children }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
//       <div className="bg-[#0f0f0f] w-[90%] max-w-6xl rounded shadow-lg relative">
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-3 text-gray-400 hover:text-white"
//         >
//           ✕
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// };


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
  const [ showReport, setShowReport] = useState(false);
  const [showSchematic, setShowSchematic] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);


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


  //Explanation API call

const handleExplainCode = async () => {
  if (!window.monacoEditor) {
    alert("Editor not ready");
    return;
  }

  const code = window.monacoEditor.getValue();

  if (!code.trim()) {
    alert("Code is empty");
    return;
  }

  try {
    const res = await axios.post(
      `${baseUrl_2}/explain/`,
      {
        text: code,   // 🔥 VERY IMPORTANT
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Explain API response:", res.data);

    const explanation =
      res.data?.explanation ||
      res.data?.response ||
      res.data?.result ||
      JSON.stringify(res.data, null, 2);

    if (window.setExplanationFromAPI) {
      window.setExplanationFromAPI(explanation);
    }
  } catch (error) {
    console.error("Explain API failed:", error.response || error.message);

    if (window.setExplanationFromAPI) {
      window.setExplanationFromAPI("❌ Explain API failed");
    }
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
      const response = await axios.post
      (`${baseUrl_1}/upload/file/`, formData);

      if (!response.status) {
        alert("Failed to fetch Data");
        return;
      }

      let data = response.data;

      const reader = new FileReader();
      reader.onload = () => {
      const fullContent = reader.result;
      openSingleFile(data.filename, fullContent);
    };


      reader.readAsText(file);
      resetUI();
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

  try {
    const formData = new FormData();

    filtered.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      formData.append("files", blob, file.path);
    });

    await axios.post(
      `${baseUrl_1}/upload/folder/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (err) {
    console.error(err);
    alert("❌ Folder upload failed");
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

  saveToRecent(filtered[0].name, filtered[0].content);
  resetUI();
};


  //Copy Explanation API Starts
const handleCopyExplanation = async () => {
  if (!window.monacoExplanationEditor) {
    alert("Explanation editor not ready");
    return;
  }

  // Read current content from editor
  const explanationText = window.monacoExplanationEditor.getValue();

  if (!explanationText || !explanationText.trim()) {
    alert("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(explanationText);

    alert("Explanation copied successfully");
  } catch (err) {
    console.error("Copy Explanation error:", err);
    alert("Copy failed");
  }
};

  /* -------------------- CLEAR ALL -------------------- */
const clearAll = async () => {
  try {
    await axios.post(
      `${baseUrl_2}/clear/`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Backend clear API called successfully");
  } catch (error) {
    console.error(
      "Clear API failed:",
      error.response?.data || error.message
    );
  }

  localStorage.clear();
  setEditorContent("");
  setFileName("");
  setProjectFiles([]);
  setActiveFile(null);

  if (window.monacoEditor) {
    window.monacoEditor.setValue("");
  }

  if (window.setExplanationFromAPI) {
    window.setExplanationFromAPI("");
  }
  // if (window.setTestbenchFromAPI) {
  //   window.setTestbenchFromAPI("");
  // }

  // localStorage.removeItem("testbench-blank");

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
                        <li
                          className={rowStyle}
                          // onClick={async () => {
                          //   if (window.setTestbenchFromAPI) {
                          //     window.setTestbenchFromAPI("");
                          //   }
                          //   try {
                          //     const res = await axios.post(
                          //       `${baseUrl}/testbench/uvm`,
                          //       {
                          //         code: window.monacoEditor?.getValue() || "",
                          //       },{
                          //         header : {
                          //           "content-Type" : "application/json"
                          //         }
                          //       }
                          //     );
                          //     const output =
                          //       typeof res.data === "string"
                          //         ? res.data
                          //         : res.data?.testbench ||
                          //           res.data?.result ||
                          //           res.data?.output ||
                          //           JSON.stringify(res.data, null, 2);

                          //     window.setTestbenchFromAPI(output);
                          //   } catch (err) {
                          //     window.setTestbenchFromAPI("// Error generating testbench");
                          //   }

                          //   setMenu({ open: null, recent: false });
                          // }}
                          >
                          Generate APB/UVM Testbench
                        </li>

                        <li className={rowStyle}>Generate AXI Testbench</li>

                        {/* GENERATE REPORT */}
                        <li className={rowStyle} onClick={()=>{setShowReport(true);
                          setMenu({open:null, recent:false})
                        }}>Generate Report</li>
                        <li className="border-t border-gray-300 my-1"></li>
                        <li className={rowStyle}>Include Header Preview</li>
                      </>
                    )}

                    {/* ================= GENERATE VIEW ================= */}
                    {key === "generateview" && (
                      <>
                        <li
                          className={rowStyle}
                          onClick={() => {
                            setShowHierarchy(true);
                            setMenu({ open: null, recent: false });
                          }}
                        >
                          Hierarchy View
                        </li>
<li
  className={rowStyle}
  onClick={() => {
    setShowSchematic(true);
    setMenu({ open: null, recent: false });
  }}
>
  Schematic View
</li>
                        {/* <li className={rowStyle}>Explain Gate Level Netlist</li> */}
                      </>
                    )}


                    {/* ================= HELP ================= */}
                    {key === "help" && (
                      <>
                        <li className={rowStyle}>Documentation</li>
                        {/* <li className={rowStyle}>About</li> */}
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
      {/* GENERATE REPORT POPUP */}
      <GenerateReport
        open={showReport}
        onClose={() => setShowReport(false)}
      />

      {/* Schematic */}
      <Schematic
  open={showSchematic}
  onClose={() => setShowSchematic(false)}
/>

<Hierarchy
  open={showHierarchy}
  onClose={() => setShowHierarchy(false)}
/>

    </>
  );
};

export default Navbar;