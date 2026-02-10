import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl_2 } from "../baseUrl";

/* ================= SMALL UI ================= */

const SummaryBox = ({ label, value }) => (
  <div className="bg-[#111] border border-gray-700 rounded p-3">
    <div className="text-gray-400 text-xs">{label}</div>
    <div className="text-white text-lg font-semibold">{value ?? "-"}</div>
  </div>
);

const DetailRow = ({ title, data }) => (
  <div className="mb-3">
    <div className="text-gray-400 text-xs mb-1 capitalize">{title}</div>
    <div className="flex flex-wrap gap-2">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((item, i) => (
          <span
            key={i}
            className="px-2 py-[2px] bg-[#1e1e1e] border border-gray-600 rounded text-xs"
          >
            {item}
          </span>
        ))
      ) : (
        <span className="text-gray-500 text-xs">None</span>
      )}
    </div>
  </div>
);

/* ================= MAIN ================= */

const GenerateReport = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("design");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [reportData, setReportData] = useState(null);
  const [allModulePorts, setAllModulePorts] = useState({});

  /* ================= GET EDITOR CODE ================= */

  const getEditorCode = () => {
    const editor = window.monacoEditor;
    if (!editor || !editor.getModel()) return "";
    return editor.getValue();
  };

  /* ================= DESIGN REPORT ================= */

  const fetchDesignReport = async () => {
    try {
      const code = getEditorCode();
      if (!code.trim()) return;

      setLoading(true);
      setError("");

      const res = await axios.post(
        `${baseUrl_2}/report/`,
        { code },
        { headers: { "Content-Type": "application/json" } }
      );

      setReportData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate design report");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MODULES + PORTS ================= */

  const fetchAllModulesAndPorts = async () => {
    try {
      const code = getEditorCode();
      if (!code.trim()) return;

      setLoading(true);
      setError("");
      setAllModulePorts({});

      // 1️⃣ get all modules
      const modRes = await axios.post(
        "https://python.verifplay.com/parser/modules/",
        { verilog_code: code },
        { headers: { "Content-Type": "application/json" } }
      );

      const modules = modRes?.data?.modules || [];
      const result = {};

      // 2️⃣ get ports for each module
      for (const mod of modules) {
        try {
          const portRes = await axios.post(
            "https://python.verifplay.com/parser/ports/",
            {
              verilog_code: code,
              module_name: mod,
            },
            { headers: { "Content-Type": "application/json" } }
          );

          // 🔥 ports API returns ARRAY [{name, direction}]
          result[mod] = Array.isArray(portRes.data) ? portRes.data : [];
        } catch (err) {
          console.error("PORT API ERROR 👉", err.response?.data);
          result[mod] = [];
        }
      }

      setAllModulePorts(result);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch module details");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!open) return;

    if (activeTab === "design") fetchDesignReport();
    if (activeTab === "module") fetchAllModulesAndPorts();
  }, [open, activeTab]);

  if (!open) return null;

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center">                             {/* backdrop-blur-sm    blur karne ke liye */}
      <div className="w-[1050px] h-[520px] bg-[#0f0f0f] rounded border border-gray-600 flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-2 border-b border-gray-600 bg-[#111]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("design")}
              className={`px-3 py-1 text-sm rounded ${
                activeTab === "design"
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#1e1e1e] text-gray-300"
              }`}
            >
              Design Summary
            </button>

            <button
              onClick={() => setActiveTab("module")}
              className={`px-3 py-1 text-sm rounded ${
                activeTab === "module"
                  ? "bg-[#0078d4] text-white"
                  : "bg-[#1e1e1e] text-gray-300"
              }`}
            >
              Module Details
            </button>
          </div>

          <button onClick={onClose} className="text-white text-lg">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-auto p-4 text-gray-300">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-400">{error}</div>}

          {/* DESIGN TAB */}
          {activeTab === "design" && reportData && (
            <div className="grid grid-cols-2 gap-4">
              <SummaryBox label="Total Lines" value={reportData.lines} />
              <SummaryBox label="Modules Count" value={reportData.modules} />
              <SummaryBox label="Assign Statements" value={reportData.assigns} />
              <SummaryBox
                label="Always Blocks"
                value={reportData.always_blocks}
              />
            </div>
          )}

          {/* MODULE TAB – INPUT / OUTPUT FROM ARRAY */}
          {activeTab === "module" &&
            Object.entries(allModulePorts).map(([mod, ports]) => {
              const inputs = ports
                .filter(p => p.direction === "input")
                .map(p => p.name);

              const outputs = ports
                .filter(p => p.direction === "output")
                .map(p => p.name);

              const inouts = ports
                .filter(p => p.direction === "inout")
                .map(p => p.name);

              return (
                <div
                  key={mod}
                  className="mb-5 bg-[#111] border border-gray-700 rounded p-4"
                >
                  <div className="text-[#4fc3f7] font-semibold mb-3">
                    Module: {mod}
                  </div>

                  <DetailRow title="Inputs" data={inputs} />
                  <DetailRow title="Outputs" data={outputs} />
                  <DetailRow title="Inouts" data={inouts} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default GenerateReport;
