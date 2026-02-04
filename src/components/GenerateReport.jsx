import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl_2 } from "../baseUrl";


const SummaryBox = ({ label, value }) => (
  <div className="bg-[#111] border border-gray-700 rounded p-3">
    <div className="text-gray-400 text-xs">{label}</div>
    <div className="text-white text-lg font-semibold">
      {value ?? "-"}
    </div>
  </div>
);

const DetailRow = ({ title, data }) => (
  <div className="mb-2">
    <div className="text-gray-400 text-xs mb-1">{title}</div>
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

  const GenerateReport = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("design");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      const editor = window.monacoEditor;
      if (!editor || !editor.getModel()) return;

      const code = editor.getValue();
      if (!code.trim()) return;

      setLoading(true);
      setError("");
      setReportData(null);

      const res = await axios.post(
        `${baseUrl_2}/report/`,
        { code },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("REPORT DATA 👉", res.data);
      setReportData(res.data);
    } catch (err) {
      if (err?.message !== "Canceled") {
        console.error(err);
        setError("Failed to generate report");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchReport();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center">
      <div className="w-[1050px] h-[520px] bg-[#0f0f0f] rounded border border-gray-600 shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-600 bg-[#111]">
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

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-auto bg-[#0b0b0b]">
          {loading && (
            <div className="text-gray-400 text-sm p-4">
              Generating report...
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm p-4">{error}</div>
          )}

          {reportData && !loading && !error && (
            <div className="p-4 space-y-4 text-gray-300 text-sm">

              {/* DESIGN SUMMARY */}
              {activeTab === "design" && (
              <div className="grid grid-cols-2 gap-4">
                <SummaryBox label="Total Lines" value={reportData.lines} />
                <SummaryBox label="Modules Count" value={reportData.modules} />
                <SummaryBox label="Assign Statements" value={reportData.assigns} />
                <SummaryBox label="Always Blocks" value={reportData.always_blocks} />
              </div>
            )}

              {/* MODULE DETAILS */}
              {activeTab === "module" && (
              Object.keys(reportData.module_details || {}).length === 0 ? (
                <div className="text-gray-400 text-sm">
                  Module details not available from API
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(reportData.module_details).map(
                    ([moduleName, mod], idx) => (
                      <div key={idx} className="border border-gray-700 rounded bg-[#111] p-4">
                        <div className="text-[#4fc3f7] font-semibold mb-2">
                          Module: {moduleName}
                        </div>
                        <DetailRow title="Inputs" data={mod.inputs} />
                        <DetailRow title="Outputs" data={mod.outputs} />
                        <DetailRow title="Registers" data={mod.registers} />
                        <DetailRow title="Wires" data={mod.wires} />
                        <DetailRow title="Instances" data={mod.instances} />
                      </div>
                    )
                  )}
                </div>
              )
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateReport;
