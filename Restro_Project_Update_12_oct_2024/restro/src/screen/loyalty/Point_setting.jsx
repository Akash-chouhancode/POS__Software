import React, { useContext, useEffect, useState } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { toast } from "react-toastify";
import { IoMdNotifications } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import defaultimage from "../../assets/images/tea.jpg";
import CategoryDialogBox from "../../components/CategoryDialogBox";
import EditDialogBox from "../../components/EditDialogBox";
import HasPermission from "../../store/HasPermission";
import { AuthContext } from "../../store/AuthContext";
import Papa from "papaparse";
import ExcelJS from "exceljs";

import jsPDF from "jspdf";
import "jspdf-autotable";
import useFullScreen from "../../components/useFullScreen";
const headers = [
  "SL.",
  "Amount",
  "Earn Point ",
  "Status",
  "Action",
];
const DeleteModal = ({ show, onClose, onDelete }) => {
  if (!show) {
    return null;
  }
  return (
    <div
      className="fixed inset-0   bg-opacity-10 flex items-center
      justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6  w-1/3  border-[2px] border-[#4CBBA1] ">
        <div className="text-center">
          {/* <AiOutlineStop className="text-[#FB3F3F] text-6xl mx-auto mb-4" /> */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Delete 
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this ?
          </p>
          <div className=" flex gap-x-3 justify-center items-center">
            <button
              onClick={onDelete}
              className="bg-[#FB3F3F] text-white px-6 py-2 rounded-md text-lg"
            >
              OK
            </button>
            <button
              onClick={onClose}
              className="bg-gray-400  text-white px-6 py-2 rounded-md text-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
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

const Point_setting = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
    const { token } = useContext(AuthContext);
    const [isOpen, setOpen] = useState(true);
    const [data, setData] = useState([]);
    const [dataa, setDataa] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategoryID, setSelectedCategoryID] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchName, setSearchName] = useState("");
    const defaultImage = defaultimage;
    const { isFullScreen, toggleFullScreen } = useFullScreen();
    const [formdata, setFormdata] = useState({
      amount: "",
      earn_point: "",
      status: 1,

     });

     
 
  


     // edit 

     const [formdata1, setFormdata1] = useState({
      amount: "",
      earn_point: "",
      status: "",
    });
    
    const [editId, setEditId] = useState(null)
    const handleEditClick = (id) => {
      setEditId(id);
      setEditModal(true);
      
      // Fetch data for the given ID
      axios.get(`${API_BASE_URL}/loyaltypoint/${id}`)
    
        .then((response) => {
          console.log(response.data);
          
          // Set the form data with the response data
          setFormdata1({
            amount: response.data.data.amount,
            earn_point: response.data.data.earn_point,
            status: response.data.data.status,
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormdata1((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
  const handleSubmit2 = (e) => {
  e.preventDefault();
  axios.put(`${API_BASE_URL}/loyaltypoint/${editId}`, formdata1)
    .then(() => {
      toast.success("Updated Sucessfully!")
      fetchData();
      setEditModal(false); // Close the modal after submission
    })
    .catch((error) => {
      console.error("Error updating data:", error);
    });
  }
  


     const selectepage = (page) => {
      if (page > 0 && page <= Math.ceil(dataa.length / 5)) {
        setCurrentPage(page);
      }
    };

    const handalchange = (e) => {
      setFormdata({ ...formdata, [e.target.name]: e.target.value });
    };


    const handleSubmit = (e) => {
      e.preventDefault();
  
      if (!formdata.amount) {
        toast.error("Amount is required");
        return;
      }
      if (!formdata.earn_point) {
        toast.error("Earn Point is required");
        return;
      }
      const data={
        status:formdata.status,
        amount:formdata.amount,
        earn_point:formdata.earn_point
      }
  
      axios
        .post(`${API_BASE_URL}/loyaltypoint`, data)
        .then((res) => {
        // Reset the form data to initial state 
          setIsModalOpen(false);
          setFormdata({ ...formdata, amount: "", earn_point: "", status: 1})
          toast.success("Point added successfully.");
          fetchData()
        })
        .catch((err) => {
          console.log(err);
          console.log(data)
        });
    };

  // search

// show all data
    const fetchData = () => {
      axios
        .get(`${API_BASE_URL}/loyaltypoints`)
        .then((res) => {
          setDataa(res.data.data);
          console.log(res.data);
        })
        .catch((error) => console.error(error));
    };

// delete
const handleDeleteClick = (CategoryID) => {
  setSelectedCategoryID(CategoryID);
  setShowModal(true);
};
const handleModalClose = () => {
  setShowModal(false);
  setSelectedCategoryID(null);
};

const handleModalDelete = () => {
  deleteCategory(selectedCategoryID);
  handleModalClose();
};

  // delete point
  const deleteCategory = (CategoryID) => {
    axios
      .delete(`${API_BASE_URL}/loyaltypoint/${CategoryID}`)
      .then((res) => {
        console.log(res.data);
        fetchData();
        toast.success("Point Delete Sucessfully.");
      })
      .catch((err) => {
        console.error("Error deleting category:", err);
      });
  };


  const fetchDataa = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loyaltypoints`);
      return response.data.data; // Assuming the data you need is in `response.data.data`
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error; // Rethrow the error to handle it in the calling function if needed
    }
  };

  const handleDownload = async (type) => {
    const data = await fetchDataa();

    if (type === "csv") downloadCSV(data);
    else if (type === "excel") downloadExcel(data);
    else if (type === "pdf") downloadPDF(data);
  };
  // download for CSV file..
  const downloadCSV = async () => {
    const data = await fetchDataa(); // Fetch data
    const csvData = data.map((item) => ({
      // Map your data structure as needed

      Amount: item.amount ? `${item.amount}` : "No Data Found",
      Earn_Point: item.earn_point ? `${item.earn_point}` : "No Data Found",
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
    const data = await fetchDataa(); // Fetch your data

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Define the columns and map headers
    worksheet.columns = [
      { header: "Amount", key: "amount" },
      { header: "Earn Point", key: "earn_point" },
      
    ];

    // Add rows
    data.forEach((item) => {
      worksheet.addRow({
        amount: item.amount ? `${item.amount}` : "No Data Found",
        earn_point: item.earn_point ? `${item.earn_point}` : "No Data Found",
       
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
    const data = await fetchDataa(); // Fetch data
    const doc = new jsPDF();

    // Map the data to rows for the PDF
    const rows = data.map((item) => [
      item.amount ? `${item.amount}` : "No Data Found",
      item.earn_point ? `${item.earn_point}` : "No Data Found",
  
    ]);

    // Add a title
    doc.text("Data Export", 20, 10);

    // Add a table
    doc.autoTable({
      head: [
        [
          "Amount",
          "Earn Point",
        ],
      ],
      body: rows,
    });

    doc.save("data.pdf"); // PDF file name
  };





 useState(()=>{
  fetchData();
 },[])  


  return (
    <>
       <div className="main_div">
        <section className=" side_section flex">
          <div className={isOpen ? "" : "hidden"}>
            <Nav />
          </div>
          <header className="">
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </header>
          <div className=" contant_div w-full  ml-4 pr-7 mt-4 ">
            <div className="activtab flex justify-between">
              <h1 className=" flex items-center justify-center gap-1 font-semibold">
              Loyalty Point Range
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />              
              </div>
            </div>
            {/* <div className=" flex justify-between">
              <span></span>
              <HasPermission module="Category List" action="create">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className=" bg-[#4CBBA1] h-[46px] w-[165px]  mt-10 rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
                >
                  <IoIosAddCircleOutline className=" font-semibold text-lg" />
                  Create Point
       
                </button>
              </HasPermission>
            </div> */}

            {/* Search Bar */}
            <div className=" mt-5  w-full">
              <section className=" tablebutton">
                <div className="orderButton  flex  flex-wrap gap-x-5 gap-y-5 ">
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
                  <span></span>
                  {/* <div className="flex m-auto   px-4   rounded-md border-[1px] border-gray-900">
                    <button className="px-4 text-[#0f044a] text-sm">
                      <FaMagnifyingGlass />
                    </button>
                    <input
                      value={searchName}
                      onChange={handleSearch}
                      placeholder="Search..."
                      type="search"
                      className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                    />
                  </div> */}
                </div>
              </section>
            </div>

            <section className="tabledata">
              <div className="w-full mt-10 drop-shadow-md">
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
                    {dataa.length > 0 &&
                      dataa
                        .slice(currentPage * 5 - 5, currentPage * 5)
                        .map((row, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {index + 1}
                            </td>
                           
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.amount}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.earn_point}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.status === 1
                                ? "Active"
                                : "Inactive"}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              <div className="flex justify-center gap-x-2 font-bold">
                                <HasPermission
                                  module="Category List"
                                  action="edit"
                                >
                                  {" "}
                                  <Tooltip
                                    message="edit"
                                    key={row.id}
                                  >
                                    <button
                                      onClick={() => handleEditClick(row.id)}
                                      className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                                    >
                                      <FaRegEdit />
                                    </button>
                                  </Tooltip>
                                </HasPermission>
                                {/* <HasPermission
                                  module="Category List"
                                  action="delete"
                                >
                                  {" "}
                                   <Tooltip message="Delete">
                                    <div>
                                      <button
                                        className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                                        onClick={() =>
                                          handleDeleteClick(row.id)
                                        }
                                      >
                                        <FaRegTrashCan />
                                      </button>

                                      <DeleteModal
                                        show={showModal}
                                        onClose={handleModalClose}
                                        onDelete={handleModalDelete}
                                      />
                                    </div>
                                  </Tooltip>
                                </HasPermission> */}
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pagination */}

            {/* {dataa.length > 0 && (
              <div className="mt-10">
                <div className="float-right flex items-center space-x-2">
                  <button
                    onClick={() => selectepage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(Math.ceil(dataa.length / 5))].map((_, index) => {
                    return (
                      <button
                        onClick={() => selectepage(index + 1)}
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
                    onClick={() => selectepage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(dataa.length / 5)}
                    className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </section>
      </div>

      <CategoryDialogBox
        title={"Create Loyalty Point"}
        onClose={() => {
          setIsModalOpen(false);
        }}
        isOpen={isModalOpen}
      >
        <div className="">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="flex justify-between gap-x-11">
              <div className="category">
                <div className="mb-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-nowrap text-gray-700 font-semibold mb-2"
                    htmlFor="categoryName"
                  >
                    Amount 
                  </label>
                  <input
                    className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="categoryName"
                    type="number"
                    name="amount"
                   
                     value={formdata.amount}
                     onChange={handalchange}
                  />
                </div>
                <div className="mb-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-nowrap text-gray-700 font-semibold mb-2"
                    htmlFor="categoryName"
                  >
                    Earn Point
                  </label>
                  <input
                    className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="earn_point"
                    type="number"
                    name="earn_point"
                    
                     value={formdata.earn_point}
                     onChange={handalchange}
                  />
                </div>
               
                
              </div>

              <div className="offer_category">
               
                

                <div className="mt-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-gray-700 w-[200px] font-semibold mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="status"
                    name="status"
                     value={formdata.status}
                     onChange={handalchange}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                <div className="flex mt-10 float-right gap-x-3">
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
            </div>
          </form>
        </div>
      </CategoryDialogBox>

      {editModal && (
        <EditDialogBox
          title={"Edit Point Data"}
          isOpen={editModal}
          onClose={() => {
            setEditModal(false);
          }}
        >
          <div className="">
          <form onSubmit={handleSubmit2} className="bg-white rounded px-8 pt-6 pb-8 mb-4">
          <div className="flex justify-between gap-x-11">
            <div className="category">
              <div className="mb-4 flex gap-x-5 justify-center items-center">
                <label className="block text-nowrap text-gray-700 font-semibold mb-2" htmlFor="amount">
                  Amount 
                </label>
                <input
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="amount"
                  type="text"
                  name="amount"
                  value={formdata1.amount}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4 flex gap-x-5 justify-center items-center">
                <label className="block text-nowrap text-gray-700 font-semibold mb-2" htmlFor="earn_point">
                  Earn Point
                </label>
                <input
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="earn_point"
                  type="number"
                  name="earn_point"
                  value={formdata1.earn_point}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="offer_category">
              <div className="mt-4 flex gap-x-5 justify-center items-center">
                <label className="block text-gray-700 w-[200px] font-semibold mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="status"
                  name="status"
                  value={formdata1.status}
                  onChange={handleChange}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
 </select>
              </div>

              <div className="flex mt-10 float-right gap-x-3">
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
          </div>
        </form>
          </div>
        </EditDialogBox>
      )}
    </>
  )
}

export default Point_setting
