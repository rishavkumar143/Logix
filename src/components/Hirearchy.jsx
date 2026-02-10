import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl_1 } from "../baseUrl";

const Hierarchy = ({ open, onClose }) => {
  if (!open) return null;

  const [activeTab, setActiveTab] = useState("top");
  const [hierarchyData, setHierarchyData] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await axios.get(`${baseUrl_1}/hierarchy/`);
        setHierarchyData(res.data);
        if (res.data?.module?.length > 0) {
          handleModuleClick(res.data.module[0]);
        }
      } catch (err) {
        console.error(err);
        setHierarchyData(null);
      }
    };
    fetchHierarchy();
  }, []);

  const handleModuleClick = async (moduleName) => {
    setSelectedModule(moduleName);
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl_1}/parser/modules/`, {
        module: moduleName,
      });

      let data = res.data;
      if (res.data[moduleName]) {
        data = res.data[moduleName];
      }

      setModuleDetails(data);
    } catch (err) {
      console.error(err);
      setModuleDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const moduleData = moduleDetails || {};
  const inputs = Array.isArray(moduleData.inputs) ? moduleData.inputs : [];
  const signals = Array.isArray(moduleData.internal_signals)
    ? moduleData.internal_signals
    : [];
  const outputs = Array.isArray(moduleData.outputs) ? moduleData.outputs : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center">
      <div className="w-[80%] h-[85vh] bg-black text-white rounded relative flex">

        <button
          onClick={onClose}
          className="absolute top-3 right-4 hover:text-gray-400 text-white text-lg z-[9999]"
        >
          ✕
        </button>

        <div className="w-[180px] bg-[#111] border-r border-[#222] p-4 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-300 mb-3">
            Modules
          </div>
          <div className="text-sm">
            {hierarchyData?.module?.map((m, i) => (
              <div
                key={i}
                onClick={() => handleModuleClick(m)}
                className={`cursor-pointer truncate ${
                  selectedModule === m
                    ? "text-sky-400 font-semibold"
                    : "text-gray-400 hover:text-sky-400"
                }`}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex gap-2 p-3 border-b border-[#222]">
            {[
              { key: "top", label: "Top Graph" },
              { key: "detail", label: "Module Detail" },
              { key: "graph", label: "Module Graph" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-2 py-0.5 text-sm border transition ${
                  activeTab === tab.key
                    ? "bg-blue-500 border-blue-500"
                    : "border-[#333] hover:bg-[#1a1a1a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === "top" && hierarchyData && (
              <div className="grid grid-cols-3 gap-10 place-items-center">
                {hierarchyData.module?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-sky-500 px-8 py-4 rounded min-w-[260px] text-center font-semibold"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "detail" && (
              <div className="text-gray-300 font-mono">
                {loading ? (
                  <p className="text-gray-400">Loading Module Details...</p>
                ) : Object.keys(moduleData).length > 0 ? (
                  <>
                    <div className="font-bold mb-2 text-lg">
                      Module: {selectedModule}
                    </div>

                    <div className="mb-3">
                      <div className="font-bold text-sky-400">INPUTS</div>
                      {inputs.map((i, idx) => (
                        <div key={idx}>{i}</div>
                      ))}
                      <div>=================</div>

                    </div>

                    <div className="mb-3">
                      <div className="font-bold text-yellow-400">
                        INTERNAL SIGNALS
                      </div>
                      {signals.map((s, idx) => (
                        <div key={idx}>{s}</div>
                      ))}
                      <div>=================</div>

                    </div>

                    <div className="mb-3">
                      <div className="font-bold text-green-400">OUTPUTS</div>
                      {outputs.map((o, idx) => (
                        <div key={idx}>{o}</div>
                      ))}
                      <div>-----------------</div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">No module data found</p>
                )}
              </div>
            )}
            
            {activeTab === "graph" && hierarchyData && (
              <pre className="text-xs text-gray-300">
                {JSON.stringify(hierarchyData.hierarchy, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;