import React from "react";

const Icons = () => {
  return (
    <nav className="w-full text-black-100 shadow-md">
      <ul className="flex gap-5 px-5 text-lg font-small text-sm">
        <li className="hover:text-blue-400 cursor-pointer transition">File</li>
        <li className="hover:text-blue-400 cursor-pointer transition">Edit</li>
        <li className="hover:text-blue-400 cursor-pointer transition">View</li>
        <li className="hover:text-blue-400 cursor-pointer transition">Generate</li>
        <li className="hover:text-blue-400 cursor-pointer transition">Generate View</li>
        <li className="hover:text-blue-400 cursor-pointer transition">Help</li>
      </ul>
    </nav>
  );
};

export default Icons;
