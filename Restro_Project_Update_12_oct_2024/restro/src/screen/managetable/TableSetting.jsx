import React, { useState } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications,IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
// import pic1 from "../../assets/images/2(1).png"
import pic2 from "../../assets/images/3.png"
import pic3 from "../../assets/images/4.png"
import pic4 from "../../assets/images/8.png"
import { FaMagnifyingGlass } from "react-icons/fa6";

import {  FaRegEdit } from "react-icons/fa";
import { IoDocumentTextOutline, IoWalletOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";


const TableSetting = () => {
 
 




 




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
              Table Setting
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              </div>
            </div>


          
           <div className=" border-[1px] border-[#4CBBA1] mt-11 gap-12 grid-cols-4 grid p-10 ">
            

          <img src={pic2} alt="" className=" h-[100px] w-[150px]"  />
          <img src={pic3} alt="" className=" h-[100px] w-[150px]"/>
          <img src={pic4} alt="" className=" h-[100px] w-[150px]" />
          <img src={pic2} alt="" className=" h-[100px] w-[150px]" />
          <img src={pic2} alt="" className=" h-[100px] w-[150px]"  />
          <img src={pic3} alt="" className=" h-[100px] w-[150px]"/>
          <img src={pic4} alt="" className=" h-[100px] w-[150px]" />
          <img src={pic2} alt="" className=" h-[100px] w-[150px]" />
          <img src={pic2} alt="" className=" h-[100px] w-[150px]"  />
          <img src={pic3} alt="" className=" h-[100px] w-[150px]"/>
          <img src={pic4} alt="" className=" h-[100px] w-[150px]" />
          <img src={pic2} alt="" className=" h-[100px] w-[150px]" />




           </div>






          </div>
        </section>
      </div>
    </>
  );
};

export default TableSetting;
