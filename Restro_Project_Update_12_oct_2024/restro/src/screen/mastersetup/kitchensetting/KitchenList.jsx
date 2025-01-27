import React, { useEffect, useState } from "react";
import Nav from "../../../components/Nav";
import Hamburger from "hamburger-react";
import CategoryDialogBox from "../../../components/CategoryDialogBox";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteDialogBox from "../../../components/DeleteDialogBox";
import HasPermission from "../../../store/HasPermission";

import useFullScreen from "../../../components/useFullScreen"
import Papa from "papaparse";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";


const KitchenList = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isOpen, setOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kitchenData, setKitchenData] = useState([]);
  const [formData, setFormData] = useState({
    kitchenname: "",
    printername: "",
  });
  const [deleteModalId, setDeleteModalId] = useState(null);
 const [showModal, setShowModal] = useState(false);
  const [printerData, setPrinterData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentKitchen, setCurrentKitchen] = useState(null);
  const [kitchenName, setKitchenName] = useState("");
  const [printerId, setPrinterId] = useState("");
  const [searchName, setSearchName] = useState("");
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
  };

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  const totalPages = Math.ceil(kitchenData.length / itemsPerPage);
  const selectPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.kitchenname) {
      toast.error("Kitchen name is required");
      return;
    }

    if (!formData.printername) {
      toast.error("Select Printer !");
      return;
    }



    axios
      .post(`${API_BASE_URL}/addkitchen`, formData)
      .then((res) => {
        console.log(res);
        toast.success("Kitchen Added Successfully")
      
        closeModal();
        getkitchenData();
        setFormData("")
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const fetchPrinterData = () => {
    axios
      .get(`${API_BASE_URL}/getprinter`)
      .then((res) => {
        console.log(res.data);
        setPrinterData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getkitchenData = () => {
    axios.get(`${API_BASE_URL}/getkitchen`).then((res) => {
      console.log(res.data);
      setKitchenData(res.data);
    });
  };



  
// search 
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchName(value);
  setCurrentPage(1);
  if (value.trim() === "") {
    getkitchenData();
    return;
  }

  axios
    .get(`${API_BASE_URL}/getkitchen`, {
      params: { searchItem: value },
    })
    .then((res) => {
      setKitchenData(res.data.length > 0 ? res.data : []);
    })
    .catch((error) => {

      console.error("Error fetching data:", error);
      toast.error("Error fetching filtered data");
    });
};





// delete 
const handleDeleteClick = (id) => {
  setDeleteModalId(id);
  setShowModal(true);
};

const handleModalClose = () => {
  setShowModal(false);
  setDeleteModalId(null);
};

const handleModalDelete = () => {
  DeleteUnit(deleteModalId);
  handleModalClose();
}




  const DeleteUnit = (kitchenid) => {
    axios
      .delete(`${API_BASE_URL}/deletekitchen/${kitchenid}`)
      .then((res) => {
        console.log(res.data);
        toast.success("Kitchen Deleted Successfully");
        
        getkitchenData();
      })
      .catch((err) => {
        console.error("Error deleting kitchen:", err);
        toast.error("Failed to delete kitchen. Please try again.")
       
      });
  };








  const handleEditClick = (kitchen) => {
    setCurrentKitchen(kitchen);
    setKitchenName(kitchen.kitchen_name);
    setPrinterId(kitchen.printer_name);
    setIsEditModalOpen(true);
  };

  const updateKitchen = async (kitchenId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/update/${kitchenId}`,
        {
          kitchen_name: kitchenName,
          printer_id: printerId,
        }
      );
      console.log(response.data);
      toast.success("Kitchen Updated Successfully");
      
      closeModal();
      getkitchenData();
    } catch (error) {
      console.error("Error updating kitchen:", error);
      toast.error("Failed to update kitchen. Please try again.")
     
    }
  };


  

const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getkitchen`);
    return response.data; // Assuming the data you need is in `response.data.data`
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling function if needed
  }
};

const handleDownload = async (type) => {
  const data = await fetchData();

  if (type === "csv") downloadCSV(data);
  else if (type === "excel") downloadExcel(data);
  else if (type === "pdf") downloadPDF(data);
};
// download for CSV file..
const downloadCSV = async () => {
  const data = await fetchData(); // Fetch data
  const csvData = data.map((item) => ({
    // Map your data structure as needed
      
  Kitchen_Name:item.kitchen_name,
   Printer:item.printer_name,
 
   
  }));

  const csvString = Papa.unparse(csvData);
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "data.csv"; // CSV file name
  a.click();
  window.URL.revokeObjectURL(url);
};


// download for EXCEL
const downloadExcel = async () => {
  const data = await fetchData(); // Fetch your data

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  // Define the columns and map headers
  worksheet.columns = [
    { header: "Kitchen_Name", key: "kitchen_name" },
    { header: "Printer", key: "printer" },
   
   
  ];
 
  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
      kichen_name: item.kitchen_name,
      printer:item.printer_name,
    
    });
  });

  // Create and download the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.xlsx";
  a.click();
  window.URL.revokeObjectURL(url);
};



