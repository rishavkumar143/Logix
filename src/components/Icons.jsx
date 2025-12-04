import React, { useState } from "react";
import { FaCaretRight } from "react-icons/fa";


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [open5, setOpen5] = useState(false);
  return (
    <nav className="bg-gray-900 text-gray-200 px-5 select-none shadow-lg">
      <ul className="flex gap-7">
        <li 
          className="relative hover:text-blue-400 cursor-pointer transition"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          File
          {open && (
            <ul className="absolute left-0 mt-2 bg-gray-800 shadow-xl rounded-lg w-50 py-2 animate-fadeIn border border-gray-700">
              <li className="flex space-x-20 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
                <span>New</span>
                <span>Ctrl+N</span>
              </li>
              <li className="flex space-x-11 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
                <span>Open File</span>
                <span>Ctrl+O</span>
              </li>
              <li className="flex space-x-14 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-700">
                <span>Open Recent</span>
                <span><FaCaretRight /></span>
              </li>
              <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-700">Open Project Folder</li>
              <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">Exit</li>
            </ul>
          )}
        </li>

        <li 
        className="relative hover:text-blue-400 cursor-pointer transition"
        onMouseEnter={()=>setOpen1(true)}
        onMouseLeave={()=>setOpen1(false)}
        >Edit
        {open1 && (
          <ul className="absolute left-0 mt-2 bg-gray-800 shadow-xl rounded-lg w-40 py-2 animate-fadeIn border border-gray-700">
          <li className="flex space-x-5 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
            <span>Undo</span>
            <span>Ctrl+Z</span>
          </li>
          <li className="flex space-x-6 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-700">
            <span>Redo</span>
            <span>Ctrl+Y</span>
          </li>
          <li className="flex space-x-8 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
            <span>Find</span>
            <span>Ctrl+F</span>
          </li>
          </ul>
        )}
        </li>
        <li 
        className="relative hover:text-blue-400 cursor-pointer transition"
        onMouseEnter={()=>setOpen2(true)}
        onMouseLeave={()=>setOpen2(false)}
        >View
        {open2 && (
          <ul className="absolute left-0 mt-2 bg-gray-800 shadow-xl rounded-lg w-50 py-2 animate-fadeIn border border-gray-700">
          <li className="flex space-x-14 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
            <span>Zoom In</span>
            <span>Ctrl++</span>
          </li>
          <li className="flex space-x-11 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
            <span>Zoom Out</span>
            <span>Ctrl+-</span>
          </li>
          <li className="flex space-x-8 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">
            <span>Reset Zoom</span>
            <span>Ctrl+O</span>
          </li>
          </ul>
        )
        
        }
        </li>
        <li 
        className="relative hover:text-blue-400 cursor-pointer transition"
        onMouseEnter={()=>setOpen3(true)}
        onMouseLeave={()=>setOpen3(false)}
        >Generate
        {open3 && (
          <ul className="absolute left-0 mt-2 bg-gray-800 shadow-xl rounded-lg w-60 py-2 animate-fadeIn border border-gray-700">
          <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">Generate UVM TestBench </li>
          <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-700">Grenerate Report</li>
          <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">Include Header Preview</li>
          </ul>
        )}
        </li>
        <li 
        className="relative hover:text-blue-400 cursor-pointer transition"
        onMouseEnter={()=>setOpen4(true)}
        onMouseLeave={()=>setOpen4(false)}
        >Generate View
        {open4 && (
          <ul className="absolute left-0 mt-2 bg-gray-800 shadow-xl rounded-lg w-35 py-2 animate-fadeIn border border-gray-700">
          <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-700">Hierarchy View</li>
          </ul>
        )}</li>
        <li 
        className="relative hover:text-blue-400 cursor-pointer transition"
        onMouseEnter={()=>setOpen5(true)}
        onMouseLeave={()=>setOpen5(false)}
        >Help
        {open5 && (
          <ul className="absolute left-0 mt-2 bg-gray-800 shadow-xl rounded-lg w-35 py-2 animate-fadeIn border border-gray-700">
          <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer border-b border-gray-700">Documentation</li>
          <li className="px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer">About</li>
          </ul>
        )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
