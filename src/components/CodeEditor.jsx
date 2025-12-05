import React from "react";

const code = `
function hello() {
  console.log("Hello World");
}

const add = (a, b) => {
  return a + b;
}

export default hello;
function hello() {
  console.log("Hello World");
}

const add = (a, b) => {
  return a + b;
}

export default hello;
function hello() {
  console.log("Hello World");
}

const add = (a, b) => {
  return a + b;
}

export default hello;
  console.log("Hello World");
}

const add = (a, b) => {
  return a + b;
}

export default hello;
function hello() {
  console.log("Hello World");
}

const add = (a, b) => {
  return a + b;
}

export default hello;
function hello() {
  console.log("Hello World");
}

const add = (a, b) => {
  return a + b;
}

export default hello;
`;

const CodeEditor = () => {
  const lines = code.split("\n");

  return (
    <div className="w-full bg-[#1B1B1B] text-gray-200 p-1 h-[705px] border border-gray-700">
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-slate-800 flex text-sm font-mono">
        <div className="pr-4 text-[#569CD6] bg-slate-800/40 select-none text-right border-r border-slate-700">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="whitespace-pre px-3">{code}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;