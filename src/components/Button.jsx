import React from "react";
import CodeEditor from "../components/CodeEditor"
const Button = () => {
    return(
      <>
    <div className="min-h-screen bg-sky-100">
      <div className="flex space-x-4 px-3 py-3">
        <button
  className="
    bg-gray-900
    text-amber-50
    h-6            
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-orange-600
    hover:text-white
    cursor-pointer
  "
>
  Load File
</button>

<button
  className="
    bg-gray-900
    text-amber-50
    h-6            
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8        
    hover:bg-orange-600
    cursor-pointer
  "
>
  Load Project
</button>

  <button
  className="
    bg-gray-900
    text-amber-50
    h-6               
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-orange-600
    cursor-pointer
  "
>
  Explain Code
</button>

<button
  className="
    bg-gray-900
    text-amber-50
    h-6                
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-orange-600
    cursor-pointer
  "
>
  Copy Explanation
</button>

<button
  className="
    bg-gray-900
    text-amber-50
    h-6                
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-orange-600
    cursor-pointer
  "
>
  Clear All
</button>
</div>
<CodeEditor/>
</div>
</>
)
}
export default Button
