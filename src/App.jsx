import React from "react";
import "./App.css";
import Icons from './components/Icons'
import Code from "./components/Code";


import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Code />} />        
      </Routes>
    </>
  );
}

export default App;