// download for PDF

const downloadPDF = async () => {
  const data = await fetchData(); // Fetch data
  const doc = new jsPDF();

  // Map the data to rows for the PDF
  const rows = data.map((item) => [
    item.kitchen_name,
    item.printer_name,
   
  ]);

  // Add a title
  doc.text("Data Export", 20, 10);

  // Add a table
  doc.autoTable({
    head: [
      [
        "Kitchen Name",
        "Printer Name",
        
        
      ],
    ],
    body: rows,
  });

  doc.save("data.pdf"); // PDF file name
};


  useEffect(() => {
    fetchPrinterData();
    getkitchenData();
  }, []);



  const headers = ["SL.", "Kitchen Name", "Printer", "Action"];
  const Tooltip = ({ message, children }) => (
    <div className="group relative flex">
      {children}
      <span className="absolute bottom-7 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
        {message}
      </span>
    </div>
  );

  return (
    <>
      <div className="main_div">
        <section className="side_section flex">
          <div className={`${isOpen ? "" : "hidden"}`}>
            <Nav />
          </div>
          <header className="">
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </header>
          <div className="content_div w-full ml-4 pr-7 mt-4">
            <div className="active_tab flex justify-between">
              <h1 className="flex items-center justify-center gap-1 font-semibold">
                Kitchen List
              </h1>
              <div className="notification flex gap-x-5">
                <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>
            <div className="flex justify-between mt-11">
              <span></span>
              <HasPermission module="Kitchen List" action="create">
              <button
                onClick={openModal}
                className="bg-[#4CBBA1] h-[46px] text-nowrap w-[150px] rounded-sm flex justify-center items-center gap-x-1 text-white font-semibold"
              >
                <IoIosAddCircleOutline className="font-semibold text-lg" />
                Add Kitchen
              </button>
              </HasPermission>
             
            </div>
           
            {/* Search Bar */}
            <div className="mt-11 w-full">
            <section className="table_button">
              <div className="order_button flex justify-evenly flex-wrap gap-x-5 gap-y-5">
                <div className="flex items-center space-x-2">
                  <label className="text-gray-900 pr-1">Display</label>
                  <div className="relative flex  items-baseline border-[1px] border-[#4CBBA1] p-1 rounded">
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
                  <h1 className="">Records per page</h1>
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
 

                <div className="flex m-auto px-4  rounded-md border-[1px]   border-gray-900">
                  <button className="px-4 text-[#0f044a] text-sm">
                    <FaMagnifyingGlass />
                  </button>
                  <input
                      value={searchName}
                      onChange={handleSearch}
                      placeholder="Search ..."
                      type="search"
                      className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                    />
                </div>
              </div>
            </section>
          </div>
            <section className="table_data">
              <div className="w-full mt-10 drop-shadow-md">
                <div>
                  <table className="min-w-full bg-white text-center">
                    <thead>
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                    {kitchenData.length > 0 ? (
    kitchenData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ).map((row, index) => (
                        <tr key={index}>
                          <td className="py-2 px-4 border border-[#4CBBA1]">
                            {index + 1}
                          </td>
                          <td className="py-2 px-4 border border-[#4CBBA1]">
                            {row.kitchen_name}
                          </td>
                          <td className="py-2 px-4 border border-[#4CBBA1]">
                            {row.printer_name}
                          </td>
                          <td className="py-2 px-4 border border-[#4CBBA1]">
                            <div className="flex justify-center gap-x-2 font-bold">
                              {/* Wokring on edit */}
                              <Tooltip message="Edit">
                                {/* <button
                                  onClick={() => handleEditClick(row)}
                                  className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                                >
                                  <FaRegEdit />
                                </button> */}
                                {isEditModalOpen &&
                                  currentKitchen?.kitchenid ===
                                    row.kitchenid && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                      <div className="bg-white p-4 rounded shadow-lg w-96">
                                        <h2 className="text-xl mb-4">
                                          Update Kitchen
                                        </h2>
                                        <form
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            updateKitchen(
                                              currentKitchen.kitchenid
                                            );
                                          }}
                                        >
                                          <div className="mb-4">
                                            <label className="block mb-1">
                                              Kitchen Name:
                                            </label>
                                            <input
                                              type="text"
                                              value={kitchenName}
                                              onChange={(e) =>
                                                setKitchenName(e.target.value)
                                              }
                                              className="w-full p-2 border border-gray-300 rounded"
                                            />
                                          </div>
                                          <div className="mb-4">
                                            <label className="block mb-1">
                                              Printer Name:
                                            </label>
                                            <input
                                              type="text"
                                              value={printerId}
                                              onChange={(e) =>
                                                setPrinterId(e.target.value)
                                              }
                                              className="w-full p-2 border border-gray-300 rounded"
                                            />
                                          </div>
                                          <div className="flex justify-end">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setIsEditModalOpen(false)
                                              }
                                              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="submit"
                                              className="bg-blue-500 text-white px-4 py-2 rounded"
                                            >
                                              Update
                                            </button>
                                          </div>
                                        </form>
                                      </div>
                                    </div>
                                  )}
                              </Tooltip>
                              <HasPermission module="Kitchen List" action="delete">
                              <Tooltip message="Delete">
                                <button
                                  onClick={() => handleDeleteClick(row.kitchenid)}
                                  className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                                >
                                  <FaRegTrashCan />
                                </button>
                              </Tooltip>
                              </HasPermission>
                            </div>
                          </td>
                        </tr>
                      )) ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            No data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between mt-7">
              {kitchenData.length > 0 && (
                <div className="mt-10">
                  <div className="float-right flex items-center space-x-2">
                    <button
                      onClick={() => selectPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[
                      ...Array(Math.ceil(kitchenData.length / itemsPerPage)),
                    ].map((_, index) => {
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
                    })}
                    <button
                      onClick={() => selectPage(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(kitchenData.length / itemsPerPage)
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
      
      <DeleteDialogBox
        show={showModal}
        onClose={handleModalClose}
        onDelete={handleModalDelete}
      />
       <CategoryDialogBox
              isOpen={isModalOpen}
              onClose={closeModal}
              title={"Add Kitchen"}
            >
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded px-8 pt-6 pb-8 mb-4"
              >
                <div className="category h-40">
                  <div className="mb-4 flex items-center">
                    <label
                      className="block text-nowrap w-[200px] text-gray-700 font-semibold mb-2"
                      htmlFor="kitchenName"
                    >
                      Kitchen Name*
                    </label>
                    <input
                      className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="kitchenName"
                      type="text"
                      name="kitchenname"
                      placeholder="Enter Kitchen Name"
                      value={formData.kitchenname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <label
                      className="block text-nowrap w-[200px] text-gray-700 font-semibold mb-2"
                      htmlFor="printer"
                    >
                      Printer*
                    </label>
                    <select
                      className="shadow border w-full border-[#4CBBA1] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="printer"
                      name="printername"
                      value={formData.printername}
                      onChange={handleChange}
                    >
                      <option value="">Select option</option>
                      {printerData.map((val, index) => (
                        <option key={index} value={val.id}>
                          {val.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex mt-4 float-right gap-x-3">
                    <button
                      className="bg-[#4CBBA1] text-white w-[104px] h-[42px] rounded focus:outline-none focus:shadow-outline"
                      type="reset"
                    >
                      Reset
                    </button>
                    <button
                      className="bg-[#1C1D3E] text-white w-[104px] h-[42px] rounded focus:outline-none focus:shadow-outline"
                      type="submit"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </form>
            </CategoryDialogBox>
    </>
  );
};

export default KitchenList;
