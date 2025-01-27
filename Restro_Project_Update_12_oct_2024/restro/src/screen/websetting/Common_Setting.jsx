import React, { useEffect, useState, useContext } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaMagnifyingGlass } from "react-icons/fa6";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";

import useFullScreen from "../../components/useFullScreen";
import { toast } from "react-toastify";
import { AuthContext } from "../../store/AuthContext";
import HasPermission from "../../store/HasPermission";

const Common_Setting = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  const [isOpen, setOpen] = useState(true);
  const { token } = useContext(AuthContext);
  const [dataa, setdataa] = useState([]);
  const { isFullScreen, toggleFullScreen } = useFullScreen();

  const [formData, setFormData] = useState({
    restro_name: "",
    email: "",
    phone: "",
    phone_optional: "",
    logo: null,
    logo_footer: null,
    fevicon: null,
    address: "",
    powerbytxt: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = new FormData();

    // Append form data to FormData object
    Object.keys(formData).forEach((key) => {
      postData.append(key, formData[key]);
    });
    console.log("Data post hona tha", postData);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/csetting/${2}`,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response:", response.data);
      toast.success("Update setting successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit the form.");
    }
  };

  const getCommonSetting = async (id) => {
    id = 2;
    try {
      const response = await axios.get(`${API_BASE_URL}/csetting/${id}`);
      const data = response.data.data;
      console.log(data);
      setFormData({
        restro_name: data.restro_name,
        email: data.email,
        phone: data.phone,
        phone_optional: data.phone_optional,
        logo: null,
        logo_footer: null,
        fevicon: null,
        address: data.address,
        powerbytxt: data.powerbytxt,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getallData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/websetting`);
      setdataa(res.data.data); // Update state with response data
      console.log("Data for image:", res.data); // Log the updated data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getCommonSetting();
    getallData();
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
                Web Setting
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap
                  onClick={toggleFullScreen}
                  className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl"
                />
              </div>
            </div>

            <div className="mt-28 border-[1px] border-[#4CBBA1] bg-white rounded-sm">
              <form onSubmit={handleSubmit}>
                <div className="pt-11 pb-16 pr-24">
                  <div className="mb-11 flex gap-x-7">
                    <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Restro Name
                    </label>
                    <input
                      value={formData.restro_name}
                      onChange={handleChange}
                      type="text"
                      name="restro_name"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-11 flex gap-x-7">
                    <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      name="email"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-11 flex gap-x-7">
                    <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Mobile Number
                    </label>
                    <input
                      value={formData.phone}
                      onChange={handleChange}
                      type="number"
                      maxLength={15}
                      name="phone"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-11 flex gap-x-7">
                    <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phone_optional"
                      value={formData.phone_optional}
                      onChange={handleChange}
                      type="numbar"
                      className="shadow border border-[#4CBBA1] w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className="mb-11 flex gap-x-2 ">
                    <div className="flex gap-x-7 ">
                      <label className="m-auto w-[230px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                        Logo
                        <h1 className=" text-xs">Select icon for change</h1>
                      </label>
                      <input
                        className="shadow  border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="image"
                        name="logo"
                        type="file"
                        onChange={handleChange}
                      />
                      <div>
                        {dataa.map((val, index) => {
                          return (
                            <img
                              src={`${VITE_IMG_URL}` + val.logo}
                              alt={"Image Logo"}
                              className="w-[200px] h-[100px] mx-auto  text-wrap text-sm"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mb-11 flex gap-x-2 ">
                    <div className="flex gap-x-7 ">
                      <label className="m-auto w-[230px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Footer Logo
                        <h1 className=" text-xs">Select icon for change</h1>
                      </label>
                      <input
                      className="shadow  border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="image"
                      name="logo_footer"
                      type="file"
                      onChange={handleChange}
                    />
                      <div>
                        {dataa.map((val, index) => {
                          return (
                            <img
                              src={`${VITE_IMG_URL}` + val.logo_footer}
                              alt={"Image Logo"}
                              className="w-[200px] h-[100px] mx-auto  text-wrap text-sm"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>


                  <div className="mb-11 flex gap-x-2 ">
                    <div className="flex gap-x-7 ">
                      <label className="m-auto w-[230px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Fav Icon
                        <h1 className=" text-xs"> Select (.svg,.icon,.png)icon for change</h1>
                      </label>
                      <input
                      className="shadow  border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="image"
                      name="fevicon"
                      type="file"
                      onChange={handleChange}
                    />
                      <div>
                        {dataa.map((val, index) => {
                          return (
                            <img
                              src={`${VITE_IMG_URL}` + val.fevicon}
                              alt={"Image Logo"}
                              className="w-[200px] h-[100px] mx-auto  text-wrap text-sm"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                
                  <div className="mb-11 flex gap-x-7">
                    <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={handleChange}
                      name="address"
                      className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>
                  <div className="mb-11 flex gap-x-7">
                    <label className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2">
                      Powered By Text
                    </label>
                    <textarea
                      value={formData.powerbytxt}
                      onChange={handleChange}
                      name="powerbytxt"
                      className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>

                  <HasPermission module="Add User" action="create">
                    <div className="float-right flex ml-16 space-x-4">
                      <button
                        type="reset"
                        className="w-[104px] h-[42px] bg-[#4CBBA1] text-gray-50 rounded-md"
                        onClick={() =>
                          setFormData({
                            restro_name: "",
                            email: "",
                            phone: "",
                            phone_optional: "",
                            logo: null,
                            logo_footer: null,
                            fevicon: null,
                            address: "",
                            powerbytxt: "",
                          })
                        }
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="w-[104px] h-[42px] bg-[#1C1D3E] text-white rounded-md"
                      >
                        Update
                      </button>
                    </div>
                  </HasPermission>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Common_Setting;
