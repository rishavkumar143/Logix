import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl_1 } from "../baseUrl";
import Loader from "./loader";

const Hierarchy = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("top");
  const [hierarchyData, setHierarchyData] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [moduleGraph, setModuleGraph] = useState(null);
  const [internalSignals, setInternalSignals] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchHierarchy = async () => {
      try {
        const res = await axios.get(`${baseUrl_1}/hierarchy/`);
        setHierarchyData(res.data);
      } catch (err) {
        setHierarchyData(null);
      }
    };

    fetchHierarchy();
  }, [open]);

  const handleModuleClick = async (moduleName) => {
    if (!moduleName) return;

    setSelectedModule(moduleName);
    setActiveTab("detail");
    setLoading(true);

    try {
      const res = await axios.post(
        `${baseUrl_1}/module/detail/`,
        { module: moduleName },
        { headers: { "Content-Type": "application/json" } },
      );

      const data = res.data || {};

      setModuleDetails(data);
      setInternalSignals(data.internal_signals || []);
    } catch (err) {
      setModuleDetails(null);
      setInternalSignals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopModuleClick = async (moduleName) => {
    if (!moduleName) return;

    setActiveTab("graph");
    setLoading(true);

    try {
      const res = await axios.get(`${baseUrl_1}/module/graph/`, {
        params: { module: moduleName },
      });

      setModuleGraph(res.data);
    } catch (err) {
      setModuleGraph(null);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const modules = hierarchyData?.modules || hierarchyData?.data?.modules || [];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-[80%] h-[85vh] bg-[#0f0f0f] text-white border border-[#222] rounded-xl flex relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-xl text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        <div className="w-[260px] bg-[#111] border-r border-[#222] p-4 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
            Modules
          </div>

          {modules.length > 0 ? (
            modules.map((m, i) => (
              <div
                key={i}
                onClick={() => handleModuleClick(m)}
                className={`cursor-pointer px-2 py-1 rounded text-sm mb-1 truncate transition ${
                  selectedModule === m
                    ? "bg-sky-600 text-white"
                    : "text-gray-400 hover:bg-[#1a1a1a] hover:text-sky-400"
                }`}
              >
                {m}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No modules found</div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex gap-2 p-4 border-b border-[#222]">
            {[
              { key: "top", label: "Top Graph" },
              { key: "detail", label: "Module Detail" },
              { key: "graph", label: "Module Graph" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-sm rounded-md transition ${
                  activeTab === tab.key
                    ? "bg-sky-600 text-white"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 font-mono text-sm text-white">
            {activeTab === "top" && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleTopModuleClick(item)}
                    className="bg-sky-600 hover:bg-sky-900 transition rounded-xl py-4 px-6 text-center font-semibold cursor-pointer shadow-lg"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "detail" && (
              <>
                {loading ? (
                  <div className="flex-1 overflow-auto p-4 text-gray-300">
                    {loading && (
                      <div className="py-12 text-center">
                        <Loader size="3.5em" />
                        <div className="mt-3 text-gray-400 text-sm">
                          Generating Module.....
                        </div>
                      </div>
                    )}
                  </div>
                ) : moduleDetails ? (
                  <>
                    <div className="text-xl font-bold text-white mb-6">
                      Module: {moduleDetails.module}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="text-sky-400 font-semibold">INPUTS</div>
                        {(moduleDetails.inputs || []).map((inp, i) => (
                          <div key={i}>{inp}</div>
                        ))}
                      </div>

                      <div>
                        <div className="text-yellow-400 font-semibold">
                          INTERNAL SIGNALS
                        </div>
                        {internalSignals.map((sig, i) => (
                          <div key={i}>{sig}</div>
                        ))}
                      </div>

                      <div>
                        <div className="text-green-400 font-semibold">
                          OUTPUTS
                        </div>
                        {(moduleDetails.outputs || []).map((out, i) => (
                          <div key={i}>{out}</div>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-[#222] pt-4 text-white">
                        Inputs: {moduleDetails.counts?.inputs || 0} | Outputs:{" "}
                        {moduleDetails.counts?.outputs || 0} | Signals:{" "}
                        {moduleDetails.counts?.signals || 0}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>Select a module</div>
                )}
              </>
            )}

            {activeTab === "graph" && (
              <>
                {loading ? (
                  <div className="flex-1 overflow-auto p-4 text-gray-300">
                    {loading && (
                      <div className="py-12 text-center">
                        <Loader size="3.5em" />
                        <div className="mt-3 text-gray-400 text-sm">
                          Generating Module.....
                        </div>
                      </div>
                    )}
                  </div>
                ) : moduleGraph ? (
                  <>
                    <div className="text-sm font-bold text-white mb-6 bg-sky-700 px-6 py-3 inline-block rounded">
                      MODULE: {moduleGraph.module}
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <div className="bg-teal-600 text-white font-semibold text-center py-2 rounded-t">
                          INPUTS ({moduleGraph.inputs?.length || 0})
                        </div>
                        <div className="bg-[#1a1a1a] p-3 space-y-2 rounded-b border border-[#333]">
                          {moduleGraph.inputs?.map((inp, i) => (
                            <div
                              key={i}
                              className="bg-[#111] border border-gray-700 px-3 py-2 text-sm rounded"
                            >
                              {inp.name} {inp.range}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="bg-amber-500 text-white font-semibold text-center py-2 rounded-t">
                          SIGNALS ({moduleGraph.internal_signals?.length || 0})
                        </div>
                        <div className="bg-[#1a1a1a] p-3 space-y-2 rounded-b border border-[#333] h-full overflow-y-auto">
                          {moduleGraph.internal_signals?.map((sig, i) => (
                            <div
                              key={i}
                              className="bg-[#111] border border-gray-700 px-3 py-2 text-sm rounded"
                            >
                              {sig}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="bg-red-500 text-white font-semibold text-center py-2 rounded-t">
                          OUTPUTS ({moduleGraph.outputs?.length || 0})
                        </div>
                        <div className="bg-[#1a1a1a] p-3 space-y-2 rounded-b border border-[#333]">
                          {moduleGraph.outputs?.map((out, i) => (
                            <div
                              key={i}
                              className="bg-[#111] border border-gray-700 px-3 py-2 text-sm rounded"
                            >
                              {out.name} {out.range}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>No Graph Data</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;
