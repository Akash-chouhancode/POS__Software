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
import { IoIosAddCircleOutline } from "react-icons/io";
import CategoryDialogBox from "../../components/CategoryDialogBox";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DeleteDialogBox from "../../components/DeleteDialogBox";
import axios from "axios";
import HasPermission from "../../store/HasPermission";
import useFullScreen from "../../components/useFullScreen";

const ActionButtion = [
  { btn: "Copy" },
  { btn: "CSV" },
  { btn: "Excel" },
  { btn: "PDF" },
  { btn: "Column Visiblity" },
];
const headers = ["SL.", "Name", "Start Data", "End date", "Days", "Action"];
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

const Leave_application = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [isOpen, setOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [applicationData, setApplicationData] = useState([]);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [employeData, setEmployeData] = useState([]);
  const [leaveType, setLeaveType] = useState([]);
  const [userData, setUserData] = useState([]);
  const [searchName, setSearchName] = useState("");
  //get all employee for dropdown
  const getEmployeeData = () => {
    axios
      .get(`${API_BASE_URL}/employedata`)
      .then((res) => {
        // Update the employee data state
        setEmployeData(res.data.data);

        // Log the received data after it has been set
        console.log("Data received: ", res.data.data);
        console.log("hey");
      })
      .catch((error) => {
        // Log the error to the console
        console.error("Error fetching employee data: ", error);
        console.log("hey");
        // Display an error toast notification
        toast.error(`Error fetching employee data: ${error.message}`);
      });
  };
  // get all leave type for dropdown

  const getLeaveType = () => {
    axios
      .get(`${API_BASE_URL}/leavetype`)
      .then((response) => {
        setLeaveType(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  //user data for dropdown
  const fetchUserData = () => {
    axios
      .get(`${API_BASE_URL}/all`)
      .then((res) => {
        setUserData(res.data.data);
        console.log("data", res.data);
      })
      .catch((error) => console.error(error));
  };

  // get app application data

  const getApplicationData = () => {
    axios
      .get(`${API_BASE_URL}/leaveapply`)
      .then((response) => {
        setApplicationData(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);
    setCurrentPage(1);
    if (value.trim() === "") {
      getApplicationData();
      return;
    }

    axios
      .get(`${API_BASE_URL}/leaveapply`, {
        params: { searchItem: value },
      })
      .then((res) => {
        setApplicationData(res.data.data.length > 0 ? res.data.data : []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Error fetching filtered data");
      });
  };

  const [formdata, setFormdata] = useState({
    emp_his_id: "",
    leave_type_id: "",
    approved_by: "",
    apply_strt_date: "",
    apply_end_date: "",
    apply_day: "",
    reason: "",
  });
  const handleChange = (e) => {
    setFormdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const { apply_strt_date, apply_end_date } = formdata;

    if (apply_strt_date && apply_end_date) {
      const startDate = new Date(apply_strt_date);
      const endDate = new Date(apply_end_date);
      const differenceInTime = endDate - startDate;

      // Calculate days and add 1 to include the start date in the count
      const differenceInDays =
        Math.floor(differenceInTime / (1000 * 60 * 60 * 24)) + 1;

      // Ensure days is positive, or set to 0 if dates are invalid
      setFormdata((prevData) => ({
        ...prevData,
        apply_day: differenceInDays > 0 ? differenceInDays : 0,
      }));
    } else {
      setFormdata((prevData) => ({ ...prevData, apply_day: 0 }));
    }
  }, [formdata.apply_strt_date, formdata.apply_end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Destructure formdata for easy validation
    const {
      emp_his_id,
      leave_type_id,
      approved_by,
      apply_strt_date,
      apply_end_date,
      apply_day,
      reason,
    } = formdata;

    // Check if any field is empty
    if (
      !emp_his_id ||
      !leave_type_id ||
      !approved_by ||
      !apply_strt_date ||
      !apply_end_date ||
      !apply_day ||
      !reason
    ) {
      toast.error("Please fill in all required fields");
      return; // Stop form submission if any field is empty
    }

    // Proceed with form submission if all fields are filled
    try {
      const response = await axios.post(`${API_BASE_URL}/leaveapply`, formdata);
      console.log("Form submitted successfully:", response.data);
      toast.success("Application submitted successfully.");
      getApplicationData(); // Refresh application data
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form");
    }
  };

  //delete

  const handleDeleteClick = (id) => {
    setDeleteModalId(id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setDeleteModalId(null);
  };

  const handleModalDelete = () => {
    DeleteApplication(deleteModalId);
    handleModalClose();
  };
  const DeleteApplication = (id) => {
    axios
      .delete(`${API_BASE_URL}/leaveapply/${id}`)
      .then((res) => {
        console.log("Data Deleted");
        toast.success("Delete application sucessfully..");
        getApplicationData();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //edit
  const [formData2, setFormData2] = useState({
    emp_his_id: "",
    leave_type_id: "",
    approved_by: "",
    apply_strt_date: "",
    apply_end_date: "",
    apply_day: "",
    reason: "",
  });
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [editId, setEditId] = useState(null);
  const handleEditClick = (id) => {
    setEditId(id);
    setIsModalOpen2(true);
    // Fetch data for the given ID
    axios.get(`${API_BASE_URL}/leaveapply/${id}`).then((response) => {
      const data = response.data.data[0];
      setFormData2({
        emp_his_id: data.employee_id || "", // Ensure it matches select value for employee
        leave_type_id: data.leave_type_id || "", // Ensure it matches select value for leave type
        approved_by: data.approved_by || "", // Ensure it matches select value for approved by
        apply_strt_date: data.apply_strt_date || "",
        apply_end_date: data.apply_end_date || "",
        apply_day: data.apply_day || "",
        reason: data.reason || "",
      });
      console.log(data);
    });
  };
  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit2 = (e) => {
    e.preventDefault();
    axios
      .put(`${API_BASE_URL}/leaveapply/${editId}`, formData2)
      .then(() => {
        toast.success("Updated Sucessfully!");
        getApplicationData();
        setIsModalOpen2(false); // Close the modal after submission
      })
      .catch((error) => {
        console.error("Error updating data:", error);
      });
  };

  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(applicationData.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaveapply`);
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

      employee_name: item.employee_name,
      apply_strt_date: new Date(item.apply_strt_date).toLocaleDateString(),
      apply_end_date: new Date(item.apply_end_date).toLocaleDateString(),
      apply_day: item.apply_day,
      leave_type: item.leave_type,
      reason: item.reason,
      approved_by_name: item.approved_by_name,
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
      { header: "Employee_name", key: "employee_name" },
      { header: "Apply_strt_date", key: "apply_strt_date" },
      { header: "Apply_end_date", key: "apply_end_date" },
      { header: "Apply_day", key: "apply_day" },
      { header: "Leave_type", key: "Leave_type" },
      { header: "Reason", key: "reason" },
      { header: "Approved_by_name", key: "approved_by_name" },
    ];

    // Add rows
    data.forEach((item) => {
      worksheet.addRow({
        employee_name: item.employee_name,
        apply_strt_date: new Date(item.apply_strt_date).toLocaleDateString(),
        apply_end_date: new Date(item.apply_end_date).toLocaleDateString(),
        apply_day: item.apply_day,
        leave_type: item.leave_type,
        reason: item.reason,
        approved_by_name: item.approved_by_name,
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
      item.employee_name,
      new Date(item.apply_strt_date).toLocaleDateString(),
      new Date(item.apply_end_date).toLocaleDateString(),
      item.apply_day,
      item.leave_type,
      item.reason,
      item.approved_by_name,
    ]);

    // Add a title
    doc.text("Data Export", 20, 10);

    // Add a table
    doc.autoTable({
      head: [
        [
          "Employee Name",
          "Apply Date",
          "End Date",
          "Days",
          "Leave Type",
          "Reasion",
          "Approved By",
        ],
      ],
      body: rows,
    });

    doc.save("data.pdf"); // PDF file name
  };

  useEffect(() => {
    getApplicationData();
    getEmployeeData();
    getLeaveType();
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
              <h1 className=" font-semibold mb-3">Leave Application</h1>

              <div className="notification flex gap-x-5">
                <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>
            <div className=" flex justify-between">
              <span></span>
              <HasPermission module="Leave Application" action="create">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className=" bg-[#4CBBA1] h-[46px] w-[165px]  mt-10 rounded-sm  flex justify-center items-center
             gap-x-1 text-white font-semibold"
                >
                  <IoIosAddCircleOutline className=" font-semibold text-lg" />
                  Apply Leave
                </button>
              </HasPermission>
            </div>
            <div className=" mt-11  w-full">
              <section className=" tablebutton">
                <div className="orderButton  flex justify-evenly flex-wrap gap-x-5  gap-y-5  ">
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
                      placeholder="Search user..."
                      type="search"
                      className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                    />
                    <button
                      //   onClick={handleSearch}
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
                    {applicationData && applicationData.length > 0 ? (
                      applicationData
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
                              {row.employee_name
                                ? row.employee_name
                                : "No  Info"}
                            </td>
                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.apply_strt_date
                                ? row.apply_strt_date
                                : "No  Info"}
                            </td>

                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.apply_end_date
                                ? row.apply_end_date
                                : "No  Info"}
                            </td>

                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              {row.apply_day ? row.apply_day : "No  Info"}
                            </td>

                            <td className="py-2 px-4 border border-[#4CBBA1]">
                              <div className="flex justify-center gap-x-2 font-bold">
                                <HasPermission
                                  module="Leave Application"
                                  action="edit"
                                >
                                  <Tooltip
                                    message="Edit"
                                    key={row.leave_apply_id}
                                  >
                                    <button
                                      className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                                      onClick={() =>
                                        handleEditClick(row.leave_apply_id)
                                      }
                                    >
                                      <FaRegEdit />
                                    </button>
                                  </Tooltip>
                                </HasPermission>
                                <HasPermission
                                  module="Leave Application"
                                  action="delete"
                                >
                                  <Tooltip message="Delete">
                                    <div>
                                      <button
                                        className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                                        onClick={() =>
                                          handleDeleteClick(row.leave_apply_id)
                                        }
                                      >
                                        <FaRegTrashCan />
                                      </button>
                                    </div>
                                  </Tooltip>
                                </HasPermission>
                              </div>
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
              {applicationData.length > 0 && (
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
                      ...Array(
                        Math.ceil(applicationData.length / itemsPerPage)
                      ),
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
                        Math.ceil(applicationData.length / itemsPerPage)
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

      <CategoryDialogBox
        title={"Leave Application Form"}
        onClose={() => {
          setIsModalOpen(false);
        }}
        isOpen={isModalOpen}
      >
        <div className="">
          <form onSubmit={handleSubmit}>
            <div className="pt-11 pb-16 pr-24">
              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  Employee Name *
                </label>

                <select
                  onChange={handleChange}
                  value={formdata.emp_his_id}
                  name="emp_his_id"
                  className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select</option>
                  {employeData.map((val) => (
                    <option key={val.emp_his_id} value={val.emp_his_id}>
                      {`${val.FirstName} ${val.LastName}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  Select Leave Type*
                </label>

                <select
                  value={formdata.leave_type_id}
                  onChange={handleChange}
                  name="leave_type_id"
                  className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select</option>
                  {leaveType.map((val) => (
                    <option key={val.leave_type_id} value={val.leave_type_id}>
                      {`${val.leave_type}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  Approved By*
                </label>

                <select
                  value={formdata.approved_by}
                  onChange={handleChange}
                  name="approved_by"
                  className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select</option>
                  {userData.map((val) => (
                    <option key={val.id} value={val.id}>
                      {`${val.firstname} ${val.lastname}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  Start Date*
                </label>
                <input
                  value={formdata.apply_strt_date}
                  onChange={handleChange}
                  type="date"
                  name="apply_strt_date"
                  className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  End Date*
                </label>
                <input
                  value={formdata.apply_end_date}
                  onChange={handleChange}
                  type="date"
                  name="apply_end_date"
                  className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  Days*
                </label>
                <input
                  value={formdata.apply_day}
                  onChange={handleChange}
                  name="apply_day"
                  type="number"
                  placeholder="0"
                  className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="mb-11 flex gap-x-7">
                <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                  Reason*
                </label>
                <textarea
                  className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  name="reason"
                  value={formdata.reason}
                  onChange={handleChange}
                  rows={5}
                ></textarea>
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
      </CategoryDialogBox>

      {isModalOpen2 && (
        <>
          <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
            <div className="  w-auto px-20 ">
              <div className=" py-4  bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
                <div className="flex  py-5 px-4 justify-between items-center border-b-[1px] border-black">
                  <h2 className="text-xl  font-semibold">Edit Leave Type</h2>
                  <button
                    onClick={() => setIsModalOpen2(false)}
                    className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold"
                  >
                    X
                  </button>
                </div>
                <div className="">
                  <form onSubmit={handleSubmit2}>
                    <div className="pt-11 pb-16 pr-24">
                      {/* Employee Name */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          Employee Name *
                        </label>
                        <select
                          onChange={handleChange2}
                          value={formData2.emp_his_id}
                          name="emp_his_id"
                          className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="">Select</option>
                          {employeData.map((val) => (
                            <option key={val.emp_his_id} value={val.emp_his_id}>
                              {`${val.FirstName} ${val.LastName}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Leave Type */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          Select Leave Type*
                        </label>
                        <select
                          value={formData2.leave_type_id}
                          onChange={handleChange2}
                          name="leave_type_id"
                          className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="">Select</option>
                          {leaveType.map((val) => (
                            <option
                              key={val.leave_type_id}
                              value={val.leave_type_id}
                            >
                              {`${val.leave_type}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Approved By */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          Approved By*
                        </label>
                        <select
                          value={formData2.approved_by}
                          onChange={handleChange2}
                          name="approved_by"
                          className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="">Select</option>
                          {userData.map((val) => (
                            <option key={val.id} value={val.id}>
                              {`${val.firstname} ${val.lastname}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          Start Date
                        </label>
                        <input
                          value={formData2.apply_strt_date}
                          onChange={handleChange2}
                          type="date"
                          name="apply_strt_date"
                          className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      {/* End Date */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          End Date
                        </label>
                        <input
                          value={formData2.apply_end_date}
                          onChange={handleChange2}
                          type="date"
                          name="apply_end_date"
                          className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      {/* Days */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          Days
                        </label>
                        <input
                          value={formData2.apply_day}
                          onChange={handleChange2}
                          name="apply_day"
                          type="number"
                          placeholder="0"
                          className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      {/* Reason */}
                      <div className="mb-11 flex gap-x-7">
                        <label className="m-auto text-nowrap w-[300px] text-right text-gray-700 font-semibold mb-2">
                          Reason
                        </label>
                        <textarea
                          className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          name="reason"
                          value={formData2.reason}
                          onChange={handleChange2}
                          rows={5}
                        ></textarea>
                      </div>

                      {/* Submit Button */}
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
      )}

      <DeleteDialogBox
        show={showModal}
        onClose={handleModalClose}
        onDelete={handleModalDelete}
      />
    </>
  );
};

export default Leave_application;
