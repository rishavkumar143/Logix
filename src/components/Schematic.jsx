import React, { useEffect, useState } from "react";
import { CirclePlay, CirclePause, CookingPot } from "lucide-react";

const Schematic = ({ open, onClose }) => {
  if (!open) return null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fromNode, setFromNode] = useState(null);
  const [toNode, setToNode] = useState(null);
  const [pathType, setPathType] = useState("Data");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const openedFile = { name: "" };
      setFileName(openedFile.name);
      setData(null);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] border border-white flex items-center justify-center">
      <div className="h-[85vh] w-[80%] bg-black text-white flex flex-col text-xs relative">

        <button
          onClick={onClose}
          className="absolute top-1 right-4 hover:text-gray-400 text-white text-lg z-[9999]"
        >
          ✕
        </button>

        <div className="text-[14px] py-2 border-b text-sm font-semibold tracking-wide">
          <span className="ml-2">
            Block Schematic [GENERIC] - {fileName}
          </span>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-zinc-950">

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                Loading schematic data…
              </div>
            )}

            {!loading && !data && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                <div>No schematic data</div>
                <div className="text-[11px] mt-1">
                  Data from the backend will be rendered here once it is received.
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-6 right-6 w-[230px] border border-cyan-800 bg-zinc-950/90 p-3">
            <div className="font-semibold mb-2 text-[11px]">
              SIGNAL COLOR MEANING
            </div>
            <Legend color="bg-cyan-400" label="Clock Signals" />
            <Legend color="bg-red-500" label="Reset Signals" />
            <Legend color="bg-green-400" label="Connected Nets" />
            <Legend color="bg-purple-400" label="Control Signals" />
            <Legend color="bg-yellow-400" label="Bus Signals" />
            <Legend color="bg-pink-400" label="Control Path" />
          </div>
        </div>

        <div className="border-t border-zinc-1000">
          <div className="flex gap-3 px-3 py-2">
            <ToolbarBtn label="Hide Toolbar" />
            <ToolbarBtn label="Hide Legend" />
            <ToolbarBtn label="Hide Controls" />
            <ToolbarBtn label="Hide Details" />
            <ToolbarBtn label="Maximize View" />
            <div className="ml-auto flex items-center gap-2">
              <p className="mr-1 text-[13px]">UI controls :</p>
            </div>
          </div>

          <div className="font-semibold text-[16px] ml-3">
            Path Animation Controls
          </div>

          <div className="px-3 py-2 text-[12px] text-zinc-400">
            <div className="flex gap-8">
              <span>From: {fromNode ?? "(none)"}</span>
              <span>To: {toNode ?? "(none)"}</span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <span>Path Type:</span>
                {["Data", "Clock", "Control", "All"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPathType(type)}
                    className={
                      pathType === type ? "text-white" : "text-zinc-500"
                    }
                  >
                    ◆ {type}
                  </button>
                ))}
              </div>

              <div className="text-blue-300">
                Path Type: {pathType.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 pb-2">
            <ControlBtn icon={<CirclePlay size={14} />} label="Play Path" />
            <ControlBtn icon={<CirclePause size={14} />} label="Stop" />
            <ControlBtn icon={<CookingPot size={14} />} label="Reset" />
            <ControlBtn icon={<CookingPot size={14} />} label="Analysis Path" />

            <div className="font-semibold text-[14px] flex items-center">
              <input type="checkbox" className="ml-2 mr-2" />
              <span>Path Animation Controls</span>
            </div>

            <div className="ml-auto">
              <ControlBtn label="Close" />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 h-[140px] overflow-y-auto p-3 text-[11px] text-zinc-300">
          <div className="font-semibold mb-1">SELECTION GUIDE</div>
          <ul className="list-disc pl-4 space-y-1"></ul>

          <div className="font-semibold mt-3 mb-1">PATH TYPE TIPS</div>
        </div>
      </div>
    </div>
  );
};

const ToolbarBtn = ({ label }) => (
  <button className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-[14px]">
    {label}
  </button>
);

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2 mb-1">
    <div className={`w-3 h-3 ${color}`} />
    <span>{label}</span>
  </div>
);

const ControlBtn = ({ icon, label }) => (
  <button className="flex items-center gap-1 px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-[14px]">
    {icon}
    {label}
  </button>
);

export default Schematic;