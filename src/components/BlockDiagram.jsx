import React, { useState, useEffect } from "react";
import axios from "axios";
import Schematic from "./Schematic";
import Hierarchy from "./Hirearchy";
import ReactFlow, { Background, Handle, Position, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

/* ---------------- CUSTOM STYLES ---------------- */
const pinLabelStyle = {
  fontSize: "10px",
  color: "#00ff9c",
  margin: "0 5px",
  fontWeight: "normal",
};

/* ---------------- SPI NODE ---------------- */
const SpiNode = ({ data, showPorts }) => {
  const scale = data.scale || 1;
  return (
    <div
      style={{
        width: 250,
        minHeight: 140,
        background: "#3a95c9",
        border: "2px solid #5aa9d6",
        color: "white",
        borderRadius: "2px",
        position: "relative",
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <div
        style={{
          background: "#2d8db3",
          padding: "5px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "14px",
          borderBottom: "1px solid #5aa9d6",
        }}
      >
        {data.label}
      </div>

      <div style={{ height: "140px", position: "relative" }}>
        {/* LEFT PORTS */}
        {!showPorts && (
          <div
            style={{
              position: "absolute",
              left: "-60px",
              top: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            {["sck", "MOSI", "cs"].map((label) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#00ff9c",
                    borderRadius: "50%",
                  }}
                />
                <span
                  style={{
                    color: "#00ff9c",
                    fontSize: "12px",
                    margin: "0 4px",
                  }}
                >
                  ➤➤
                </span>
                <span style={pinLabelStyle}>{label}</span>
                <span style={{ color: "#00ff9c", fontSize: "12px" }}>➤</span>

                <Handle
                  type="target"
                  position={Position.Left}
                  id={`in-${label}`}
                  style={{
                    position: "relative",
                    background: "transparent",
                    border: "none",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* RIGHT PORT */}
        {!showPorts && (
          <div
            style={{
              position: "absolute",
              right: "-75px",
              top: "30px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Handle
              type="source"
              position={Position.Right}
              id="out-miso"
              style={{
                position: "relative",
                background: "transparent",
                border: "none",
              }}
            />

            <span style={{ color: "#ff5c5c", fontSize: "12px" }}>MISO</span>
            <span
              style={{ color: "#ff5c5c", fontSize: "12px", margin: "0 4px" }}
            >
              ➤➤
            </span>

            <div
              style={{
                width: "8px",
                height: "8px",
                background: "#ff5c5c",
                borderRadius: "50%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- MODULE NODE ---------------- */
const ModuleNode = ({ data }) => {
  const scale = data.scale || 1;
  return (
    <div
      style={{
        width: 200,
        height: 100,
        background: data.color === "green" ? "#3cc47c" : "#e67e22",
border: data.color === "green" ? "2px solid #2ecc71" : "2px solid #f39c12",
        color: "white",
        textAlign: "center",
        paddingTop: 10,
        borderRadius: "4px",
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        {data.label}
      </div>
      <div style={{ fontSize: "5px", opacity: 0.8 }}>
        {data.instance || "logic_blk"}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#00ff9c", width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#00ff9c", width: 8, height: 8 }}
      />
    </div>
  );
};

const nodeTypes = {
  spiNode: (props) => <SpiNode {...props} showPorts={props.data.showPorts} />,
  moduleNode: ModuleNode,
};

/* ---------------- MAIN COMPONENT ---------------- */
const BlockDiagram = ({ open, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBlockInfo, setShowBlockInfo] = useState(true);
  const [diagramData, setDiagramData] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showPorts, setShowPorts] = useState(false);
  const [openSchematic, setOpenSchematic] = useState(false);
  const [openHierarchy, setOpenHierarchy] = useState(false);
  const [splitLayout, setSplitLayout] = useState(false);
  const [boxScale, setBoxScale] = useState(1);
  const handleZoomIn = () => setZoomLevel((z) => z + 0.1);
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.2, z - 0.1));
  const handleResetZoom = () => setZoomLevel(1);

  const handleRefreshLayout = () => {
    setSplitLayout(true);

    // random size change
    const randomScale = Math.random() * 1.2 + 0.6;
    setBoxScale(randomScale);
  };

  const handleFitViewLayout = () => {
    setSplitLayout(false);
    setBoxScale(1); // original size
  };

  const handleNodeClick = (event, node) => {
    const isTop = node.type === "spiNode";

    setSelectedBlock({
      name: node.id,
      type: isTop ? "top" : "cell",
      nodeId: isTop ? `TOP:${node.id}` : `CELL:${node.id}`,
      instance: node.data.instance || "N/A",
      pinCount: isTop ? 4 : 2,
      position: `X=${Math.round(node.position.x)}, Y=${Math.round(node.position.y)}`,
      size: isTop ? "250 x 140" : "200 x 100",
    });
  };

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        await axios.get("https://python.verifplay.com/detect-protocol/");
        const res = await axios.get(
          "https://python.verifplay.com/build-block-diagram/",
        );
        setDiagramData(res.data);
      } catch (err) {
        console.error("API Error:", err);
      }
    };
    if (open) fetchDiagram();
  }, [open]);

  if (!open) return null;

  const nodes = [];

  nodes.push({
    id: "SPI_slave",
    type: "spiNode",
    position: { x: 750, y: 50 },
    data: { label: "SPI_slave", showPorts: showPorts, scale: boxScale },
  });

  if (diagramData?.blocks) {
    const otherBlocks = diagramData.blocks.filter(
      (b) => b.name !== "SPI_slave",
    );
const firstRowMax = 6;
    otherBlocks.forEach((block, index) => {
  let xPos, yPos;
  const spacingX = 220;
const spacingY = 150;

const totalBlocks = otherBlocks.length;

// data zyada → 5 per row, kam → 8 per row
const boxesPerRow = totalBlocks > 12 ? 5 : 8;

const col = index % boxesPerRow;
const row = Math.floor(index / boxesPerRow);

// current row me kitne boxes
const remaining = totalBlocks - row * boxesPerRow;
const boxesInRow = Math.min(boxesPerRow, remaining);

// row ko center karna (blue box x = 750)
const rowWidth = (boxesInRow - 1) * spacingX;
const startX = 750 - rowWidth / 2;

xPos = startX + col * spacingX;
yPos = 300 + row * spacingY;

  const isLargeData = otherBlocks.length > 12;
  const isGreen = isLargeData && index % 4 === 0;

  nodes.push({
    id: block.name,
    type: "moduleNode",
    position: { x: xPos, y: yPos },
    data: {
      label: block.name,
      instance: block.instance,
      scale: boxScale,
      color: isGreen ? "green" : "orange"
    },
  });

});
  }
  const edges =
    diagramData?.connections?.map((conn, index) => ({
      id: "e" + index,
      source: conn.from,
      target: conn.to,
      type: "smoothstep",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#00ff9c" },
      style: { stroke: "#00ff9c", strokeWidth: 2 },
    })) || [];
  const dataLoaded = diagramData && diagramData.blocks;

  return (
    <div
      className="fixed inset-0 z-[9999] backdrop-blur-xs flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[90%] h-[90vh] bg-black text-white border border-white rounded-md overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="h-9 bg-[#1b1b1b] border-b border-gray-700 flex items-center justify-between px-4 text-sm">
          <span>Block Diagram</span>
          <button onClick={onClose} className="text-white hover:text-gray-400">
            ✕
          </button>
        </div>

        {/* CONTROLS */}

        <div className="px-4 pt-3 pb-3 border-b border-gray-700">
          <div className="flex items-center justify-center gap-6 text-xs">
            {/* Filters */}

            <div className="relative border border-gray-600 px-4 pt-4 pb-6 w-[24%]">
              <span className="absolute -top-3 left-3 bg-black px-2 text-gray-300">
                Filters
              </span>

              <div className="flex gap-4">
                <label>
                  <input
                    type="checkbox"
                    checked={showPorts}
                    onChange={(e) => setShowPorts(e.target.checked)}
                  />{" "}
                  Ports
                </label>
                <label>
                  <input type="checkbox" /> Cells
                </label>
                <label>
                  <input type="checkbox" /> Logic
                </label>
                <label>
                  <input type="checkbox" /> Connections
                </label>
              </div>
            </div>

            {/* View */}

            <div className="relative border border-gray-600 px-4 pt-4 pb-3 w-[42%]">
              <span className="absolute -top-3 left-3 bg-black px-2 text-gray-300">
                View
              </span>

              <div className="flex items-center gap-3 flex-wrap">
                <span>Zoom</span>

                <button
                  onClick={handleZoomIn}
                  className="bg-[#2d8db3] px-3 py-1.5"
                >
                  +
                </button>
                <button
                  onClick={handleZoomOut}
                  className="bg-[#2d8db3] px-3 py-1.5"
                >
                  -
                </button>
                <button
                  onClick={handleResetZoom}
                  className="bg-[#2d8db3] px-4 py-1.5"
                >
                  Reset
                </button>

                <button
                  onClick={handleFitViewLayout}
                  className="bg-[#2d8db3] px-4 py-1.5"
                >
                  Fit View
                </button>

                <button
                  onClick={handleRefreshLayout}
                  className="bg-[#2d8db3] px-4 py-1.5"
                >
                  Refresh
                </button>
                <button className="bg-[#2d8db3] px-4 py-1.5">Export PNG</button>
              </div>
            </div>

            {/* Advanced */}

            <div className="relative border border-gray-600 px-4 pt-4 pb-3 w-[30%]">
              <span className="absolute -top-3 left-3 bg-black px-2 text-gray-300">
                Advanced
              </span>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  disabled={!dataLoaded}
                  onClick={() => setOpenSchematic(true)}
                  className={`px-4 py-1.5 ${
                    dataLoaded
                      ? "bg-[#2d8db3]"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  View Schematic
                </button>

                <button
                  disabled={!dataLoaded}
                  onClick={() => setOpenHierarchy(true)}
                  className={`px-4 py-1.5 ${
                    dataLoaded
                      ? "bg-[#2d8db3]"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                >
                  Hierarchy View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS */}

        <div className="px-4 py-2 border-b border-gray-700 text-gray-300 text-xs">
          Ready - Click on any block for details
        </div>

        {/* DIAGRAM */}

        <div className="flex-1 overflow-auto bg-[#0b0b0b]">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              height: "100%",
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={!showPorts ? edges : []}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Background color="#333" gap={12} />
            </ReactFlow>
          </div>
        </div>

        {/* BLOCK INFO */}

        {showBlockInfo && (
          <div className="h-40 bg-[#0f0f0f] border-t border-gray-700 px-4 py-3 text-sm flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Block Information</span>

              <button
                onClick={() => setShowBlockInfo(false)}
                className="bg-[#2d8db3] px-4 py-1 text-xs"
              >
                Hide
              </button>
            </div>

            <div className="flex-1 overflow-y-auto text-xs text-gray-300">
              {selectedBlock ? (
                <div className="grid grid-cols-[140px_auto] gap-y-1">
                  <div className="font-semibold col-span-2 mb-1">
                    BLOCK DETAILS
                  </div>

                  <div>Name</div>
                  <div>: {selectedBlock.name}</div>

                  <div>Type</div>
                  <div>: {selectedBlock.type}</div>

                  <div>Node ID</div>
                  <div>: {selectedBlock.nodeId}</div>

                  <div>Instance</div>
                  <div>: {selectedBlock.instance}</div>

                  <div>Pin Count</div>
                  <div>: {selectedBlock.pinCount}</div>

                  <div>Position</div>
                  <div>: {selectedBlock.position}</div>

                  <div>Size</div>
                  <div>: {selectedBlock.size}</div>
                </div>
              ) : (
                <div>Select a block to see details...</div>
              )}
            </div>
          </div>
        )}
      </div>
      {openSchematic && (
        <Schematic
          open={openSchematic}
          onClose={() => setOpenSchematic(false)}
        />
      )}

      {openHierarchy && (
        <Hierarchy
          open={openHierarchy}
          onClose={() => setOpenHierarchy(false)}
        />
      )}
    </div>
  );
};

export default BlockDiagram;
