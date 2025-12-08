import React, { useState, useEffect, useRef } from "react";

const Button = ({ editorContent, setEditorContent }) => {
  const fileInputRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("editorContent", editorContent);
  }, [editorContent]);

  useEffect(() => {
    const handleResize = () => setOpenMenu(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    if (openMenu) document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [".v", ".sv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(ext)) {
      alert("Only .v and .sv files allowed!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const cleaned = reader.result.replace(/\n+$/, "");
      setEditorContent(cleaned);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="bg-gray-800 h-11 flex justify-between items-center px-3 shadow-md w-full">

        <div className="space-x-4 hidden md:flex">
          {["Load File", "Load Project", "Explain Code", "Copy Explanation", "Clear All"].map(
            (label, index) => (
              <button
                key={index}
                onClick={() => {
                  if (label === "Load File") fileInputRef.current.click();
                  if (label === "Clear All") {
                    setEditorContent("");
                    localStorage.removeItem("editorContent");
                  }
                }}
                className="bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs 
                 transition-all hover:bg-orange-600 cursor-pointer"
                >
              {label}
              </button>
            )
          )}
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
          className="absolute mt-12 ml-3 z-50 md:hidden bg-gray-900 rounded-xl 
           p-3 space-y-2 shadow-xl"
        >
          {["Load File", "Load Project", "Explain Code", "Copy Explanation", "Clear All"].map(
            (label, index) => (
              <button
                key={index}
                onClick={() => {
                  if (label === "Load File") fileInputRef.current.click();
                  if (label === "Clear All") {
                    setEditorContent("");
                    localStorage.removeItem("editorContent");
                  }
                  setOpenMenu(false);
                }}
                className="bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
                 flex items-center justify-center truncate
                 hover:bg-orange-600 transition duration-200 cursor-pointer"
              >
                {label}
              </button>
            )
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept=".v,.sv"
        className="hidden"
        onChange={handleUpload}
      />
    </>
  );
};

export default Button;
