import React from "react";
import "./App.css";
import LogixExplorer from "./components/LogixExplorer";

import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LogixExplorer />} />
      </Routes>
    </>
  );
}

export default App;
