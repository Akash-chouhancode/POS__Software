import React, { useEffect, useState,useContext } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import DeleteDialogBox from "../../components/DeleteDialogBox";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import { toast } from "react-toastify";
import HasPermission from "../../store/HasPermission";
import { AuthContext } from "../../store/AuthContext";
import useFullScreen from "../../components/useFullScreen";
import Papa from "papaparse";
import ExcelJS from "exceljs";

import jsPDF from "jspdf";
import "jspdf-autotable";


const PrinterList = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isPrinterModal, setIsPrinterModal] = useState(false);
  const [isOpen, setOpen] = useState(true);
  const [data, setData] = useState([]);
  const initialFormData = {
    printername: "",
    connectiontype: "",
    capabilityprofile: "",
    characterperline: "",
    IPaddress: "",
    port: "",
  };
  const { token } = useContext(AuthContext);
  const [searchName, setSearchName] = useState("");
  const [formdata, setFormdata] = useState(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formdata.printername) {
      toast.error("Printer name is required");
      return;
    }
    if (!formdata.connectiontype) {
      toast.error("Connection type is required");
      return;
    }
    if (!formdata.capabilityprofile) {
      toast.error("Capability profile is required");
      return;
    }
    if (!formdata.characterperline) {
      toast.error("Character per line is required");
      return;
    }
    if (!formdata.IPaddress) {
      toast.error("IP address is required");
      return;
    }
    if (!formdata.port) {
      toast.error("Port is required");
      return;
    }
    const data = {
      printername: formdata.printername,
      connectiontype: formdata.connectiontype,
      capabilityprofile: formdata.capabilityprofile,
      characterperline: formdata.characterperline,
      IPaddress: formdata.IPaddress,
      port: formdata.port,
    };

    axios
      .post(`${API_BASE_URL}/addprinter`, data,{headers:{"Authorization":token}})
      .then((res) => {
        console.log("Printer added successfully");
        toast.success("Printer added successfully");
        setFormdata(initialFormData);
        setIsPrinterModal(false);
        getdata()
      })
      .catch((error) => {
        console.log(error);
      });
  };
  
  const headers = [
    "SL.",
    "Printer Name",
    "Connection Name",
    "Capability Profile",
    "Character Per Line",
    "IP Address",
    "Port",
    "Action",
  ];

  const getdata = () => {
    axios
      .get(`${API_BASE_URL}/getprinter`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          console.error("API response is not an array:", res.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };


// search 
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchName(value);
  setCurrentPage(1);
  if (value.trim() === "") {
    getdata();
    return;
  }

  axios
    .get(`${API_BASE_URL}/getprinter`, {
      params: { searchItem: value },
    })
    .then((res) => {
      setData(res.data.length > 0 ? res.data : []);
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
};
const DeleteUnit = (id) => {
  axios
    .delete(`${API_BASE_URL}/printer/${id}`)
    .then((res) => {
      console.log("Data Deleted");
      toast.success("delete printer sucessfully..")
      getdata();
    })
    .catch((err) => {
      console.log(err);
    });
};


 // edit 

  const [formData2, setFormData2] = useState({
  printername: "",
  connectiontype: "",
  capabilityprofile: "",
  characterperline: "",
  IPaddress: "",
  port: "",
});

const [isModalOpen, setIsModalOpen] = useState(false);
const [editId, setEditId] = useState(null);
const handleEditClick = (id) => {
  setEditId(id);
  setIsModalOpen(true);
  // Fetch data for the given ID
  axios.get(`${API_BASE_URL}/printer/${id}`).then((response) => {
    setFormData2({
      printername: response.data.data.name,
      connectiontype: response.data.data.connection_type,
      capabilityprofile: response.data.data.capability_profile,
      characterperline: response.data.data.char_per_line,
      IPaddress: response.data.data.ip_address,
      port: response.data.data.port, 

    });
  });
};
const handleChange2 = (e) => {
  setFormData2({
    ...formData2,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit2 = (e) => {
e.preventDefault();
axios.put(`${API_BASE_URL}/printer/${editId}`, formData2)
  .then(() => {
    toast.success("Updated Sucessfully!")
    getdata();
    setIsModalOpen(false); // Close the modal after submission
  })
  .catch((error) => {
    console.error("Error updating data:", error);
  });
}


const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getprinter`);
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
      
    Printer_Name:item.name,
    Connection_Name: item.connection_type,
    Capability_Profile: item.capability_profile,
    Character_Per_Line:item.char_per_line,
    IP_Address:item.ip_address,
    Port:item.port,

 
   
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
    { header: "Printer Name", key: "printer_name" },
    { header: "Connection Name", key: "connection_name" },
    { header: "Capability Profile", key: "capability_profile" },
    { header: "IP_Address", key: "ip_address" },
    { header: "Port", key: "port" },
   
  ];

  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
      
  printer_name:item.name,
  connection_name: item.connection_type,
  capability_profile: item.capability_profile,
  character_per_line:item.char_per_line,
  iP_address:item.ip_address,
  port:item.port,
    
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
  console.log("data",data)
  const doc = new jsPDF();

  // Map the data to rows for the PDF
  const rows = data.map((item) => [
      
  item.name,
  item.connection_type,
 item.capability_profile,
 item.char_per_line,
 item.ip_address,
 item.port,
   
  ]);

  // Add a title
  doc.text("Data Export", 20, 10);

  // Add a table
  doc.autoTable({
    head: [
      [
       
 "Printer Name",
 "Connection Name",
 "Capability Profile",
 "Character Per Line",
 "IP Address",
 "Port",
        
      ],
    ],
    body: rows,
  });

  doc.save("data.pdf"); // PDF file name
};















  useEffect(() => {
    getdata();
  }, []);
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
  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(data.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };
  return (
<>
<div className="main_div">
      <section className="side_section flex">
        <div className={isOpen === false ? "hidden" : ""}>
          <Nav />
        </div>
        <header>
          <Hamburger toggled={isOpen} toggle={setOpen} />
        </header>
        <div className="content_div w-full ml-4 pr-7 mt-4">
          <div className="active_tab flex justify-between">
            <h1 className="flex items-center justify-center gap-1 font-semibold">
              Printer List
            </h1>

            <div className="notification flex gap-x-5">
              <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
            <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
            </div>
          </div>

          <div className=" flex justify-between">
            <span></span>

            <HasPermission module="Printers" action="create">
            <button
              onClick={() => {
                setIsPrinterModal(true);
              }}
              className=" bg-[#4CBBA1] h-[46px] w-[165px]  mt-10 rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
            >
              <IoIosAddCircleOutline className=" font-semibold text-lg" />
              Add Printer
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
                    {data.length > 0 &&
                      data
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage
                        )

                        .map((row, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {index + 1}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.name}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.connection_type}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.capability_profile}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.char_per_line}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.ip_address}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.port}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              <div className="flex justify-center gap-x-2 font-bold">

                                <HasPermission module="Printers" action="edit">
                                <Tooltip message="Edit">
                                  <button
                                  
                                  onClick={() => handleEditClick(row.id)}
                                  className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105">
                                    <FaRegEdit />
                                  </button>
                                </Tooltip>
                                </HasPermission>
                                <HasPermission module="Printers" action="delete">
                                <Tooltip message="Delete Printer">
                                  <button
                                    onClick={() => handleDeleteClick(row.id)}
                                  
                                  className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105">
                                    <FaRegTrashCan />
                                  </button>
                                </Tooltip>
                                </HasPermission>
                               
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <div className="flex justify-between mt-7">
            {data.length > 0 && (
              <div className="mt-10">
                <div className="float-right flex items-center space-x-2">
                  <button
                    onClick={() => selectPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(Math.ceil(data.length / itemsPerPage))].map((_, index) => {
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
                    disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
                    className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
   
    <DialogBoxSmall
              title={"Add New Printer"}
              isOpen={isPrinterModal}
              onClose={() => {
                setIsPrinterModal(false);
              }}
            >
              <form onSubmit={handleSubmit}>
                <div className="pt-11 pb-16 pr-24">
                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
                      htmlFor="printername"
                    >
                      Printer Name*
                    </label>

                    <input
                      value={formdata.printername}
                      onChange={handleChange}
                      name="printername"
                      placeholder="Printer Name"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="printername"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2"
                      htmlFor="connectiontype"
                    >
                      Connection Type*
                    </label>

                    <select
                      value={formdata.connectiontype}
                      onChange={handleChange}
                      name="connectiontype"
                      id="connectiontype"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select Connection Type</option>
                      <option value="network">Network</option>
                      <option value="windows">Window</option>
                      <option value="linux">Linux</option>
                    </select>
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2"
                      htmlFor="capabilityprofile"
                    >
                      Capability Profile*
                    </label>
                    <select
                      value={formdata.capabilityprofile}
                      onChange={handleChange}
                      name="capabilityprofile"
                      id="capabilityprofile"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select Capability Profile</option>
                      <option value="Default">Default</option>
                      <option value="simple">Simple</option>
                    </select>
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap text-gray-700 w-[300px] text-right font-semibold mb-2"
                      htmlFor="characterperline"
                    >
                      Characters per line*
                    </label>
                    <input
                      value={formdata.characterperline}
                      onChange={handleChange}
                      name="characterperline"
                      type="number"
                      placeholder="0"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="characterperline"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap text-gray-700 w-[300px] text-right font-semibold mb-2"
                      htmlFor="IPaddress"
                    >
                      IP Address*
                    </label>
                    <input
                      value={formdata.IPaddress}
                      onChange={handleChange}
                      name="IPaddress"
                      placeholder="IP Address"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="IPaddress"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap text-gray-700 w-[300px] text-right font-semibold mb-2"
                      htmlFor="port"
                    >
                      Port*
                    </label>
                    <input
                      value={formdata.port}
                      onChange={handleChange}
                      name="port"
                      type="number"
                      placeholder="0"
                      defaultValue={5000}
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="port"
                    />
                  </div>

                  <div className="float-right flex ml-16 space-x-4">
                    <button
                      type="reset"
                      className="w-[104px] h-[42px] bg-[#4CBBA1] text-gray-50 rounded-md"
                      onClick={() => setFormdata(initialFormData)}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="w-[104px] h-[42px] bg-[#1C1D3E] text-white rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
    </DialogBoxSmall>



    
    {isModalOpen &&(
 <>
 <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none  ">
       <div className=" w-1/2 px-20">
         <div className="py-4  bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
           <div className="flex  py-5 px-4 justify-between items-center border-b-[1px] border-black">
             <h2 className="text-xl  font-semibold">Edit Unit Data</h2>
             <button
               onClick={() => setIsModalOpen(false)}
               className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold"
             >
               X
             </button>
           </div>
           <div className=" p-4">
           <form onSubmit={handleSubmit2}>
                <div className="pt-11 pb-16 pr-24">
                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
                      htmlFor="printername"
                    >
                      Printer Name
                    </label>

                    <input
                      value={formData2.printername}
                      onChange={handleChange2}
                      name="printername"
                      placeholder="Printer Name"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="printername"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2"
                      htmlFor="connectiontype"
                    >
                      Connection Type
                    </label>

                    <select
                      value={formData2.connectiontype}
                      onChange={handleChange2}
                      name="connectiontype"
                      id="connectiontype"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select Connection Type</option>
                      <option value="network">Network</option>
                      <option value="windows">Window</option>
                      <option value="linux">Linux</option>
                    </select>
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2"
                      htmlFor="capabilityprofile"
                    >
                      Capability Profile
                    </label>
                    <select
                      value={formData2.capabilityprofile}
                      onChange={handleChange2}
                      name="capabilityprofile"
                      id="capabilityprofile"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="">Select Capability Profile</option>
                      <option value="Default">Default</option>
                      <option value="simple">Simple</option>
                    </select>
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap text-gray-700 w-[300px] text-right font-semibold mb-2"
                      htmlFor="characterperline"
                    >
                      Characters per line
                    </label>
                    <input
                      value={formData2.characterperline}
                      onChange={handleChange2}
                      name="characterperline"
                      type="number"
                      placeholder="0"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="characterperline"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap text-gray-700 w-[300px] text-right font-semibold mb-2"
                      htmlFor="IPaddress"
                    >
                      IP Address
                    </label>
                    <input
                      value={formData2.IPaddress}
                      onChange={handleChange2}
                      name="IPaddress"
                      placeholder="IP Address"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="IPaddress"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto text-nowrap text-gray-700 w-[300px] text-right font-semibold mb-2"
                      htmlFor="port"
                    >
                      Port
                    </label>
                    <input
                      value={formData2.port}
                      onChange={handleChange2}
                      name="port"
                      type="number"
                      placeholder="0"
                      defaultValue={5000}
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="port"
                    />
                  </div>

                  <div className="float-right flex ml-16 space-x-4">
                    
                    <button
                      type="submit"
                      className="w-[104px] h-[42px] bg-[#1C1D3E] text-white rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
           
           </div>
         </div>
       </div>
     </div>
     <div className=" opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
 </>
)

}
  

            
      <DeleteDialogBox
        show={showModal}
        onClose={handleModalClose}
        onDelete={handleModalDelete}
      />
</>

   
  );
};

export default PrinterList;
