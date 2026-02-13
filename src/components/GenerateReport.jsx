import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./loader";
import { baseUrl_2 } from "../baseUrl";


const SummaryBox = ({ label, value }) => (
  <div className="bg-[#111] border border-gray-700 rounded p-3">
    <div className="text-gray-400 text-xs">{label}</div>
    <div className="text-white text-lg font-semibold">{value ?? 0}</div>
  </div>
);

const GenerateReport = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("design");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [designData, setDesignData] = useState(null);
  const [moduleData, setModuleData] = useState({});

  const getEditorCode = () => {
    const editor = window.monacoEditor;
    if (!editor || !editor.getModel()) return "";
    return editor.getValue();
  };

  const fetchReport = async () => {
    try {
      const code = getEditorCode();
      if (!code.trim()) {
        setError("Editor is empty");
        return;
      }

      setLoading(true);
      setError("");

      const res = await axios.post(
        `${baseUrl_2}/report/`,
        { code },
        { headers: { "Content-Type": "application/json" } },
      );

      const design = res.data.design_summary || {};
      const modules = res.data.module_details || {};

      const totalLines = code.split("\n").length;

      setDesignData({
        lines: totalLines,
        modules: design.total_modules || 0,
        assigns: design.total_assigns || 0,
        always_blocks: design.total_always_blocks || 0,
      });

      setModuleData(modules);
    } catch (err) {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchReport();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99999] flex items-center justify-center"
    onClick={onClose}
    >
      <div className="w-[80%] h-[85vh] bg-[#0f0f0f] rounded border border-gray-600 flex flex-col border border-white/80 rounded"
      onClick={(e)=>e.stopPropagation()}
      >
        <div className="flex justify-between px-4 py-2 border-b border-gray-600 bg-[#111]">
          <div className="flex gap-2">
            {["design", "module"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-sm rounded cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#0078d4] text-white"
                    : "bg-[#1e1e1e] text-gray-300"
                }`}
              >
                {tab === "design" ? "Design Summary" : "Module Details"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-white text-lg cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 text-gray-300">
          {loading && (
            <div className="py-12 text-center">
              <Loader size="3.5em" />
              <div className="mt-3 text-gray-400 text-sm">
                Generating report…
              </div>
            </div>
          )}

          {!loading && activeTab === "design" && designData && (
            <div className="grid grid-cols-2 gap-4">
              <SummaryBox label="Total Lines" value={designData.lines} />
              <SummaryBox label="Modules Count" value={designData.modules} />
              <SummaryBox
                label="Assign Statements"
                value={designData.assigns}
              />
              <SummaryBox
                label="Always Blocks"
                value={designData.always_blocks}
              />
            </div>
          )}

          {!loading &&
            activeTab === "module" &&
            Object.entries(moduleData).map(([mod, d]) => {
              const always = d.always || {};

              const complexity =
                (d.wires || 0) * 5 +
                (d.regs || 0) * 4 +
                (d.logic || 0) * 3 +
                (d.instances || 0) * 2;

              return (
                <div
                  key={mod}
                  className="mb-6 bg-black border border-gray-700 rounded p-4 font-mono text-sm text-gray-200"
                >
                  <pre className="whitespace-pre leading-relaxed">
                    {[
                      `MODULE        : ${d.module || mod}`,
                      `Parameters    : None`,
                      `Inputs        : ${d.inputs ?? 0}`,
                      `Outputs       : ${d.outputs ?? 0}`,
                      `Inouts        : ${d.inouts ?? 0}`,
                      `Regs          : ${d.regs ?? 0}`,
                      `Wires         : ${d.wires ?? 0}`,
                      `Logic         : ${d.logic ?? 0}`,
                      `Memories      : ${d.memories ?? 0}`,
                      `Instances     : ${d.instances ?? 0}`,
                      `Always Total  : ${always.total ?? 0} (Clocked=${always.clocked ?? 0}, Comb=${always.comb ?? 0}, Latch=${always.latch ?? 0})`,
                      `Complexity    : ${complexity.toFixed(1)}`,
                    ].join("\n")}
                  </pre>
                </div>
              );
            })}

          {error && <div className="text-red-400 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default GenerateReport;
