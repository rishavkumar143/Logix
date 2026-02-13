import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl_1 } from "../baseUrl";

const Hierarchy = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("top");
  const [hierarchyData, setHierarchyData] = useState(null);
  const [moduleDetails, setModuleDetails] = useState(null);
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
      const portsRes = await axios.post(
        `${baseUrl_1}/parser/ports/`,
        { module_name: moduleName },
        { headers: { "Content-Type": "application/json" } },
      );

      const portsArray = Array.isArray(portsRes.data) ? portsRes.data : [];

      const inputs = portsArray
        .filter((p) => p.direction === "input")
        .map((p) => p.name);

      const outputs = portsArray
        .filter((p) => p.direction === "output")
        .map((p) => p.name);

      setModuleDetails({ inputs, outputs });

      const internalRes = await axios.post(
        `${baseUrl_1}/parser/internal-signals/`,
        { module_name: moduleName },
        { headers: { "Content-Type": "application/json" } },
      );

      const internalData = internalRes.data || {};

      const combinedSignals = [
        ...(internalData.logic || []),
        ...(internalData.reg || []),
        ...(internalData.wire || []),
      ];

      setInternalSignals(combinedSignals);
    } catch (err) {
      setModuleDetails(null);
      setInternalSignals([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  
  const modules = hierarchyData?.modules || hierarchyData?.data?.modules || [];
  const inputs = moduleDetails?.inputs || [];
  const outputs = moduleDetails?.outputs || [];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-[85%] h-[85vh] bg-black text-white border border-white/60 rounded flex relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-lg hover:text-gray-400 cursor-pointer"
        >
          ✕
        </button>

        <div className="w-[250px] bg-[#111] border-r border-[#222] p-4 overflow-y-auto">
          <div className="text-sm font-semibold text-gray-300 mb-3">
            Modules
          </div>

          {modules.length > 0 ? (
            modules.map((m, i) => (
              <div
                key={i}
                onClick={() => handleModuleClick(m)}
                className={`cursor-pointer mb-1 truncate ${
                  selectedModule === m
                    ? "text-sky-400 font-semibold"
                    : "text-gray-400 hover:text-sky-400"
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
          <div className="flex gap-2 p-3 border-b border-[#222]">
            {[
              { key: "top", label: "Top Graph" },
              { key: "detail", label: "Module Detail" },
              { key: "graph", label: "Module Graph" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 text-sm border cursor-pointer ${
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
            {activeTab === "top" &&
              (modules.length > 0 ? (
                <div className="grid grid-cols-3 gap-10 place-items-center">
                  {modules.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleModuleClick(item)}
                      className="bg-sky-500 px-8 py-4 rounded min-w-[260px] text-center font-semibold cursor-pointer hover:bg-sky-600 transition"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No hierarchy data available</div>
              ))}

            {activeTab === "detail" && (
              <div className="text-gray-300 font-mono text-sm">
                {loading ? (
                  <p className="text-gray-400">Loading Module Details...</p>
                ) : selectedModule ? (
                  <>
                    <div className="font-bold mb-6 text-lg text-white">
                      Module: {selectedModule}
                    </div>

                    <div className="grid gap-10">
                      <div>
                        <div className="font-bold text-sky-400 mb-2">
                          INPUTS
                        </div>
                        <div className="-mt-3">-------</div>

                        {inputs.length > 0 ? (
                          inputs.map((i, idx) => <div key={idx}>{i}</div>)
                        ) : (
                          <div className="text-gray-500">No Inputs</div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-yellow-400 mb-2">
                          INTERNAL SIGNALS
                        </div>
                        <div className="-mt-3">----------------</div>
                        {internalSignals.length > 0 ? (
                          internalSignals.map((sig, idx) => (
                            <div key={idx}>
                              {typeof sig === "string" ? sig : sig?.name}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500">
                            No Internal Signals
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-green-400 mb-2">
                          OUTPUTS
                        </div>
                        <div className="-mt-3">-------</div>

                        {outputs.length > 0 ? (
                          outputs.map((o, idx) => <div key={idx}>{o}</div>)
                        ) : (
                          <div className="text-gray-500">No Outputs</div>
                        )}

                        <div className="mt-4 text-sm text-white border-t border-gray-5  00 pt-2">
                          Inputs: {inputs.length} | Outputs: {outputs.length} |
                          Signals: {internalSignals.length}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">
                    Select a module to view details
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;
