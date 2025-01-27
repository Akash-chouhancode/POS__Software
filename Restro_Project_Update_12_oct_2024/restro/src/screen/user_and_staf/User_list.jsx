import React, { useState, useEffect } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";
import { FaMagnifyingGlass } from "react-icons/fa6";
import defaultimage from "../../assets/images/user.png";
import DeleteDialogBox from "../../components/DeleteDialogBox";
import axios from "axios";
import HasPermission from "../../store/HasPermission";

import useFullScreen from "../../components/useFullScreen";

import Papa from "papaparse";
import ExcelJS from "exceljs";

import jsPDF from "jspdf";
import "jspdf-autotable";

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

const ActionButtion = [

  { btn: "CSV" },
  { btn: "Excel" },
  { btn: "PDF" },

];
const headers = [
  "SL.",
  "Image",
  "User Name ",
  "Email Address",
  "About",
  "Last Log-in",
  "Last Log-out",
  "Status",
  "Action",
];
const User_list = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  const [isOpen, setOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchName, setSearchName] = useState("");
  const [userData, setUserData] = useState([]);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleImageError = (e) => {
    e.target.src = defaultimage;
  };

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(userData.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const fetchUserData = () => {
    axios
      .get(`${API_BASE_URL}/all`)
      .then((res) => {
        setUserData(res.data.data);
        console.log("data", res.data);
      })
      .catch((error) => console.error(error));
  };

  // search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);
    setCurrentPage(1);
    if (value.trim() === "") {
      fetchUserData();
      return;
    }

    axios
      .get(`${API_BASE_URL}/all`, {
        params: { searchItem: value },
      })
      .then((res) => {
        setUserData(res.data.data.length > 0 ? res.data.data : []);
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
      .delete(`${API_BASE_URL}/deleteuser/${id}`)
      .then((res) => {
        console.log("Data Deleted");
        toast.success("delete user sucessfully..")
        fetchUserData();
      })
      .catch((err) => {
        console.log(err);
      });
  };
//edit

const [formData2, setFormData2] = useState({
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  about: "",
  status: 1,
  is_admin: 0,
  image: null,
});
const [isChecked, setIsChecked] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
 const [editId, setEditId] = useState(null);
 const handleImageChange = (e) => {
  setFormData2({
    ...formData2,
    image: e.target.files[0], // Set the image file in formData
  });
};

  // Handle checkbox for is_admin
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    setFormData2({
      ...formData2,
      is_admin: e.target.checked ? 1 : 0, // Update is_admin based on checkbox
    });
  };

const handleEditClick = (id) => {
  setEditId(id);
  setIsModalOpen(true);
  // Fetch data for the given ID
  axios.get(`${API_BASE_URL}/userbyid/${id}`).then((response) => {
    setFormData2({
      firstname: response.data.data.firstname,
      lastname: response.data.data.lastname,
      email: response.data.data.email,
      about: response.data.data.about,
      image: response.data.data.image,
      status: response.data.data.status, 
      is_admin:response.data.data.is_admin

    });
  });
};
const handleChange2 = (e) => {
  setFormData2({
    ...formData2,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit2 = async () => {
  // Basic validation to ensure all required fields are filled
 

  const data = new FormData();
  data.append("firstname", formData2.firstname);
  data.append("lastname", formData2.lastname);
  data.append("email", formData2.email);
  data.append("password", formData2.password);
  data.append("about", formData2.about);
  data.append("status", formData2.status);
  data.append("is_admin", formData2.is_admin);
  
  // Append the image if it's selected
  if (formData2.image) {
    data.append("image", formData2.image); 
  }

  try {
   
    const response = await axios.put(`${API_BASE_URL}/updateuser/${editId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      toast.success("User updated successfully!");
      fetchUserData()
      setIsModalOpen(false)
      // Reset the form on successful submission
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("Failed to update user.");
  }
};




const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all`);
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
    // Map your data structure as needed
      

    Image:item.image,
    User_Name:`${item.firstname} ${item.lastname}`,
    Email_Address:item.email,
    About:item.email,
    Last_Login:item.last_login,
    Last_Log_out:item.last_logout,
    Status:item.status===1?"Active":"Inactive",
  
   
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
    { header: "Image", key: "image" },
    { header: "User Name", key: "user_name" },
    { header: "Email Address", key: "email_address" },
    { header: "About", key: "about" },
    { header: "Last Log-in", key: "last_login" },
    { header: "Last Log-out", key: "last_logout" },
    { header: "Status", key: "status" },
  ];

  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
    

      image:item.image,
      user_name:`${item.firstname} ${item.lastname}`,
      email_address:item.email,
      about:item.email,
      last_login:item.last_login,
      last_logout:item.last_logout,
      status:item.status===1?"Active":"Inactive",
  
  
  
    
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
    

    item.image,
   `${item.firstname} ${item.lastname}`,
    item.email,
    item.email,
   item.last_login,
   item.last_logout,
    item.status===1?"Active":"Inactive",



  ]);

  // Add a title
  doc.text("Data Export", 20, 10);

  // Add a table
  doc.autoTable({
    head: [
      [
        "Image",
        "User Name ",
        "Email Address",
        "About",
        "Last Log-in",
        "Last Log-out",
        "Status",
        
      ],
    ],
    body: rows,
  });

  doc.save("data.pdf"); // PDF file name
};







  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
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
              <h1 className=" font-semibold mb-3">All Users List</h1>

              <div className="notification flex gap-x-5">
                <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>
            <div className=" mt-11  w-full">
              <section className=" tablebutton">
                <div className="orderButton  flex justify-evenly flex-wrap gap-x-5 gap-y-5  ">
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

                  <div className="flex m-auto px-4 rounded-md border-[1px]   border-gray-900">
                    <input
                      value={searchName}
                      onChange={handleSearch}
                      placeholder="Search menu..."
                      type="search"
                      className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                    />
                    <button
                      // onClick={handleSearch}
                      className="px-4 text-[#0f044a] text-sm"
                    >
                      <FaMagnifyingGlass />
                    </button>
                  </div>
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
  {userData && userData.length > 0 ? (
    userData
      .slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
      .map((row, index) => (
        <tr key={index}>
          <td className="py-2 px-4 border border-[#4CBBA1]">{index + 1}</td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            <img
              src={`${VITE_IMG_URL}${row.image}`}
              alt={row.Name}
              onError={handleImageError}
              className="w-[80px] h-[60px] mx-auto text-wrap text-sm"
            />
          </td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            {`${row.firstname} ${row.lastname}`}
          </td>
          <td className="py-2 px-4 border border-[#4CBBA1]">{row.email}</td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            {row.about ? row.about : "No About Info"}
          </td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            {row.last_login
              ? new Date(row.last_login).toLocaleString("en-GB")
              : "No date"}
          </td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            {row.last_logout
              ? new Date(row.last_logout).toLocaleString("en-GB")
              : "No date"}
          </td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            {row.status === 1 ? "Active" : "Inactive"}
          </td>
          <td className="py-2 px-4 border border-[#4CBBA1]">
            {row.is_admin === 1 ? (
              <button className="hover:bg-[#4cddA1] bg-[#0f044a] text-[#fff] border-[2px] border-zinc-300 rounded-xl cursor-pointer px-7 py-3">
                Admin
              </button>
            ) : (
              <div className="flex justify-center gap-x-2 font-bold">
                <HasPermission module="User List" action="edit">
                <Tooltip message="Edit" key={row.id}>
                  <button
                    className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                    onClick={() => handleEditClick(row.id)}
                  >
                    <FaRegEdit />
                  </button>
                </Tooltip>
                </HasPermission>
                <HasPermission module="User List" action="delete">
                <Tooltip message="Delete Category">
                  <div>
                    <button
                      className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                      onClick={() => handleDeleteClick(row.id)}
                    >
                      <FaRegTrashCan />
                    </button>
                  </div>
                </Tooltip>
                </HasPermission>
               
              </div>
            )}
          </td>
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="9" className="text-center py-4">
        No Data Found
      </td>
    </tr>
  )}
</tbody>

                </table>
              </div>
            </section>

            <div className="flex justify-between mt-7">
              {userData.length > 0 && (
                <div className="mt-10">
                  <div className="float-right flex items-center space-x-2">
                    <button
                      onClick={() => selectPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(Math.ceil(userData.length / itemsPerPage))].map(
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
                        currentPage ===
                        Math.ceil(userData.length / itemsPerPage)
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
      {isModalOpen &&(
 <>
 <div></div>
 <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto p-10 fixed inset-0 z-50 outline-none focus:outline-none  ">
       <div className="  w-full py-3 h-screen px-20">
         <div className="py-4  bg-white  rounded-md shadow-md border-[1px]  border-[#1C1D3E]">
           <div className="flex   px-4 justify-between items-center border-b-[1px] border-black">
             <h2 className="text-xl  font-semibold">Edit User Data</h2>
             <button
               onClick={() => setIsModalOpen(false)}
               className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold"
             >
               X
             </button>
           </div>
           <div className=" p-4">
           <form>
      <div className="pt-11 pb-16 pr-24">
        <div className="mb-11 flex gap-x-7">
          <label
            className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="firstname"
          >
            First Name
          </label>
          <input
            value={formData2.firstname}
            onChange={handleChange2}
            type="text"
            maxLength={30}
            name="firstname"
            placeholder="First Name"
            className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-11 flex gap-x-7">
          <label
            className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="lastname"
          >
            Last Name
          </label>
          <input
            value={formData2.lastname}
            onChange={handleChange2}
            type="text"
            maxLength={30}
            name="lastname"
            placeholder="Last Name"
            className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-11 flex gap-x-7">
          <label
            className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            value={formData2.email}
            onChange={handleChange2}
            type="email"
            name="email"
            placeholder="Email Address"
            className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-11 flex gap-x-7">
          <label
            className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            value={formData2.password}
            onChange={handleChange2}
            name="password"
            type="password"
            placeholder="Password"
            className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-11 flex gap-x-7">
          <label
            className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="image"
          >
            Image
          </label>
          <input
            className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="image"
            name="image"
            type="file"
            onChange={handleImageChange}
          />
        </div>
        <div className="mb-11 flex gap-x-7">
          <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            name="about"
            value={formData2.about}
            onChange={handleChange2}
            className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          ></textarea>
        </div>
        <div className="mb-11 flex gap-x-7">
          <label
            className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <select
            className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="status"
            name="status"
            value={formData2.status}
            onChange={handleChange2}
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div className="mb-11 flex gap-x-3">
          <label
            className="  ml-44 text-nowrap text-gray-700 font-semibold mb-2"
            htmlFor="is_admin"
          >
            Is Admin
          </label>
          <input
            type="checkbox"
            name="is_admin"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="size-5 custom-checkbox"
          />
        </div>
        <div className="float-right flex ml-11 space-x-4">
          <button
            type="reset"
            className="w-[104px] h-[42px] bg-[#4CBBA1] text-gray-50 rounded-md"
           
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit2}
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

export default User_list;
