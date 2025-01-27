import React, { useState } from "react";
import Hamburger from "hamburger-react";
import { NavLink } from "react-router-dom";
import {
  FaUserPlus,
  FaHandHoldingUsd,
  FaCalculator,
  FaMoneyCheck,
  FaNetworkWired,
} from "react-icons/fa";

import { TfiHeadphoneAlt } from "react-icons/tfi";
import { MdCropRotate, MdOutlineZoomInMap, MdTableBar } from "react-icons/md";
import { CiSaveDown2 } from "react-icons/ci";
import { FaKitchenSet, FaKeyboard } from "react-icons/fa6";
import { IoQrCodeOutline } from "react-icons/io5";
import { IoMdCart, IoIosMan, IoIosArrowDown } from "react-icons/io";
import { RiTodoLine } from "react-icons/ri";
const KitchenStatus = () => {
  const OrderButtons = [
    { id: 1, title: "New Order", icon: <MdCropRotate />, link: "/order-list" },
    {
      id: 2,
      title: "On Going Order",
      icon: <CiSaveDown2 />,
      link: "/ongoing-order",
    },
    {
      id: 3,
      title: "Kitchen Status",
      icon: <FaKitchenSet />,
      // link: "/kitchen-status",
    },
    { id: 4, title: "QR Order", icon: <IoQrCodeOutline />, link: "/qr-order" },
    { id: 5, title: "Online Order", icon: <IoMdCart />, link: "/online-order" },
    { id: 6, title: "Today Order", icon: <RiTodoLine />, link: "/today-order" },
  ];
  const ButtonsData2 = [
    { id: 1, title: "AddCust.", icon: <FaUserPlus /> },
    { id: 2, title: "Cust.type", icon: <TfiHeadphoneAlt /> },
    { id: 3, title: "Waiter", icon: <IoIosMan /> },
    { id: 4, title: "Shortcut", icon: <FaKeyboard /> },
    { id: 5, title: "Zoom", icon: <MdOutlineZoomInMap /> },
    { id: 6, title: "TableMgmt.", icon: <MdTableBar /> },
    { id: 7, title: "CaseReg.", icon: <FaMoneyCheck /> },
    { id: 8, title: "Calculator", icon: <FaCalculator /> },
    { id: 9, title: "Hold", icon: <FaHandHoldingUsd /> },
    { id: 10, title: "Transaction", icon: <FaNetworkWired /> },
  ];
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <header className="pr-4 pl-4">
        <section className="section1 flex justify-evenly gap-x-6 pt-2 ">
          <div className=" flex gap-x-6">
            <header>
              <Hamburger />
            </header>

            <div className="orderButton flex flex-wrap ">
              {OrderButtons.map((val, index) => (
                <>
                  <div className=" w-1/3 ">
                    <NavLink to={val.link}>
                      <button className=" h-[60px] font-semibold  w-full hover:bg-[#4CBBA1]  bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md   cursor-pointer  px-7 py-3">
                        {" "}
                        <div className=" flex justify-center  leading-none  gap-3">
                          <span className=" text-emerald-50 text-xl">
                            {val.icon}
                          </span>{" "}
                          {val.title}
                        </div>{" "}
                      </button>
                    </NavLink>
                  </div>
                </>
              ))}
            </div>
          </div>

          <div className="orderButton flex flex-wrap  ">
            {ButtonsData2.map((val, index) => (
              <>
                <div className="w-1/5 ">
                  <button className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-not-allowed  py-3">
                    {" "}
                    <div className=" flex flex-col justify-center items-center   gap-1 ">
                      <span>{val.icon}</span> {val.title}
                    </div>{" "}
                  </button>
                </div>
              </>
            ))}
          </div>
        </section>
      </header>

      <div className=" flex gap-14 p-3">
        <section className="card mt-10">
          <div className="h-[347px] w-[256px] rounded-sm drop-shadow-sm">
            <div className="relative w-[256px] h-[80px] bg-[#4CBBA1] text-white">
              <div className="flex justify-between pt-3">
                <div className="flex gap-2 items-center leading-3 px-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="size-5"
                  >
                    <title>Dining Table</title>
                    <g id="Dining_Table" data-name="Dining Table">
                      <path d="M29.109,37.871,27,36.465V24H37a2,2,0,0,0,2-2V20a2,2,0,0,0-2-2H33.949A10.015,10.015,0,0,0,25,9.051V8h1a1,1,0,0,0,0-2H22a1,1,0,0,0,0,2h1V9.051A10.015,10.015,0,0,0,14.051,18H10a2,2,0,0,0-2,2v2a2,2,0,0,0,2,2H21V36.465l-2.109,1.406A2,2,0,0,0,18,39.535V40a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2v-.465A2,2,0,0,0,29.109,37.871ZM24,11a8.008,8.008,0,0,1,7.931,7H16.069A8.008,8.008,0,0,1,24,11ZM10,22V20H37v2ZM28,40H20v-.465l2.109-1.406A2,2,0,0,0,23,36.465V24h2V36.465a2,2,0,0,0,.891,1.664L28,39.535Z"></path>
                      <path d="M46.374,30.4l1.608-12.133A2,2,0,0,0,46.006,16H44.92a2,2,0,0,0-1.926,1.481l-2.587,9.662H34.243a2.986,2.986,0,0,0-2.892,2.248L31.064,30.5h0a2,2,0,0,0,1.9,2.5l-1.932,7.762a1,1,0,0,0,.73,1.212A.961.961,0,0,0,32,42a1,1,0,0,0,.97-.758L35.022,33H43.2l1.825,8.217A1,1,0,0,0,46,42a1.018,1.018,0,0,0,.218-.024,1,1,0,0,0,.76-1.193l-1.854-8.341A2.992,2.992,0,0,0,46.374,30.4ZM33,31l.286-1.109a.988.988,0,0,1,.956-.747h6.932a1,1,0,0,0,.966-.741L44.92,18H46L44.392,30.133a1,1,0,0,1-.981.867L33,31Z"></path>
                      <path d="M16.58,32.227a1.993,1.993,0,0,0,.357-1.727h0l-.286-1.106a2.988,2.988,0,0,0-2.893-2.25H7.593L5.006,17.481A2,2,0,0,0,3.08,16H1.994A2,2,0,0,0,.018,18.264L1.626,30.4a2.991,2.991,0,0,0,1.161,1.98L.919,40.783a1,1,0,0,0,1.953.434L4.7,33h8.175l2.052,8.242A1,1,0,0,0,15.9,42a.961.961,0,0,0,.242-.03,1,1,0,0,0,.729-1.212L14.935,33h.07A1.981,1.981,0,0,0,16.58,32.227ZM4.589,31a1,1,0,0,1-.981-.867L1.994,18h1.08L5.859,28.4a1,1,0,0,0,.966.741h6.932a.99.99,0,0,1,.957.748L15,31Z"></path>
                    </g>
                  </svg>
                  <span className=""> Table:1</span>
                </div>

                <div className="waiter pr-3">
                  <h1 className="">Anail Haque</h1>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="waiter">
                  <h1 className="pl-5 pt-3">Token:5</h1>
                </div>
                <div className="waiter">
                  <h1 className="pr-3 pt-3">Order:#140</h1>
                </div>
              </div>

              <div>
                <IoIosArrowDown
                  className={`  arrow absolute cursor-pointer text-[#4CBBA1] left-28 -bottom-2 border-[1px] bg-white rounded-full text-xl  ${
                    isExpanded && " rotate-180"
                  }  `}
                  onClick={toggleExpand}
                />
              </div>
            </div>
            {isExpanded && (
              <div className="h-[267px] w-[256px]  text-zinc-900">
                <div className="data h-[83px] w-[254px] border-[0.5px] border-[#4CBBA1]">
                  <div className="flex justify-between items-center px-2">
                    <div>
                      <h1 className="text-lg font-semibold">Paneer</h1>
                      <h2 className="text-base">Paneer</h2>
                      <h3 className="mt-1">2x</h3>
                    </div>

                    <div className="running_order text-sm">Kitchen Accept</div>
                  </div>
                </div>

                <div className="data h-[83px] w-[254px] border-[0.5px] border-[#4CBBA1]">
                  <div className="flex justify-between items-center px-2">
                    <div>
                      <h1 className="text-lg font-semibold">Paneer</h1>
                      <h2 className="text-base">Paneer</h2>
                      <h3 className="mt-1">2x</h3>
                    </div>

                    <div className="running_order text-sm">Kitchen Accept</div>
                  </div>
                </div>

                <div className="data h-[83px] w-[254px] border-[0.5px] border-[#4CBBA1]">
                  <div className="flex justify-between items-center px-2">
                    <div>
                      <h1 className="text-lg font-semibold">Paneer</h1>
                      <h2 className="text-base">Paneer</h2>
                      <h3 className="mt-1">2x</h3>
                    </div>

                    <div className="running_order text-sm">Kitchen Accept</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default KitchenStatus;
