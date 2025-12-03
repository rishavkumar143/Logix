import React from "react";
import './App.css'
import Icons from "./components/Icons";
import { Route, Routes } from "react-router-dom";



function App() {
    
  return (
    <>
      <Routes>
        <Route path='/' element={<Icons/>}/>
      </Routes>
    </>
  )
}

export default App
