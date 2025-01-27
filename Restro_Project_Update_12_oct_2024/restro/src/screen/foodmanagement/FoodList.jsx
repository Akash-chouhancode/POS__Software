import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoMdCart, IoIosMan, IoIosArrowDown } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaMagnifyingGlass } from "react-icons/fa6";

import pic from "../../assets/images/pizza.jpeg";
import FoodEditDialogBox from "../../components/FoodEditDialogBox";
import axios from "axios";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import { Link } from "react-router-dom";

import { AuthContext } from "../../store/AuthContext";
import HasPermission from "../../store/HasPermission";

import Papa from "papaparse";
import ExcelJS from "exceljs";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFullScreen from "../../components/useFullScreen";

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
            Delete Category
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this item?
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

const AddFood = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  const [isOpen, setOpen] = useState(true);
  const [AddFoodModal, setAddFoodModal] = useState(false);
  const [variantData, setVariantData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMenuID, setSelectedMenuID] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded1, setIsExpanded1] = useState(false);
  const [variantModal, setVariantModal] = useState(false);
  const [categoryData, setcategoryData] = useState([]);
  const [kitchenData, setKitchenData] = useState([]);
  const [AddonsData, setAddonsData] = useState([]);
  const [menuCardData, setMenuCardData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [allAddonsData, setAllAddonsData] = useState([]);
  const [variantFormData, setVariantFormdata] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const{ isFullScreen, toggleFullScreen }= useFullScreen()
  const [formData, setFormData] = useState({
    CategoryID: "",
    kitchenid: "",
    ProductName: "",
    descrp: "",
    ProductImage: "",
    productvat: "",
    special: "",
    isoffer: "",
    offerstartdate: "",
    offerenddate: "",
    is_custom_quantity: "",
    cooktime: "",
    status: "",
    menuid: "",
  });
  const initialFormData = {
    name: "",
    parentid: "",
    offerstartdate: "",
    offerendate: "",
    status: "",
  };

  const addonsFormData = {
    addonName: "",
    price: "",
  };

  const [formdata, setFormdata] = useState(initialFormData);
  const [Addonformdata, setAddonformdata] = useState(addonsFormData);
  const [isChecked3, setIsChecked3] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({
    ProductsID: null,
    CategoryID: "",
    CategoryName: "",
    ProductName: "",
    productvat: "",
    ProductImage: "",
    offerIsavailable: "",
    offerstartdate: "",
    offerenddate: "",
    special: "",
    is_customqty: "",
    menutype: "",
    ProductsIsActive: "",
    kitchenid: "",
    kitchenName: "",
    descrip: "",
  });

  const [innerModal, setInnerModal] = useState(false);
  const Pic = pic;

  const handleDeleteClick = (ProductsID) => {
    setSelectedMenuID(ProductsID);
    setShowModal(true);
  };
  const navigate = useNavigate();
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedMenuID(null);
  };

  const handleModalDelete = () => {
    deletemenu(selectedMenuID);
    handleModalClose();
  };

  const [file, setFile] = useState(null);
  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const toggleExpand2 = () => {
    setIsExpanded2(!isExpanded2);
  };
  const toggleExpand1 = () => {
    setIsExpanded1(!isExpanded1);
  };

  const handleCheckboxChange1 = (e) => {
    setIsChecked1(e.target.checked);
  };
  const handleCheckboxChange2 = (e) => {
    setIsChecked2(e.target.checked);
  };

  const handleCheckboxChange3 = (e) => {
    setIsChecked3((e.target.checked = 1));
  };

  const EditFoodhandleChange = (e) => {
    setEditModalData({ ...editModalData, [e.target.name]: e.target.value });
  };

  const handleChangeVariant = (e) => {
    setVariantFormdata({ ...variantFormData, [e.target.name]: e.target.value });
  };

  const handleaddonchange = (e) => {
    const value = Number(e.target.value); // Ensure consistent type
    const { checked } = e.target;

    if (checked) {
      setAllAddonsData((prevData) => [...prevData, value]);
    } else {
      setAllAddonsData((prevData) =>
        prevData.filter((addon) => addon !== value)
      );
    }
  };
  const handleFileChange1 = (e) => {
    setItemImage(e.target.files[0]);
  };

  // add variants
  const variantFormSubmit = async (formvariantdata) => {
    let findProduct = variantData.find(
      (i) => i.variantName === formvariantdata.variantName
    );

    if (findProduct) {
      let newVariantData = variantData.map((variantcart) =>
        variantcart.id === formvariantdata.id
          ? { ...variantcart, [formvariantdata.name]: formvariantdata.value }
          : variantcart
      );
      setVariantData(newVariantData);
    } else {
      let newVariant = {
        id: formvariantdata.id,
        variantName: formvariantdata.variantName,
        price: formvariantdata.price,
      };
      setVariantData([...variantData, newVariant]);
    }
  };

  const removeProduct = (variantItem) => {
    const newVariantData = variantData.filter(
      (cartItem) => cartItem.variantName !== variantItem.variantName
    );
    setVariantData(newVariantData);
  };

  const deletemenu = (ProductsID) => {
    axios
      .delete(`${API_BASE_URL}/itemfood/${ProductsID}`)
      .then((res) => {
        console.log(res.data);
        getCategoryData();
        getmenuData();
        getkitchenData();
        cardData();
        toast.success("Item delete sucessfully.");
      })
      .catch((err) => {
        console.error("Error deleting category:", err);
      });
  };

  const handleImageError = (e) => {
    e.target.src = Pic;
  };

  //   handle edit modal of food
  const handleEditButtonClick = async (ProductID) => {
    axios
      .get(`${API_BASE_URL}/itemfooddetail/${ProductID}`)
      .then((res) => {
        console.log("Fetched data:", res.data); // Log fetched data for debugging

        const productData = res.data.productDetails;
        const addonsData = res.data.addons;
        const variantData = res.data.variants;
        console.log(addonsData, variantData);
        const allAddonsIds = addonsData
          .map((addon) => addon.add_on_id)
          .filter((id) => id && id !== 0);

        setAllAddonsData(allAddonsIds);

        setVariantData(variantData);
        setEditModalData({
          ProductsID: productData.ProductsID || null,
          CategoryID: productData.CategoryID || "",
          CategoryName: productData.Name || "",
          ProductName: productData.ProductName || "",
          productvat: productData.productvat || "",
          ProductImage: productData.ProductImage || "",
          offerIsavailable: productData.offerIsavailable || "",
          offerstartdate: productData.offerstartdate || "",
          offerenddate: productData.offerendate || "",
          special: productData.special || "",
          is_customqty: productData.is_customqty || "",
          menutype: productData.menutypeid || "",
          menuName: productData.menutype || "",
          ProductsIsActive: productData.ProductsIsActive || "",
          kitchenid: productData.kitchenid || "",
          kitchenName: productData.kitchen_name || "",

          descrip: productData.descrip || "",

          // Add any other fields needed
        });
        if (productData.offerIsavailable == 1) setIsChecked(true);

        if (productData.special == 1) setIsChecked1(true);
        if (productData.is_customqty == 1) setIsChecked2(true);

        setEditModal(true); // Open the modal after data is set
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (editModalData) {
    }
  }, [editModalData]);

  const getCategoryData = () => {
    axios
      .get(`${API_BASE_URL}/data`)
      .then((res) => {
        setcategoryData(res.data);
        console.log(res.data); // Ensure API response structure matches your expectations
      })
      .catch((error) => console.error(error));
  };

  const getmenuData = () => {
    axios
      .get(`${API_BASE_URL}/menutype`)
      .then((res) => {
        setMenuData(res.data.data);
      })
      .catch((error) => console.error(error));
  };

  const getActiveAddOns = () => {
    axios.get(`${API_BASE_URL}/getActiveAddOns`).then((res) => {
      console.log("active addon ", res.data);
      setAddonsData(res.data);
    });
  };

  const getkitchenData = () => {
    axios.get(`${API_BASE_URL}/getkitchen`).then((res) => {
      console.log(res.data);
      setKitchenData(res.data);
    });
  };

  const cardData = () => {
    axios
      .get(`${API_BASE_URL}/itemfood`)
      .then((res) => {
        console.log("hey data recivee", res.data);
        setMenuCardData(res.data);
      })
      .catch((error) => console.error(error));
  };

  // search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);
    if (value.trim() === "") {
      cardData();
      return;
    }

    axios
      .get(`${API_BASE_URL}/itemfood`, {
        params: { searchItem: value },
      })
      .then((res) => {
        setMenuCardData(res.data.length > 0 ? res.data : []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Error fetching filtered data");
      });
  };
  const { token } = useContext(AuthContext);
  const submitUpdateFood = () => {
    const itemdata = new FormData();
    itemdata.append("CategoryID", editModalData.CategoryID);
    itemdata.append("kitchenid", editModalData.kitchenid);
    itemdata.append("ProductName", editModalData.ProductName);
    itemdata.append("productvat", editModalData.productvat);
    itemdata.append("descrp", editModalData.descrip);
    itemdata.append("isoffer", isChecked);
    itemdata.append("special", isChecked1);
    itemdata.append("is_custom_quantity", isChecked2);
    itemdata.append("variant", JSON.stringify(variantData));
    itemdata.append("addons", JSON.stringify(allAddonsData));
    itemdata.append("menuid", editModalData.menutype);
    itemdata.append("status", editModalData.ProductsIsActive);
    itemdata.append("offerstartdate", editModalData.offerstartdate);
    itemdata.append("offerenddate", editModalData.offerenddate);
    itemdata.append("ProductImage", itemImage);
    console.log(editModalData);
    axios
      .put(
        `${API_BASE_URL}/updateItemfood/${editModalData.ProductsID}`,
        itemdata,
        { headers: { Authorization: token } }
      )
      .then((res) => {
        console.log(res.data);

        // Reset the form state to initial values
        setEditModalData({
          ProductsID: null,
          CategoryID: "",
          CategoryName: "",
          ProductName: "",
          productvat: "",
          ProductImage: "",
          offerIsavailable: "",
          offerstartdate: "",
          offerenddate: "",
          special: "",
          is_customqty: "",
          menutype: "",
          ProductsIsActive: "",
          kitchenid: "",
          kitchenName: "",
          descrip: "",
        });

        // Reset other states
        setEditModal(false);
        setItemImage(null);
        setIsChecked(false);
        setIsChecked1(false);
        setIsChecked2(false);
        setVariantData([]);
        setAllAddonsData([]);

        toast.success("Food and Variant updated Sucessfully..");
        cardData();
      })
      .catch((error) => console.error(error));
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/itemfood`);
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

      Food_Name: item.ProductName ? `${item.ProductName}` : "No food Found",
      Category_Name: item.Name ? `${item.Name}` : "No Category Found",
      Menu_Type: item.menutype,
      Product_Vat: item.productvat,
      Kitchen_Name: item.kitchen_name,
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
      { header: "Food Name", key: "food_name" },
      { header: "Category Name", key: "category_name" },
      { header: "Menu Type", key: "menu_type" },
      { header: "Product Vat", key: "product_vat" },
      { header: "Kitchen Name", key: "kitchen_name" },
    ];

    // Add rows
    data.forEach((item) => {
      worksheet.addRow({
        food_name: item.ProductName ? `${item.ProductName}` : "No food Found",
        category_name: item.Name ? `${item.Name}` : "No Category Found",
        menu_type: item.menutype ? `${item.menutype}` : "No Category Found",
        product_vat: item.productvat
          ? `${item.productvat}`
          : "No Category Found",
        kitchen_name: item.kitchen_name
          ? `${item.kitchen_name}`
          : "No Category Found",
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
      item.ProductName ? `${item.ProductName}` : "No food Found",
      item.Name ? `${item.Name}` : "No Category Found",
      item.menutype,
      item.productvat,
      item.kitchen_name,
    ]);

    // Add a title
    doc.text("Data Export", 20, 10);

    // Add a table
    doc.autoTable({
      head: [
        [
          "Food Name",
          "Category Name",
          "Menu Type",
          "Product Vat",
          "Kitchen Name",
        ],
      ],
      body: rows,
    });

    doc.save("data.pdf"); // PDF file name
  };

  useEffect(() => {
    getCategoryData();
    getmenuData();
    getkitchenData();
    cardData();

    getActiveAddOns();
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
                Food List
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>

            {/* Upload Button */}
            <div className=" flex justify-between mt-11">
              <span></span>
              <div className=" flex justify-center items-center gap-x-5 ">
                <HasPermission module="Food List" action="create">
                  <button
                    onClick={() => {
                      navigate("/add-food");
                    }}
                    className="bg-[#4CBBA1] h-[46px] w-[207px] rounded-sm flex justify-center items-center gap-x-1 text-white font-semibold"
                  >
                    <IoIosAddCircleOutline className="font-semibold text-lg" />
                    Add Food
                  </button>
                </HasPermission>
              </div>
            </div>
            <div className=" mt-11 w-full">
              <section>
                <div className=" flex justify-between">
                  <div className=" flex flex-wrap gap-x-5">
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
                  <div>
                    <div className="flex m-auto   px-4   rounded-md border-[1px] border-gray-900">
                      <button
                        onClick={handleSearch}
                        className="px-4 text-[#0f044a] text-sm"
                      >
                        <FaMagnifyingGlass />
                      </button>
                      <input
                        value={searchName}
                        onChange={handleSearch}
                        placeholder="Search food..."
                        type="search"
                        className="py-2 rounded-md text-gray-700 leading-tight focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* menucard section */}
            <div className="mt-7 h-screen overflow-y-auto bg-white border-[1px] border-[#4CBBA1] px-14 py-8 rounded-md">
              {/* card */}
              <div className=" flex  gap-x-6 gap-y-3 flex-wrap justify-center ">
                {menuCardData.map((val, index) => (
                  <div
                    key={index}
                    className="flex-none border-[1px] border-[#4CBBA1]"
                  >
                    <div className="  flex justify-evenly items-center p-4 gap-x-2 w-[400px] rounded-md">
                      <div className="border-[1px] border-[#4CBBA1] rounded-sm text-[10px] text-wrap">
                        <img
                          onError={handleImageError}
                          src={`${VITE_IMG_URL}` + val.ProductImage}
                          alt={val.ProductName}
                          className="h-[40px] w-[60px] rounded-sm"
                        />
                      </div>
                      <div>
                        <h1 className="whitespace-nowrap font-semibold">
                          {val.ProductName}
                        </h1>
                        <h2 className=" text-wrap text-sm">{val.Name}</h2>
                        <h2 className="whitespace-nowrap  text-sm">
                          {val.variantName}
                        </h2>
                      </div>
                      <div>
                        <div className="flex justify-center gap-x-2">
                          <HasPermission module="Food List" action="edit">
                            <Tooltip message="Edit">
                              <button
                                onClick={() =>
                                  handleEditButtonClick(val.ProductsID)
                                }
                                className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                              >
                                <FaRegEdit />
                              </button>
                            </Tooltip>
                          </HasPermission>

                          {/* <Tooltip message="Edit">
                              <button
                                onClick={() =>
                                  handleEditButtonClick(val.ProductsID)
                                }
                                className="bg-[#1C1D3E] p-1 rounded-sm text-white hover:scale-105"
                              >
                                <FaRegEdit />
                              </button>
                            </Tooltip> */}

                          <HasPermission module="Food List" action="delete">
                            <Tooltip message="Delete">
                              <button
                                className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                                onClick={() =>
                                  handleDeleteClick(val.ProductsID)
                                }
                              >
                                <FaRegTrashCan />
                              </button>
                            </Tooltip>
                          </HasPermission>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* card end */}
            </div>
          </div>
        </section>
      </div>
      <DeleteModal
        show={showModal}
        onClose={handleModalClose}
        onDelete={handleModalDelete}
      />
      {/* Menu item edit Dialog box */}

      <div>
        <FoodEditDialogBox
          title={"Menu Item Edit"}
          onClose={() => {
            setEditModal(false);
          }}
          isOpen={editModal}
        >
          <div className=" p-10">
            <form className="space-y-4">
              {/* main div */}
              <div className=" grid grid-flow-col gap-x-10">
                {/* Left form */}
                <div className="">
                  <div className="">
                    <label
                      className="block text-sm mb-2 font-medium text-gray-700"
                      htmlFor=""
                    >
                      Category
                    </label>
                    <select
                      className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="parentCategory"
                      name="CategoryID"
                      value={editModalData.CategoryID}
                      onChange={EditFoodhandleChange}
                    >
                      <option value="">Select option</option>

                      {categoryData.map((val, index) => (
                        <option key={index} value={val.CategoryID}>
                          {val.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className=" mb-2  mt-5">
                    <label className="block mb-2  text-sm font-medium text-gray-700">
                      Food Name
                    </label>
                    <input
                      type="text"
                      name="ProductName"
                      placeholder="Food Name"
                      value={editModalData.ProductName}
                      onChange={EditFoodhandleChange}
                      className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className=" mb-2  mt-5">
                    <label className="block  mb-2 text-sm font-medium text-gray-700">
                      Vat
                    </label>
                    <input
                      type="number"
                      name="productvat"
                      value={editModalData.productvat}
                      onChange={EditFoodhandleChange}
                      className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className=" mb-2  mt-5">
                    <label className="block  mb-2 text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <input
                      type="file"
                      name="ProductImage"
                      onChange={handleFileChange1}
                      className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  {/* offer */}

                  <div className="flex  mt-5 items-center justify-between">
                    <div>
                      <label className="block mb-2  text-sm font-medium text-gray-700">
                        Offer
                      </label>
                      <input
                        value={isChecked}
                        checked={isChecked}
                        type="checkbox"
                        name="isoffer"
                        id="offer"
                        onChange={handleCheckboxChange}
                        className="size-5 custom-checkbox"
                      />
                      {isChecked && (
                        <span className="text-gray-700 text-sm">
                          <div>
                            <div className="mb-4 flex gap-x-5 justify-center items-center">
                              <label
                                className="block text-nowrap text-gray-700 w-[200px] font-semibold mb-2"
                                htmlFor="offerStartDate"
                              >
                                Offer Start Date
                              </label>
                              <input
                                className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="offerStartDate"
                                value={editModalData.offerstartdate}
                                type="date"
                                placeholder="Offer Start Date"
                                name="offerstartdate"
                                onChange={EditFoodhandleChange}
                              />
                            </div>
                            <div className="mb-4 flex gap-x-5 justify-center items-center">
                              <label
                                className="block text-nowrap text-gray-700 w-[200px] font-semibold mb-2"
                                htmlFor="offerEndDate"
                              >
                                Offer End Date
                              </label>
                              <input
                                className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="offerEndDate"
                                type="date"
                                value={editModalData.offerenddate}
                                placeholder="Offer End Date"
                                name="offerenddate"
                                onChange={EditFoodhandleChange}
                              />
                            </div>
                          </div>
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2  text-sm font-medium text-gray-700">
                        Special
                      </label>
                      <input
                        type="checkbox"
                        name="special"
                        value={isChecked1}
                        checked={isChecked1}
                        onChange={handleCheckboxChange1}
                        className="size-5 custom-checkbox"
                      />
                    </div>
                    <div>
                      <label className="block mb-2  text-sm font-medium text-gray-700">
                        Custom Quantity
                      </label>
                      <input
                        type="checkbox"
                        name="customQuantity"
                        value={isChecked2}
                        checked={isChecked2}
                        onChange={handleCheckboxChange2}
                        className="size-5 custom-checkbox"
                      />
                    </div>
                  </div>

                  <div className=" mb-2  mt-5">
                    <label
                      className="block mb-2  text-sm font-medium text-gray-700"
                      htmlFor=""
                    >
                      Menu Type
                    </label>
                    <select
                      className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="parentCategory"
                      value={editModalData.menutype}
                      name="menuid"
                      onChange={EditFoodhandleChange}
                    >
                      <option value="">Select option</option>
                      {menuData.map((val, index) => (
                        <option key={index} value={val.menutypeid}>
                          {val.menutype}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className=" mb-2  mt-5">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={editModalData.ProductsIsActive}
                      name="ProductsIsActive"
                      onChange={EditFoodhandleChange}
                      className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      {" "}
                      {/* <option value=""> Select Option</option> */}
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Right Form */}

                <div className="">
                  <div className="">
                    <label
                      className="block text-sm mb-2 font-medium text-gray-700"
                      htmlFor=""
                    >
                      Kitchen
                    </label>
                    <select
                      className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="parentCategory"
                      value={editModalData.kitchenid}
                      name="kitchenid"
                      onChange={EditFoodhandleChange}
                    >
                      <option value="">Select option</option>
                      {kitchenData.map((val, index) => (
                        <option key={index} value={val.kitchenid}>
                          {val.kitchen_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Add-ons */}
                  <div className="border-[1px] border-[#4CBBA1] mt-5 rounded-sm">
                    <div
                      onClick={toggleExpand1}
                      className="relative p-2 h-[80px] text-base text-black"
                    >
                      <div className="flex justify-between pt-3">
                        <h1>Add on</h1>
                        <IoIosArrowDown
                          onClick={toggleExpand1}
                          className={`cursor-pointer text-[#000000] ${
                            isExpanded1 ? "rotate-180" : ""
                          } border-[1px] bg-white rounded-full text-xl transition-transform`}
                        />
                      </div>
                    </div>

                    {isExpanded1 && (
                      <div className="h-[150px] overflow-y-scroll">
                        {AddonsData.length > 0 &&
                          AddonsData.map((val, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center mt-5 px-2"
                            >
                              <div>
                                <h1>{val.add_on_name}</h1>
                                <p>Price: {val.price}</p>
                              </div>
                              <div>
                                <div className="flex justify-center gap-x-4 font-bold">
                                  <input
                                    type="checkbox"
                                    name="addons"
                                    value={val.add_on_id}
                                    id={`offer-${index}`}
                                    checked={allAddonsData.includes(
                                      val.add_on_id
                                    )}
                                    onChange={handleaddonchange}
                                    className="size-5 custom-checkbox"
                                    // checked={addonsData.add_on_id.includes(val.add_on_id)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Add Variant */}
                  <div className="border-[1px] border-[#4CBBA1] mt-5 rounded-sm">
                    <div
                      onClick={toggleExpand2}
                      className="relative p-2 h-[80px] text-base text-black"
                    >
                      <div className="flex justify-between pt-3">
                        <h1>Variants</h1>
                        <IoIosArrowDown
                          onClick={toggleExpand2}
                          className={`cursor-pointer text-[#000000] ${
                            isExpanded2 ? "rotate-180" : ""
                          } border-[1px] bg-white rounded-full text-xl transition-transform`}
                        />
                      </div>
                    </div>

                    {isExpanded2 && (
                      <div className=" h-[150px]  overflow-y-scroll">
                        {variantData.map((val, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center mt-5 px-2 "
                          >
                            <div>
                              <h1>Variant Name :-{val.variantName}</h1>
                              <p> Price :-{val.price}</p>
                            </div>
                            <div>
                              <div className="flex justify-center gap-x-4 font-bold">
                                <Tooltip message={"Delete"}>
                                  <button
                                    onClick={() => removeProduct(val)}
                                    type="button"
                                    className="bg-[#FB3F3F] p-1 rounded-sm text-white hover:scale-105"
                                  >
                                    <FaRegTrashCan />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setVariantModal(true);
                            }}
                            className="h-[32px] w-[125px] text-white bg-[#4CBBA1] rounded-sm mt-3 mb-5"
                          >
                            Add Variant
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className=" mb-2  mt-5">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="descrip"
                      value={editModalData.descrip}
                      onChange={EditFoodhandleChange}
                      className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Button */}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={submitUpdateFood}
                  className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </FoodEditDialogBox>
      </div>

      {/* Add Variant Modal*/}

      <DialogBoxSmall
        title={"Add Variants"}
        onClose={() => {
          setVariantModal(false);
        }}
        isOpen={variantModal}
      >
        <div className="p-10">
          <form>
            <div className="mb-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Variant Name
              </label>
              <input
                type="text"
                name="variantName"
                className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={variantFormData.variantName}
                onChange={handleChangeVariant}
              />
            </div>
            <div className="mb-2 mt-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={variantFormData.price}
                onChange={handleChangeVariant}
              />
            </div>
            <div className="flex justify-start space-x-4 mt-5">
              <button
                onClick={() => {
                  setVariantModal(false);
                }}
                type="button"
                className="px-4 py-2 bg-[#1C1D3E] text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  variantFormSubmit(variantFormData);
                  setVariantModal(false);
                  setVariantFormdata("");
                }}
                type="button"
                className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </DialogBoxSmall>
    </>
  );
};

export default AddFood;
