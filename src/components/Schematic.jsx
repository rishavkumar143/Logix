import React, { useEffect, useState } from "react";
import { CirclePlay, CirclePause, CookingPot } from "lucide-react";
import Loader from "./loader";

const Schematic = ({ open, onClose }) => {
  if (!open) return null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [fromNode, setFromNode] = useState(null);
  const [toNode, setToNode] = useState(null);
  const [pathType, setPathType] = useState("Data");
  const [fileName, setFileName] = useState("");

  const [showToolbar, setShowToolbar] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setFileName("example_block.v");
      setData({ ok: true });
      setLoading(false);
    }, 1500);
  }, []);

  const handleToggleControls = () => {
    setShowControls((prev) => {
      const next = !prev;
      setShowDetails(next);
      return next;
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="h-[85vh] w-[80%] bg-black text-white flex flex-col text-xs relative border border-white/80 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-1 right-4 hover:text-gray-400 text-white text-lg z-[9999] cursor-pointer"
        >
          ✕
        </button>

        <div className="text-[14px] py-2 border-b font-semibold">
          <span className="ml-2">
            Block Schematic [GENERIC] - {fileName}
          </span>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-zinc-950">

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader size="3.5em" />
              </div>
            )}

            {!loading && !data && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                <div>No schematic data</div>
                <div className="text-[11px] mt-1">
                  Data from backend will be rendered here.
                </div>
              </div>
            )}

            {!loading && data && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                Schematic Render Area
              </div>
            )}
          </div>

          {showLegend && !isMaximized && (
            <div className="absolute top-6 right-6 w-[230px] border border-cyan-800 bg-zinc-950/90 p-3 cursor-pointer">
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
          )}
        </div>

        <div className="border-t">
          <div className="flex gap-3 px-3 py-2">
            <ToolbarBtn
              label={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
              onClick={() => setShowToolbar((p) => !p)}
            />

            {showToolbar && (
              <>
                <ToolbarBtn
                  label={showLegend ? "Hide Legend" : "Show Legend"}
                  onClick={() => setShowLegend((p) => !p)}
                />
                <ToolbarBtn
                  label={showControls ? "Hide Controls" : "Show Controls"}
                  onClick={handleToggleControls}
                />
                <ToolbarBtn
                  label={showDetails ? "Hide Details" : "Show Details"}
                  onClick={() => setShowDetails((p) => !p)}
                />
                <ToolbarBtn
                  label={isMaximized ? "Exit Maximize" : "Maximize View"}
                  onClick={() => setIsMaximized((p) => !p)}
                />
              </>
            )}
          </div>

          {!isMaximized && showControls && (
            <>
              <div className="font-semibold text-[16px] ml-3">
                Path Animation Controls
              </div>

              <div className="px-3 py-2 text-[12px] text-zinc-400">
                <div className="flex gap-8">
                  <span>From: {fromNode ?? "(none)"}</span>
                  <span>To: {toNode ?? "(none)"}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <span>Path Type:</span>
                    {["Data", "Clock", "Control", "All"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setPathType(type)}
                        className={
                          pathType === type
                            ? "text-white cursor-pointer"
                            : "text-zinc-500 cursor-pointer"
                        }
                      >
                        ◆ {type}
                      </button>
                    ))}
                  </div>

                  <div className="text-blue-300 cursor-pointer">
                    Path Type: {pathType.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 pb-2">
                <ControlBtn icon={<CirclePlay size={14} />} label="Play Path" />
                <ControlBtn icon={<CirclePause size={14} />} label="Stop" />
                <ControlBtn icon={<CookingPot size={14} />} label="Reset" />
                <ControlBtn icon={<CookingPot size={14} />} label="Analyze Path" />

                <div className="ml-auto">
                  <ControlBtn label="Close" onClick={onClose} />
                </div>
              </div>
            </>
          )}

          {!isMaximized && showDetails && (
            <div className="border-t h-[160px] overflow-y-auto p-3 text-[11px] text-zinc-300 font-mono">
              <div className="font-black mb-1">SELECTION GUIDE</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click on schematic nodes</li>
                <li>Select start and end</li>
                <li>Choose path type</li>
                <li>Play to animate</li>
              </ul>

              <div className="font-black mt-4 mb-1">PATH TYPE TIPS</div>
              <ul className="list-disc pl-4 space-y-1">
                <li><b>DATA</b> : Data flow only</li>
                <li><b>CLOCK</b> : Clock paths</li>
                <li><b>CONTROL</b> : FSM & enable paths</li>
                <li><b>ALL</b> : Combined view</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToolbarBtn = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-[14px] cursor-pointer"
  >
    {label}
  </button>
);

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2 mb-1">
    <div className={`w-3 h-3 ${color}`} />
    <span>{label}</span>
  </div>
);

const ControlBtn = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-[14px] cursor-pointer"
  >
    {icon}
    {label}
  </button>
);

export default Schematic;
