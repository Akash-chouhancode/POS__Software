import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { AiOutlineSwap } from "react-icons/ai";
import DeleteDialogBox from "../../components/DeleteDialogBox";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import { FaEdit, FaRegEdit } from "react-icons/fa";

import useFullScreen from "../../components/useFullScreen";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import HasPermission from "../../store/HasPermission";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { writeCSV } from "papaparse";
import Papa from "papaparse";
import ExcelJS from "exceljs";

const headers = ["SL.", "Unavailable Date", "Available Time", "Action"];

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
const UnavilablityDays = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isOpen, setOpen] = useState(true);
  const [cModal, setCmodal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [data, setData] = useState([]);

  const [formData, setFormdata] = useState({
    offdaydate: "",
    start_time: "",
    end_time: "",
    is_active: 1,
  });

  const [formData2, setFormData2] = useState({
    offdaydate: "",
    start_time: "",
    end_time: "",
    is_active: "",
  });

  // pagination
  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(data.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };
  // add unavailablity
  const handelChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const submitAddcustomer = (e) => {
    e.preventDefault();
    axios
      .post(`${API_BASE_URL}/unavailability`, formData)
      .then((res) => {
        console.log(res.data);
        setCmodal(false);
        toast.success("Added sucessfully");
        getUnavailable();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // get data
  const getUnavailable = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unavailability`);
      console.log(response.data);
      setData(response.data.data);
    } catch (error) {
      toast.error("Can't get data");
      console.error(error);
    }
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
      .delete(`${API_BASE_URL}/unavailability/${id}`)
      .then((res) => {
        console.log("Data Deleted");
        toast.success("delete sucessfully..");
        getUnavailable();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // edit

  const handleEditClick = (id) => {
    setEditId(id);
    setIsModalOpen(true);
    // Fetch data for the given ID
    axios.get(`${API_BASE_URL}/unavailability/${id}`).then((response) => {
      setFormData2({
        offdaydate: response.data.data.offdaydate,
        start_time: response.data.data.start_time,
        end_time: response.data.data.end_time,
        is_active: response.data.data.is_active,
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
    axios
      .put(`${API_BASE_URL}/unavailability/${editId}`, formData2)
      .then(() => {
        toast.success(" Updated customer details sucessfully!");
        getUnavailable();
        setIsModalOpen(false); // Close the modal after submission
      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  };
// download


const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/unavailability`);
    return response.data.data; // Assuming the data you need is in `response.data.data`
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
  
    Available_Time: item.availtime,
    Unavailable_Date:new Date(item.offdaydate).toLocaleDateString(),
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
    { header: "Available Time", key: "available_time" },
    { header: "Unavailable Date", key: "unavailable_date" },
    
  ];


 

  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
      available_time: item.availtime,
      unavailable_date: new Date(item.offdaydate).toLocaleDateString(),
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
    item.availtime,
    new Date(item.offdaydate).toLocaleDateString(),
  ]);

  // Add a title
  doc.text("Data Export", 20, 10);

  // Add a table
  doc.autoTable({
    head: [
      [
        "Available Time",
        "Unavailable Date",
      ],
    ],
    body: rows,
  });

  doc.save("data.pdf"); // PDF file name
};




  useEffect(() => {
    getUnavailable();
  }, []);

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
                Unavailable Day
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />              </div>
            </div>

            <div className=" flex justify-between mt-11">
              <span></span>
              <HasPermission module="Unavailable today" action="create">
                {" "}
                <button
                  onClick={() => setCmodal(true)}
                  className=" bg-[#4CBBA1] h-[46px] w-[165px] text-wrap rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
                >
                  <IoIosAddCircleOutline className=" font-semibold text-lg" />
                  Add Unavailability
                </button>
              </HasPermission>
            </div>
            {/* Search Bar */}

            <div className=" mt-11  w-full">
              <section className=" tablebutton">
                <div className="orderButton   flex  flex-wrap gap-y-5 gap-x-5 px-6  ">
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

                  {/* <div className="flex m-auto px-4 rounded-md border-[1px]  mt-5 border-gray-900">
                    <input
                      value={searchName}
                      onChange={handleSearch}
                      placeholder="Search menu..."
                      type="search"
                      className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                    />
                    <button className="px-4 text-[#0f044a] text-sm">
                      <FaMagnifyingGlass />
                    </button>
                  </div> */}
                </div>
              </section>
            </div>

            <section className="tabledata">
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
                      {data.length > 0 ? (
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
                                {row.offdaydate
                                  ? new Date(
                                      row.offdaydate
                                    ).toLocaleDateString()
                                  : "No date available"}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.availtime
                                  ? row.availtime
                                  : "No date available"}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                <div className="flex justify-center gap-x-2 font-bold">
                                  <HasPermission
                                    module="Unavailable today"
                                    action="edit"
                                  >
                                    <Tooltip message="Edit">
                                      <button
                                        onClick={() =>
                                          handleEditClick(row.offdayid)
                                        }
                                        className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                                      >
                                        <FaRegEdit />
                                      </button>
                                    </Tooltip>
                                  </HasPermission>
                                  <HasPermission
                                    module="Unavailable today"
                                    action="delete"
                                  >
                                    <Tooltip message="Delete">
                                      <button
                                        onClick={() =>
                                          handleDeleteClick(row.offdayid)
                                        }
                                        className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                                      >
                                        <FaRegTrashCan />
                                      </button>
                                    </Tooltip>
                                  </HasPermission>
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="py-2 px-4 text-center">
                            No Data found related to this table.
                          </td>
                        </tr>
                      )}
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
                    {[...Array(Math.ceil(data.length / itemsPerPage))].map(
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
                        currentPage === Math.ceil(data.length / itemsPerPage)
                      }
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

      {/* edit */}

      {isModalOpen && (
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
                  <form
                    onSubmit={handleSubmit2}
                    className="bg-white rounded px-8 pt-6 pb-8 mb-4"
                  >
                    <div className="">
                      <div className=" mb-2  mt-5">
                        <label className="block mb-2  text-sm font-medium text-gray-700">
                          Unavailable Date
                        </label>
                        <input
                          type="date"
                          onChange={handleChange2}
                          value={formData2.offdaydate}
                          name="offdaydate"
                          placeholder=" Customer Name"
                          className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <div className=" mb-2  mt-5">
                        <label className="block mb-2  text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="time"
                          onChange={handleChange2}
                          value={formData2.start_time}
                          name="start_time"
                          placeholder=" Customer E-mail"
                          className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <div className=" mb-2  mt-5">
                        <label className="block mb-2  text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <input
                          type="time"
                          onChange={handleChange2}
                          value={formData2.end_time}
                          name="end_time"
                          placeholder=" Mobile Number"
                          className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <div className=" mb-2  mt-5">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="status"
                          name="is_active"
                          value={formData2.is_active}
                          onChange={handleChange2}
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
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
      )}

      <DialogBoxSmall
        isOpen={cModal}
        title={"Add Unavailability"}
        onClose={() => {
          setCmodal(false);
        }}
      >
        <div className="">
          <form
            onSubmit={submitAddcustomer}
            className="bg-white rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="">
              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Unavailable Date
                </label>
                <input
                  type="date"
                  onChange={handelChange}
                  value={formData.offdaydate}
                  name="offdaydate"
                  placeholder=" Customer Name"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  onChange={handelChange}
                  value={formData.start_time}
                  name="start_time"
                  placeholder=" Customer E-mail"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  onChange={handelChange}
                  value={formData.end_time}
                  name="end_time"
                  placeholder=" Mobile Number"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="status"
                  name="is_active"
                  value={formData.is_active}
                  onChange={handelChange}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
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
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </DialogBoxSmall>

      <DeleteDialogBox
        show={showModal}
        onClose={handleModalClose}
        onDelete={handleModalDelete}
      />
    </>
  );
};

export default UnavilablityDays;
