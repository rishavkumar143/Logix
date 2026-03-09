import React, { useState } from "react";

const BlockDiagram = ({ open, onClose }) => {
  if (!open) return null;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBlockInfo, setShowBlockInfo] = useState(true);

  const handleZoomIn = () => {
    setZoomLevel((prev) => prev + 0.1);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.2, prev - 0.1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] backdrop-blur-xs flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[80%] h-[85vh] bg-black text-white border border-white rounded-md overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-9 bg-[#1b1b1b] border-b border-gray-700 flex items-center justify-between px-4 text-sm">
          <span>Block Diagram - </span>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-400 text-sm leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pt-3 pb-3 border-b border-gray-700">
          <div className="flex items-center justify-center gap-6 text-xs h-full">
            <div className="relative border justify-center border-gray-600 px-4 pt-4 pb-6 w-[24%]">
              <span className="absolute -top-3 left-3 bg-black px-2 text-xs text-gray-300">
                Filters
              </span>

              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Ports
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Cells
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Logic
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> Connections
                </label>
              </div>
            </div>

            <div className="relative border border-gray-600 px-4 pt-4 pb-3 w-[42%]">
              <span className="absolute -top-3 left-3 bg-black px-2 text-xs text-gray-300">
                View
              </span>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span>Zoom</span>

                <button
                  onClick={handleZoomIn}
                  className="bg-[#2d8db3] hover:bg-[#154c61] px-3 py-1.5"
                >
                  +
                </button>

                <button
                  onClick={handleZoomOut}
                  className="bg-[#2d8db3] hover:bg-[#154c61] px-3 py-1.5"
                >
                  -
                </button>

                <button
                  onClick={handleResetZoom}
                  className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1.5 ml-2"
                >
                  Reset
                </button>

                <button className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1.5">
                  Fit View
                </button>

                <button className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1.5">
                  Refresh
                </button>

                <button className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1.5">
                  Export PNG
                </button>
              </div>
            </div>

            <div className="relative border border-gray-600 px-4 pt-4 pb-3 w-[30%]">
              <span className="absolute -top-3 left-3 bg-black px-2 text-xs text-gray-300">
                Advanced
              </span>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <button className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1.5">
                  View Schematic
                </button>

                <button className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1.5">
                  Hierarchy View
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-gray-700 text-gray-300 text-xs">
          Ready - Click on any block for details
        </div>

        <div className="flex-1 overflow-auto px-4 py-3 text-gray-400 text-sm">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease",
            }}
          >
            No hierarchy data available
          </div>
        </div>

        {showBlockInfo && (
          <div className="h-28 bg-[#0f0f0f] border-t border-gray-700 px-4 py-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Block Information</span>
              <button
                onClick={() => setShowBlockInfo(false)}
                className="bg-[#2d8db3] hover:bg-[#154c61] px-4 py-1 text-xs"
              >
                Hide
              </button>
            </div>

            <div className="mt-2 text-gray-400 text-xs">
              Select a block to see details...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDiagram;
