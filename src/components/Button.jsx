import React from "react";
const Button = () => {
    return(
    <div className="min-h-screen bg-slate-900 ">
      <div className="flex space-x-4 px-3 py-3">
<button
  className="
    bg-gray-700
    text-white
    h-6            
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-blue-800
    cursor-pointer
  "
>
  Load File
</button>

<button
  className="
    bg-gray-700
    text-white
    h-6            
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8        
    hover:bg-blue-800
    cursor-pointer
  "
>
  Load Project
</button>

  <button
  className="
    bg-gray-700
    text-white
    h-6               
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-blue-800
    cursor-pointer
  "
>
  Explain Code
</button>

<button
  className="
    bg-gray-700
    text-white
    h-6                
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-blue-800
    cursor-pointer
  "
>
  Copy Explanation
</button>

<button
  className="
    bg-gray-700
    text-white
    h-6                
    px-3 py-0
    rounded-3xl
    text-xs
    transition-all
    duration-200
    hover:h-8          
    hover:bg-blue-800
    cursor-pointer
  "
>
  Clear All
</button>
</div>
</div>
    )
}
export default Button;