import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "../components/CodeEditor";

const Button = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setOpenMenu(false);
    };
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

  return (
    <>
      <div className="bg-gray-800 flex flex-col">
        <div className="flex justify-between items-center px-3 h-11 bg-gray-800 shadow-sm">
          <div className="space-x-4 hidden md:flex">
            {["Load File", "Load Project", "Explain Code", "Copy Explanation", "Clear All"].map(
              (label, index) => (
                <button
                  key={index}
                  className="
                    bg-gray-900 text-amber-50 h-7 px-4 rounded-3xl text-xs
                    transition-all hover:bg-orange-600 cursor-pointer
                  "
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
            className="absolute mt-10 ml-3 z-50 md:hidden bg-gray-900 rounded-xl p-3 space-y-2 shadow-xl"
          >
            {["Load File", "Load Project", "Explain Code", "Copy Explanation", "Clear All"].map(
              (label, index) => (
                <button
                  key={index}
                  className="
                    bg-gray-700 text-amber-50 w-40 h-8 rounded-2xl text-xs
                    flex items-center justify-center truncate
                    hover:bg-orange-600 transition duration-200 cursor-pointer
                  "
                >
                  {label}
                </button>
              )
            )}
          </div>
        )}

        <CodeEditor />
      </div>
    </>
  );
};

export default Button;
