import React from 'react'

const MobileviewDialogBox = ({
    isOpen,
    onClose,
    title,
    children,
    button,
    isClick,
  }) => {
    if (!isOpen) return null;
  return (
    <div>
  <div>
    <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
      <div className="w-full max-w-md mx-4 px-4"> 
        <div className="py-4 bg-white rounded-md shadow-md border-[1px] border-[#1C1D3E]">
          <div className="flex py-3 px-2 justify-between items-center border-b-[1px] border-black">
            <h2 className="text-lg font-semibold">{title}</h2> 
            <button
              onClick={onClose}
              className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold rounded-full" 
            >
              X
            </button>
          </div>
          <div className="py-4">{children}</div> 
          <div className="flex justify-end p-2"> 
            <button
              onClick={isClick}
              className="bg-[#0f044a] text-sm text-[#fff] rounded-xl cursor-pointer p-2" 
            >
              {button}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
  </div>
</div>
  )
}

export default MobileviewDialogBox
