import React, { useState } from "react";

const TableModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
      <>
      <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none  ">
        <div className=" w-1/2 px-20">
          <div className="py-4   bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
            <div className="flex  py-5 px-4 justify-between items-center border-b-[1px] border-black">
              <h2 className="text-xl  font-semibold">{title}</h2>
              <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            X
          </button>
            </div>
            <div className=" p-4" >
            {children}
            </div>
          </div>
        </div>
      </div>
      <div className=" opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
    </>
  );
};

export default TableModal;
