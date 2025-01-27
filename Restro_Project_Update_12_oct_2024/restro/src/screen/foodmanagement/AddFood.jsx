
import React, { useEffect, useState,useContext } from "react";
import Select from "react-select";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoMdCart, IoIosMan, IoIosArrowDown } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import CategoryDialogBox from "../../components/CategoryDialogBox";
import { AuthContext } from "../../store/AuthContext";
import axios from "axios";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import { toast } from "react-toastify";
import HasPermission from "../../store/HasPermission";
import useFullScreen from "../../components/useFullScreen";


const Tooltip = ({ message, children }) => {
  return (
    <div className="group relative flex">
      {children}
      <span className="absolute  bottom-5  right-4 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
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
  const [variantModal, setVariantModal] = useState(false);
  const [AddCategoryModal, setAddCategoryModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded1, setIsExpanded1] = useState(false);
  const [categoryData, setcategoryData] = useState([]);
  const [kitchenData, setKitchenData] = useState([]);
  const [AddonsData, setAddonsData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [variantData, setVariantData] = useState([]);
  const [allAddonsData, setAllAddonsData] = useState([]);
  const [variantFormData, setVariantFormdata] = useState([]);
  const [itemImage, setItemImage] = useState(null);
  const [data, setData] = useState([]);
  const { token } = useContext(AuthContext);
  const initialFormData = {
    name: "",
    parentid: "",
    offerstartdate: "",
    offerendate: "",
    status: "",
  };
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [formdata, setFormdata] = useState(initialFormData);
  const [isChecked3, setIsChecked3] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    CategoryID: "",
    kitchenid: "",
    ProductName: "",
    descrp: "",
    ProductImage: "",
    productvat: 0,
    special: "",
    isoffer: "",
    offerstartdate: "",
    offerenddate: "",
    is_custom_quantity: "",
    status: 1,
    menuid: "",
    variant: [],
    addon: [],
  });

  const handleSubmit1 = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formdata.name);
    data.append("parentid", formdata.parentid);
    data.append("offerstartdate", formdata.offerstartdate);
    data.append("offerendate", formdata.offerendate);
    data.append("status", formdata.status);
    data.append("image", file);
    data.append("isoffer", isChecked);

    axios
      .post(`${API_BASE_URL}/data`, data,{headers:{"Authorization":token}})
      .then((res) => {
        console.log("Data sent successfully");

        setFormdata(initialFormData);
        setFile(null);
        setIsChecked(false);
      })
      .catch((err) => console.log(err));
  };
  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCheckboxChange3 = (e) => {
    setIsChecked3((e.target.checked = 1));
  };

  const handleChange1 = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const toggleExpand2 = () => {
    setIsExpanded2(!isExpanded2);
  };
  const toggleExpand1 = () => {
    setIsExpanded1(!isExpanded1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange1 = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };
  const handleCheckboxChange1 = (e) => {
    setIsChecked1(e.target.checked);
  };
  const handleCheckboxChange2 = (e) => {
    setIsChecked2(e.target.checked);
  };

  const handleChangeVariant = (e) => {
    setVariantFormdata({ ...variantFormData, [e.target.name]: e.target.value });
  };

  const handleaddonchange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAllAddonsData((prevData) => [...prevData, value]);
    } else {
      setAllAddonsData((prevData) =>
        prevData.filter((addon) => addon !== value)
      );
    }
  };



  


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

  // get category data for add food
  const getCategoryData = () => {
    axios
      .get(`${API_BASE_URL}/data`)
      .then((res) => {
        setcategoryData(res.data);
        console.log(res.data); // Ensure API response structure matches your expectations
      })
      .catch((error) => console.error(error));
  };
  // get menu type data
  const getmenuData = () => {
    axios
      .get(`${API_BASE_URL}/menutype`)
      .then((res) => {
        setMenuData(res.data.data);
      })
      .catch((error) => console.error(error));
  };
  // get Add on data
  const getActiveAddOns = () => {
    axios.get(`${API_BASE_URL}/getActiveAddOns`).then((res) => {
      console.log(res.data);
      setAddonsData(res.data);
    });
  };
  // get Kitchen data
  const getkitchenData = () => {
    axios.get(`${API_BASE_URL}/getkitchen`).then((res) => {
      console.log(res.data);
      setKitchenData(res.data);
    });
  };

  // get Category data for add categeory
  const getData = () => {
    axios
      .get(`${API_BASE_URL}/data`)
      .then((res) => {
        setData(res.data);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Validation for required fields
    if (!formData.CategoryID) {
      toast.error("Category is required");
      return;
    }
    if (!formData.kitchenid) {
      toast.error("Kitchen  is required");
      return;
    }
    if (!formData.ProductName) {
      toast.error("Food Name is required");
      return;
    }
   
    if (!formData.menuid) {
      toast.error("Menu Type is required");
      return;
    }
  
    
    if(!formData.variant){
      toast.error("Product variant is required");
      return;
    }
  
    // All required fields are valid, proceed with submission
    const itemdata = new FormData();
    itemdata.append("CategoryID", formData.CategoryID);
    itemdata.append("kitchenid", formData.kitchenid);
    itemdata.append("ProductName", formData.ProductName);
    itemdata.append("productvat", formData.productvat);
    itemdata.append("descrp", formData.descrp);
    itemdata.append("isoffer", isChecked);
    itemdata.append("special", isChecked1);
    itemdata.append("is_custom_quantity", isChecked2);
    itemdata.append("variant", JSON.stringify(variantData));
    itemdata.append("addons", JSON.stringify(allAddonsData));
    itemdata.append("menuid", formData.menuid);
    itemdata.append("status", formData.status);
    itemdata.append("offerstartdate", formData.offerstartdate);
    itemdata.append("offerenddate", formData.offerenddate);
    itemdata.append("ProductImage", itemImage);
  
    // Submit form data
    axios
      .post(`${API_BASE_URL}/itemfood`, itemdata,{headers:{"Authorization":token}})
      .then((res) => {
        console.log(res.data);
  
        // Reset the form state to initial values
        setFormData({
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
          status: "",
          menuid: "",
          variant: [],
          addon: [],
        });
  
        // Reset other states
        setItemImage(null);
        setIsChecked(false);
        setIsChecked1(false);
        setIsChecked2(false);
        setIsExpanded1(false);
        setVariantData([]);
        setAllAddonsData([]); // Reset addons state
        
        toast.success("Food and Variant added successfully.");
      })
      .catch((error) => console.error(error));
  };
  
  useEffect(() => {
    getCategoryData();
    getmenuData();
    getkitchenData();
    getData();
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
                Add Food
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
                {/* <button
                  onClick={() => {
                    setAddFoodModal(true);
                  }}
                  className=" bg-[#4CBBA1] h-[46px] w-[107px] rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
                >
                  <IoIosAddCircleOutline className=" font-semibold text-lg" />
                  New
                </button> */}
<HasPermission  module="Add Food" action="create">
<button
                  onClick={() => {
                    setAddCategoryModal(true);
                  }}
                  className=" bg-[#4CBBA1] h-[46px] w-[124px] rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
                >
                  <IoIosAddCircleOutline className=" font-semibold text-lg" />
                  Category
                </button>

</HasPermission>
                
              </div>
            </div>
            {/* Add Food Section*/}
            <div className="form ">
              <div className="">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* main div */}
                  <div className=" grid grid-flow-col gap-x-10">
                    {/* Left form */}
                    <div className="">
                      <div className="">
                        <label
                          className="block text-sm mb-2 font-medium text-gray-700"
                          htmlFor=""
                        >
                          Category*
                        </label>
                        <select
                          className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="parentCategory"
                          name="CategoryID"
                          value={formData.CategoryID}
                          onChange={handleChange}
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
                          Food Name*
                        </label>
                        <input
                          type="text"
                          name="ProductName"
                          placeholder="Food Name"
                          value={formData.ProductName}
                          onChange={handleChange}
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
                          value={formData.productvat}
                          onChange={handleChange}
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
                                    type="date"
                                    placeholder="Offer Start Date"
                                    name="offerstartdate"
                                    value={formData.offerstartdate}
                                    onChange={handleChange}
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
                                    placeholder="Offer End Date"
                                    name="offerenddate"
                                    value={formData.offerenddate}
                                    onChange={handleChange}
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
                            value={isChecked1}
                            type="checkbox"
                            name="special"
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
                            value={isChecked2}
                            type="checkbox"
                            name="customQuantity"
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
                          Menu Type*
                        </label>
                        <select
                          className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="parentCategory"
                          name="menuid"
                          value={formData.menuid}
                          onChange={handleChange}
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
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          {" "}
                        
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
                          Kitchen*
                        </label>
                        <select
                          className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="parentCategory"
                          name="kitchenid"
                          value={formData.kitchenid}
                          onChange={handleChange}
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
                          <div className="flex justify-between pt-3 ">
                            <h1>Addons</h1>
                            <IoIosArrowDown
                              onClick={toggleExpand1}
                              className={`cursor-pointer text-[#000000] ${
                                isExpanded1 ? "rotate-180" : ""
                              } border-[1px] bg-white rounded-full text-xl transition-transform`}
                            />
                          </div>
                        </div>

                        {isExpanded1 && (
                          <div className=" h-[150px]  overflow-y-scroll">
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
                                       
                                        onChange={handleaddonchange}
                                        id={`offer-${index}`}
                                        className="size-5 custom-checkbox"
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
                            <h1>Variants*</h1>
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
                          name="descrp"
                          value={formData.descrp}
                          onChange={handleChange}
                          className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Button */}

                  <div className="flex justify-end space-x-4">
                    <HasPermission module="Add Food" action="create">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    </HasPermission>
                   
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
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
      {/* Category Dialog Box */}

      <CategoryDialogBox
        title={"Add  New Category"}
        isOpen={AddCategoryModal}
        onClose={() => {
          setAddCategoryModal(false);
        }}
      >
        <div className=" p-10">
          <form
            onSubmit={handleSubmit1}
            className="bg-white rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="flex justify-between gap-x-10">
              <div className="category">
                <div className="mb-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-nowrap text-gray-700 font-semibold mb-2"
                    htmlFor="categoryName"
                  >
                    Category Name
                  </label>
                  <input
                    className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="categoryName"
                    type="text"
                    name="name"
                    placeholder="Enter Category Name"
                    value={formdata.name}
                    onChange={handleChange1}
                  />
                </div>

                <div className="mb-4 flex gap-x-5 justify-center items-center">
                  <label
                    className="block text-nowrap text-gray-700 font-semibold mb-2"
                    htmlFor="parentCategory"
                  >
                    Parent Category
                  </label>
                  <select
                    className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="parentCategory"
                    name="parentid"
                    value={formdata.parentid}
                    onChange={handleChange1}
                  >
                    <option value="">Select option</option>
                    {Array.isArray(data) && data.length > 0 ? (
  data.map((category, index) => (
    <option key={index} value={category.CategoryID}>
      {category.Name}
    </option>
  ))
) : (
  <option value="">No categories found</option>
)}
                  </select>
                </div>
                <div className="mb-4 flex gap-x-24 justify-between items-center">
                  <label
                    className="block text-nowrap text-gray-700 font-semibold mb-2"
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
              </div>

              <div className="offer_category">
                <div className="mb-6">
                  <div className="flex gap-2">
                    <label
                      className="text-nowrap font-semibold text-gray-700 w-[130px]"
                      htmlFor="offer"
                    >
                      Offer
                    </label>

                    <input
                      value={isChecked3}
                      checked={isChecked3}
                      type="checkbox"
                      name="isoffer"
                      id="offer"
                      onChange={handleCheckboxChange3}
                      className="size-5 custom-checkbox"
                    />
                  </div>
                </div>

                {isChecked3 && (
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
                          type="date"
                          placeholder="Offer Start Date"
                          name="offerstartdate"
                          value={formdata.offerstartdate}
                          onChange={handleChange1}
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
                          placeholder="Offer End Date"
                          name="offerendate"
                          value={formdata.offerendate}
                          onChange={handleChange1}
                        />
                      </div>
                    </div>
                  </span>
                )}

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
                    onChange={handleChange1}
                  >
                    <option value="">Select option</option>
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
            </div>
          </form>
        </div>
      </CategoryDialogBox>
    </>
  );
};

export default AddFood;