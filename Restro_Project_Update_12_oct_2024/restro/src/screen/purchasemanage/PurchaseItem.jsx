import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import { useNavigate } from "react-router-dom";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";

import { FaRegEdit } from "react-icons/fa";
import { IoDocumentTextOutline, IoWalletOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import HasPermission from "../../store/HasPermission";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import useFullScreen from "../../components/useFullScreen"
const headers = [
  "SL.",
  "Invoice No.",

  "Supplier Name",
  "Date",
  "Total Price",

  "Action",
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
const PurchaseItem = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  //get supplier

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [isOpen, setOpen] = useState(true);
  const [purchaseData, setPurchaseData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchName, setSearchName] = useState("");

  const [grandTotal, setGrandTotal] = useState(0);
  const [apiItems, setApiItems] = useState([]);
  const [suppler, setSuppler] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const getPurchaseData = () => {
    axios
      .get(`${API_BASE_URL}/purchaseitem`)
      .then((response) => {
        setPurchaseData(response.data.data);
        console.log(response); // assuming response.data.data contains your purchase data
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(purchaseData.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);
    setCurrentPage(1);
    if (value.trim() === "") {
      getPurchaseData();
      return;
    }

    axios
      .get(`${API_BASE_URL}/purchaseitem`, {
        params: { searchItem: value },
      })
      .then((res) => {
        setPurchaseData(res.data.data.length > 0 ? res.data.data : []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Error fetching filtered data");
      });
  };
  //edit

  const [purchaseDetails, setPurchaseDetails] = useState({
    suplierID: "",
    invoiceid: "",
    details: "",
    purchasedate: "",
    purchaseexpiredate: "",
    paid_amount: "",
  });

  const [items, setItems] = useState([
    {
      item: "",
      stock_qty: 0,
      quantity: 0,
      rate: 0,
      total: 0,
    },
  ]);
  const getSuppliers = () => {
    axios.get(`${API_BASE_URL}/suppliers`).then((response) => {
      setSuppler(response.data.data);
    });
  };

  const getPaymentMethods = () => {
    axios.get(`${API_BASE_URL}/paynmenttype`).then((response) => {
      setPaymentMethod(response.data);
    });
  };

  const IngredientsQuantity = () => {
    axios
      .get(`${API_BASE_URL}/getIngredient`)
      .then((response) => {
        setApiItems(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Handling form input changes for purchase details
  const handlePurchaseDetailChange = (e) => {
    const { name, value } = e.target;
    setPurchaseDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestData = {
      purchasedetail: [
        {
          ...purchaseDetails,
          total_price: grandTotal,
          // paid_amount:
        },
      ],
      itemdetails: items.map((item) => ({
        indredientid: item.item,
        quantity: item.quantity,
        price: item.rate,
      })),
    };
    console.log("Success:", requestData);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/updatedata/${editId}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Success:", response.data);

      // Show success toast
      toast.success("Purchase updated successfully!");

      // Reset form fields and state variables
      setPurchaseDetails({
        invoiceid: "",
        suplierID: "",
        details: "",
        purchasedate: "",
        purchaseexpiredate: "",
        paid_amount: "",
      });

      setItems([{ item: "", stock_qty: 0, quantity: 0, rate: 0, total: 0 }]);
      setGrandTotal(0);
      
      setSelectedMethod(1); // Reset payment method to default or the first option
      setIsModalOpen(false)
      getPurchaseData();
    } catch (error) {
      console.error("Error:", error);
      // Show error toast
      console.log("edit id ", editId);
      toast.error("Something went wrong.");
    }
  };
  // Handle changes in item rows
  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const updatedItems = [...items];

    if (name === "item") {
      const selectedItem = apiItems.find((item) => item.id === parseInt(value));
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          item: selectedItem.id,
          stock_qty: selectedItem.stock_qty,
          quantity: 1,
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };

      if (name === "quantity" || name === "rate") {
        const quantity = updatedItems[index].quantity || 0;
        const rate = updatedItems[index].rate || 0;
        updatedItems[index].total = quantity * rate;
      }
    }
    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  // Fetch existing purchase data for editing
  const handleEditClick = (reserveid) => {
    setEditId(reserveid);
    console.log("ye id aa rhi h ", reserveid);
    axios.get(`${API_BASE_URL}/getupdate/${reserveid}`).then((response) => {
      const data = response.data.data;
      console.log("Fetched data from API:", data);
      // Set purchase details in state
      setPurchaseDetails({
        suplierID: data.purchaseitem[0].suplierID,
        invoiceid: data.purchaseitem[0].invoiceid,
        details: data.purchaseitem[0].details,
        purchasedate: new Date(data.purchaseitem[0].purchasedate)
          .toISOString()
          .substring(0, 10),
        purchaseexpiredate: new Date(data.purchaseitem[0].purchaseexpiredate)
          .toISOString()
          .substring(0, 10),
        paid_amount: data.purchaseitem[0].paid_amount,
      });

      // Logging the updated purchase details after setting state might still show old values
      console.log("Updated purchase details being set:", {
        suplierID: data.purchaseitem[0].suplierID,
        invoiceid: data.purchaseitem[0].invoiceid,
        details: data.purchaseitem[0].details,
        purchasedate: new Date(data.purchaseitem[0].purchasedate)
          .toISOString()
          .substring(0, 10),
        purchaseexpiredate: new Date(data.purchaseitem[0].purchaseexpiredate)
          .toISOString()
          .substring(0, 10),
        paid_amount: data.purchaseitem[0].paid_amount,
      });

      // Set items in state
      setItems(
        data.itemdetails.map((item) => ({
          item: item.ingredientids,
          quantity: item.quantity,
          rate: item.totalprice,
          stock_qty: item.stocky_quantity,
          total: item.totalprice,
        }))
      );

      // Set grand total
      setGrandTotal(data.total_price);

      // Open the modal
      setIsModalOpen(true);
    });
  };
  // Adding new rows
  const addRow = () => {
    setItems([
      ...items,
      { item: "", stock_qty: 0, quantity: 0, rate: 0, total: 0 },
    ]);
  };

  // Removing rows
  const removeRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };

  // Calculate grand total
  const calculateGrandTotal = (items) => {
    const totals = items.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
    setGrandTotal(totals);
  };

  // Payment method change handler
  const handleMethodChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  // downoload


  const fetchData= async ()=>{

    try {
const response= await axios.get(`${API_BASE_URL}/purchaseitem`)
return  response.data.data;
      
    } catch (error) {

      console.error("Error fetching data:", error);
      throw error; // Rethrow the error to handle it in the calling function if needed
      
    }


  }
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
  
    Invoice_Number: item.invoiceid,
    Supplier_Name:item.suppliername,
   Purchase_Date: new Date(item.purchasedate).toLocaleDateString(),
   Total_price: item.total_price,
   Paid_Ammount:item.paid_amount
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
    { header: "Invoice_Number", key: "invoice_number" },
    { header: "Supplier_Name", key: "supplier_name" },
    { header: "Purchase_Date", key: "purchase_date" },
    { header: "Total_price", key: "total_price" },
    { header: "Paid_Ammount", key: "paid_ammount" },
   
    
    
  ];
  // Add rows
  data.forEach((item) => {
    worksheet.addRow({
      invoice_number: item.invoiceid,
      supplier_name: item.suppliername,
      purchase_date: new Date(item.purchasedate).toLocaleDateString(),
      total_price: item.total_price,
      paid_ammount:item.paid_amount
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
    item.invoiceid,
    item.suppliername,
    new Date(item.purchasedate).toLocaleDateString(),
    item.total_price,
    item.paid_amount
  ]);

  // Add a title
  doc.text("Data Export", 20, 10);

  // Add a table
  doc.autoTable({
    head: [
      [
        "Invoice Number",
        "Supplier Name",
        "Purchase Date",
        "Total Price",
        "Paid Amount"
      ],
    ],
    body: rows,
  });

  doc.save("data.pdf"); // PDF file name
};






  useEffect(() => {
    getPurchaseData();
    IngredientsQuantity();
    getSuppliers();
    getPaymentMethods();
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
                Purchase Item
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              </div>
            </div>

            <div className=" flex justify-between mt-11">
              <span></span>
<HasPermission module="Purchase Item" action="create">
<button
                onClick={() => {
                  navigate("/add-purchase");
                }}
                className=" bg-[#4CBBA1] h-[46px] w-[165px] rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
              >
                <IoIosAddCircleOutline className=" font-semibold text-lg" />
                Add Purchase
              </button>
</HasPermission>
              
            </div>
            {/* Search Bar */}
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
                  <div className="flex m-auto px-4 rounded-md border-[1px]  border-gray-900">
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
                      {purchaseData.length > 0 ? (
                        purchaseData
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
                                {row.invoiceid}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.suppliername}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.purchasedate
                                  ? new Date(
                                      row.purchasedate
                                    ).toLocaleDateString("en-GB") // DD/MM/YYYY format
                                  : "No date"}
                              </td>

                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.total_price}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                <div className="flex justify-center font-bold">
                                  <HasPermission module="Purchase Item" action="edit">
                                  <Tooltip message="Edit">
                                    <button
                                      onClick={() => handleEditClick(row.purID)}
                                      className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                                    >
                                      <FaRegEdit />
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
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            {/* pagination  */}
            <div className="flex justify-between mt-7">
              {purchaseData.length > 0 && (
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
                      ...Array(Math.ceil(purchaseData.length / itemsPerPage)),
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
                        Math.ceil(purchaseData.length / itemsPerPage)
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
      {isModalOpen && (
        <>
          <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="w-full px-20">
              <div className="py-4 bg-white rounded-md shadow-md border-[1px] border-[#1C1D3E]">
                <div className="flex py-5 px-4 justify-between items-center border-b-[1px] border-black">
                  <h2 className="text-xl font-semibold">Edit Purchase Item</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold"
                  >
                    X
                  </button>
                </div>
                <div className="p-5">
                  <form className="" onSubmit={handleSubmit}>
                    <div className="border-[1px] border-[#4CBBA1] rounded-md p-10 mb-10">
                      <div className="flex justify-between">
                        <div className="left">
                          <div className="mb-4 flex gap-x-5 justify-center items-center">
                            <label className="block text-nowrap text-gray-700 font-semibold mb-2">
                              Supplier Name
                            </label>
                            <select
                              value={purchaseDetails.suplierID}
                              onChange={handlePurchaseDetailChange}
                              className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              name="suplierID"
                            >
                              <option value="">Select option</option>
                              {suppler.map((val, index) => (
                                <option key={index} value={val.supid}>
                                  {val.supName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-nowrap text-gray-700 font-semibold mb-2">
                              Payment Method
                            </label>
                            <select
                              value={selectedMethod}
                              onChange={handleMethodChange}
                              className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              name="paymenttype"
                            >
                              {paymentMethod.map((method, index) => (
                                <option
                                  key={index}
                                  value={method.payment_method_id}
                                >
                                  {method.payment_method}
                                </option>
                              ))}
                            </select>
                            {(selectedMethod === 9 || selectedMethod === 4) && (
                              <div className="mt-4">
                                <div className="w-full max-w-lg mx-auto p-8">
                                  <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h2 className="text-lg font-medium mb-6">
                                      Payment Information
                                    </h2>
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Card Number
                                        </label>
                                        <input
                                          type="text"
                                          name="card-number"
                                          placeholder="0000 0000 0000 0000"
                                          className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                      </div>
                                      <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Expiration Date
                                        </label>
                                        <input
                                          type="text"
                                          name="expiration-date"
                                          placeholder="MM / YY"
                                          className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                      </div>
                                      <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          CVV
                                        </label>
                                        <input
                                          type="text"
                                          name="cvv"
                                          placeholder="000"
                                          className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                      </div>
                                      <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Card Holder
                                        </label>
                                        <input
                                          type="text"
                                          name="card-holder"
                                          placeholder="Full Name"
                                          className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="right">
                          <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                              Invoice ID
                            </label>
                            <input
                              type="text"
                              name="invoiceid"
                              value={purchaseDetails.invoiceid}
                              onChange={handlePurchaseDetailChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="Invoice ID"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                              Details
                            </label>
                            <input
                              type="text"
                              name="details"
                              value={purchaseDetails.details}
                              onChange={handlePurchaseDetailChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="Details"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                              Purchase Date
                            </label>
                            <input
                              type="date"
                              name="purchasedate"
                              value={purchaseDetails.purchasedate}
                              onChange={handlePurchaseDetailChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                              Expire Date
                            </label>
                            <input
                              type="date"
                              name="purchaseexpiredate"
                              value={purchaseDetails.purchaseexpiredate}
                              onChange={handlePurchaseDetailChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </div>
                        </div>
                      </div>
                      <h1 className="font-semibold text-gray-600 text-lg mb-6">
                        Items Information
                      </h1>
                      <div>
                        <table className="table-auto w-full">
                          <thead>
                            <tr className="bg-[#4CBBA1] text-white">
                              <th className="px-4 py-2">Item</th>
                              <th className="px-4 py-2">Stock Quantity</th>
                              <th className="px-4 py-2">Quantity</th>
                              <th className="px-4 py-2">Rate</th>
                              <th className="px-4 py-2">Total</th>
                              <th className="px-4 py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={index}>
                                <td className="border px-4 py-2">
                                  <select
                                    value={item.item}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    name="item"
                                  >
                                    <option value="">Select Item</option>
                                    {apiItems.map((apiItem, idx) => (
                                      <option key={idx} value={apiItem.id}>
                                        {apiItem.ingredient_name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="border px-4 py-2">
                                  {item.stock_qty}
                                </td>
                                <td className="border px-4 py-2">
                                  <input
                                    type="number"
                                    name="quantity"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  />
                                </td>
                                <td className="border px-4 py-2">
                                  <input
                                    type="number"
                                    name="rate"
                                    value={item.rate}
                                    onChange={(e) => handleItemChange(index, e)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  />
                                </td>
                                <td className="border px-4 py-2">
                                  {item.total}
                                </td>
                                <td className="border px-4 py-2">
                                  <button
                                    onClick={() => removeRow(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={addRow}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Add More Item
                          </button>
                        </div>
                        {/* <div className="mt-4 text-center mb-5">
                          <h2 className="text-lg font-bold">
                            Grand Total: {grandTotal}
                          </h2>
                        </div> */}



      <div className="mb-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-nowrap w-[200px]  text-gray-700 font-semibold mb-2"
                    htmlFor="categoryName"
                  >
                   Grand Total
                  </label>
                  <input
                    className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="number"
                    name="paid_amount"
readOnly
                    value={grandTotal}

                   
                  />
                </div>
                      



                        <div className="mb-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-nowrap w-[200px]  text-gray-700 font-semibold mb-2"
                    htmlFor="categoryName"
                  >
                   Paid Amount*
                  </label>
                  <input
                    className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="number"
                    name="paid_amount"

                    value={purchaseDetails.paid_amount}

                    onChange={handlePurchaseDetailChange}
                  />
                </div>


                        
                      </div>
                    </div>
                    <div className="flex justify-end mt-10">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="ml-4 bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PurchaseItem;
