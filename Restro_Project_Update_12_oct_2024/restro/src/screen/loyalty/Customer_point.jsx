import React, { useEffect, useState } from 'react'
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import axios from 'axios';
import { toast } from 'react-toastify';
import Papa from "papaparse";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFullScreen from "../../components/useFullScreen";

  const headers = [
    "SL.",
    "Customer Name",
    "Spend Amount",
    "Total Point"
   
  ];

const Customer_point = () => {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [isOpen, setOpen] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [waiterData, setWaterData] = useState([]);
    const { isFullScreen, toggleFullScreen } = useFullScreen();
  
    const selectPage = (page) => {
        if (page > 0 && page <= Math.ceil(waiterData.length / itemsPerPage)) {
          setCurrentPage(page);
        }
      };
      const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when items per page changes
      };


      const getCustomerPointdata = () => {
  
        axios
          .get(`${API_BASE_URL}/customerpoints`)
          .then((response) => {
            console.log("datta",response)
            setWaterData(response.data.data);
          })
          .catch((error) => {
            console.error(error);
          });
      };


      useEffect(()=>{
        getCustomerPointdata();
          },[])
  return (
    <div className="main_div ">
      <section className="side_section flex">
        <div className={`${isOpen == false ? "hidden" : ""}`}>
          <Nav />
        </div>
        <header className="">
          <Hamburger toggled={isOpen} toggle={setOpen} />
        </header>
        <div className="contant_div w-full ml-4 pr-7 mt-4">
          <div className="activtab flex justify-between">
            <h1 className="flex items-center justify-center gap-1 font-semibold">
            Customer Point list
            </h1>

            <div className="notification flex gap-x-5 ">
              <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
            <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
            </div>
          </div>
          <div className="mt-11 w-full">
              <section className="tablebutton">
                <div className="orderButton flex  flex-wrap gap-y-5 gap-x-5 px-6">
                <div className="flex items-center space-x-2">
                    <label className="text-gray-900 pr-1">Display</label>
                    <div className="relative flex items-baseline border-[1px] border-[#4CBBA1] p-1 rounded">
                      <h1>05 X</h1>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="appearance-none w-16 pl-3 pr-8 py-1 rounded-md text-gray-700 focus:outline-none"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <h1>Records per page</h1>
                  </div>
                  <div className="w-full sm:w-auto flex gap-x-4 downloadbutton">
                    <button
                      onClick={() => handleDownload("csv")}
                      className="hover:bg-[#1C1D3E] text-[#000] hover:scale-110 duration-300 hover:text-white border-[2px] border-zinc-300 rounded-md py-2 px-11 w-full sm:w-auto"
                    >
                      {" "}
                      CSV
                    </button>
                    <button
                      onClick={() => handleDownload("excel")}
                      className="hover:bg-[#1C1D3E] text-[#000] hover:scale-110 duration-300 hover:text-white border-[2px] border-zinc-300 rounded-md py-2 px-11 w-full sm:w-auto"
                    >
                      {" "}
                      Excel
                    </button>
                    <button
                      onClick={() => handleDownload("pdf")}
                      className="hover:bg-[#1C1D3E] text-[#000] hover:scale-110 duration-300 hover:text-white border-[2px] border-zinc-300 rounded-md py-2 px-11 w-full sm:w-auto"
                    >
                      {" "}
                      PDF
                    </button>
                  </div>
                </div>
              </section>
            </div>
      

        
            {/* <div className="w-auto mt-11 p-3 rounded-md border-[1px] border-[#4CBBA1]">
              <div className="flex  justify-evenly items-center">
                <div className="search">
                  <form className="flex items-center gap-x-5">
                    <label htmlFor="from" className="font-semibold">
                      From
                    </label>
                    <input
                      type="date"
                      id="from"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="From"
                      className="border rounded border-[#4CBBA1] p-2"
                    />

                    <label htmlFor="to" className="font-semibold">
                      To
                    </label>
                    <input
                      type="date"
                      id="to"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="To"
                      className="border rounded border-[#4CBBA1] p-2"
                    />
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="w-[85px] h-[32px] bg-[#4CBBA1] text-white rounded-sm"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-[85px] h-[32px] bg-[#1C1D3E] text-white rounded-sm"
                    >
                      Reset
                    </button>
                  </form>
                </div>
              </div>
            </div> */}

{/* Table section */}

<section className=" tabledata pr-4 pl-4 ">
              <div className=" w-full mt-10 border-[1px] border-[#4CBBA1] drop-shadow-[#4CBBA1]">
                <div className="">
                  <table className="min-w-full bg-white ">
                    <thead className="">
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="py-4 px-4 bg-[#4CBBA1] text-gray-50 tex uppercase text-sm"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {waiterData.length > 0 ? (
                        waiterData
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )

                          .map((row, index) => (
                            <tr key={index} className="border-b text-center ">
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {index + 1}
                              </td>
                              
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.customer_name? row.customer_name:"No Name found"}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.total_bill_amount? row.total_bill_amount:"No Amount found"}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.earning_points? row.earning_points:"No Point"}
                              </td>
                             
                             
                             
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="py-2 px-4 text-center">
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                 
                </div>
              </div>

              {/* pagination */}
             <div className="flex justify-between mt-7">
                {waiterData.length > 0 && (
                  <div className="mt-10">
                    <div className="float-right flex items-center space-x-2">
                      <button
                        onClick={() => selectPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(Math.ceil(waiterData.length / itemsPerPage))].map(
                        (_, index) => {
                          return (
                            <button
                              onClick={() => selectPage(index + 1)}
                              key={index}
                              className={`h-[46px] w-[50px] cursor-pointer border-[1px] border-[#1C1D3E] ${
                                currentPage === index + 1
                                  ? "bg-[#1C1D3E] text-white"
                                  : ""
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() => selectPage(currentPage + 1)}
                        disabled={
                          currentPage === Math.ceil(waiterData.length / itemsPerPage)
                        }
                        className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div> 
            </section>
        </div>
      </section>
    </div>
  )
}

export default Customer_point
