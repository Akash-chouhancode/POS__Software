import React, { useState } from "react";
import Nav from "../../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";

import { FaRegEdit } from "react-icons/fa";

import { FaRegTrashCan } from "react-icons/fa6";

export const KitchenDeshbordSetting = () => {
  const ActionButtion = [
    { btn: "Copy" },
    { btn: "CSV" },
    { btn: "Excel" },
    { btn: "PDF" },
    { btn: "Column Visiblity" },
  ];
  const headers = ["SL.", "Unit Name", "Short Name", "Action"];

  const data = [
    {
      UnitName: "Poud",
      ShortName: "pnd.",
    },
    {
      UnitName: "Kilogram",
      ShortName: "Kg.",
    },
    {
      UnitName: "Liter",
      ShortName: "Ltr.",
    },
    {
      UnitName: "Gram",
      ShortName: "grm.",
    },
  ];

  const Tooltip = ({ message, children }) => {
    return (
      <div className="group relative flex">
        {children}
        <span className="absolute bottom-7 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
          {message}
        </span>
      </div>
    );
  };
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <div className="main_div ">
        <section className=" side_section flex">
          <div className={`${isOpen == false ? "hidden" : ""}`}>
            <Nav />
          </div>
          <header className="">
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </header>
          <div className=" contant_div w-full  ml-4 pr-7 mt-4 ">
            <div className="activtab flex justify-between">
              <h1 className=" flex items-center justify-center gap-1 font-semibold">
                Kitchen Dashboard Setting
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              </div>
            </div>

            {/* Search Bar */}

            <div className=" mt-11 w-full">
              <section>
                <div className=" flex justify-between">
                  <div className=" flex flex-wrap gap-x-5">
                    {ActionButtion.map((val, index) => (
                      <>
                        <div className="">
                          <button className="  hover:bg-[#1C1D3E] text-[#000] hover:scale-110 duration-300 hover:text-white border-[2px] border-zinc-300 rounded-md py-2  px-11 ">
                            {" "}
                            <div className="">
                              <span>{val.btn}</span>
                            </div>{" "}
                          </button>
                        </div>
                      </>
                    ))}
                  </div>
                  <div>
                    <div className="flex m-auto   px-4   rounded-md border-[1px] border-gray-900">
                      <button className="px-4 text-[#0f044a] text-sm">
                        <FaMagnifyingGlass />
                      </button>
                      <input
                        placeholder="Search Product..."
                        type="search"
                        className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className=" w-full border-[1px] border-[#4CBBA1] mt-14 p-20 rounded">
              <form action="">
                <div className="  flex items-center gap-x-10">
                  <label
                    htmlFor=""
                    className=" font-semibold text-wrap w-[150px]"
                  >
                    Kitchen Refresh time in second
                  </label>
                  <input
                    placeholder="Search Product..."
                    type="search"
                    className="shadow border border-[#4CBBA1]  rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outlin"
                  />

                  <button
                    type="submut"
                    className="h-[40px] w-[104px] bg-[#1C1D3E] rounded text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default KitchenDeshbordSetting;
