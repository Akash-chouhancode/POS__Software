import React, { useEffect, useState ,useContext} from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import HasPermission from "../../store/HasPermission";
import { AuthContext } from "../../store/AuthContext";
import useFullScreen from "../../components/useFullScreen";
const AddCategory = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  // Initial form data state
  const initialFormData = {
    name: "",
    parentid: "",
    offerstartdate: "",
    offerendate: "",
    status: 1,
  };
  const { token } = useContext(AuthContext);
  // All get data
  const [data, setData] = useState([]);
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  // Nav bar
  const [isOpen, setOpen] = useState(true);

  // Form data
  const [formdata, setFormdata] = useState(initialFormData);

  // File
  const [file, setFile] = useState(null);
  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked((e.target.checked = 1));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!formdata.name) {
  //     toast.error("Category Name is required");
  //     return;
  //   }
  //   const data = new FormData();
  //   data.append("name", formdata.name);
  //   data.append("parentid", formdata.parentid);
  //   data.append("offerstartdate", formdata.offerstartdate);
  //   data.append("offerendate", formdata.offerendate);
  //   data.append("status", formdata.status);
  //   data.append("image", file);
  //   data.append("isoffer", isChecked);

  //   axios
  //     .post(`${API_BASE_URL}/data`, data,{headers:{"Authorization":token}})
  //     .then((res) => {
      
  //       // Reset the form data to initial state
  //       toast.success("Category  created successfully");

  //       setFormdata(initialFormData);
  //       setFile(null);
  //       setIsChecked(false);
  //     })
  //     .catch((err) => console.log(err));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formdata.name) {
      toast.error("Category Name is required");
      return;
    }

    const data = {
      name: formdata.name,
      parentid: formdata.parentid,
      offerstartdate: formdata.offerstartdate,
      offerendate: formdata.offerendate,
      status: formdata.status,
      image: file ? file.name : null,
      isoffer: isChecked,
    };

    if (!navigator.onLine) {
      // Save data to localStorage if offline
      const offlineData = JSON.parse(localStorage.getItem("offlineCategories")) || [];
      offlineData.push(data);
      localStorage.setItem("offlineCategories", JSON.stringify(offlineData));

      toast.info("You are offline. Data saved locally and will sync when online.");
      resetForm();
    } else {
      // Submit data to server if online
      try {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (key === "image" && file) {
            formData.append(key, file);
          } else {
            formData.append(key, data[key]);
          }
        });

        const response = await axios.post(`${API_BASE_URL}/data`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        });

        if (response.status === 200) {
          toast.success("Category created successfully!");
          resetForm();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(error.response?.data?.error || "Failed to create category.");
      }
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setFormdata(initialFormData);
    setFile(null);
    setIsChecked(false);
  };

  // Sync offline data to the server
  const syncDataToServer = async () => {
    const offlineData = JSON.parse(localStorage.getItem("offlineCategories")) || [];
    if (offlineData.length === 0) return;

    const remainingData = [];
    for (const item of offlineData) {
      const formData = new FormData();
      Object.keys(item).forEach((key) => {
        if (key === "image" && item.image) {
          formData.append(key, item.image);
        } else {
          formData.append(key, item[key]);
        }
      });

      try {
        const response = await axios.post(`${API_BASE_URL}/data`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        });

        if (response.status === 200) {
          console.log("Offline data synced successfully:", item);
        } else {
          console.error("Error syncing data:", response.data?.message || "Unknown error");
          remainingData.push(item);
        }
      } catch (error) {
        console.error("Error syncing offline data:", error);
        remainingData.push(item);
      }
    }

    // Update localStorage with unsynced data
    if (remainingData.length > 0) {
      localStorage.setItem("offlineCategories", JSON.stringify(remainingData));
    } else {
      localStorage.removeItem("offlineCategories");
      toast.success("All offline data synced successfully!");
    }
  };

  // Handle online and offline events
  useEffect(() => {
    const handleOnline = () => {
      toast.info("You are back online. Syncing offline data...");
      syncDataToServer();
    };

    const handleOffline = () => {
      toast.warning("You are offline. Changes will be synced when you're back online.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);














  
  // Function to sync offline data when back online
  // const syncOfflineData = () => {
  //   const offlineData = JSON.parse(localStorage.getItem("offlineCategories")) || [];
  //   if (offlineData.length > 0) {
  //     offlineData.forEach((item) => {
  //       const formData = new FormData();
  //       Object.keys(item).forEach((key) => {
  //         if (key === "image" && file) {
  //           formData.append(key, file); // Use stored file reference if available
  //         } else {
  //           formData.append(key, item[key]);
  //         }
  //       });
  
  //       axios
  //         .post(`${API_BASE_URL}/data`, formData, { headers: { Authorization: token } })
  //         .then((res) => {
  //           console.log("Offline data synced successfully");
  //           toast.success("Offline data synced successfully");
  
  //           // Remove synced data from offline storage
  //           const remainingData = offlineData.filter((d) => d !== item);
  //           localStorage.setItem("offlineCategories", JSON.stringify(remainingData));
  //         })
  //         .catch((err) => console.error("Failed to sync offline data", err));
  //     });
  //   }
  // };
  
  // Event listener for going back online
  // window.addEventListener("online", syncOfflineData);


  const handelchange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

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

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className="main_div ">
        <section className="side_section flex">
          <div className={`${isOpen === false ? "hidden" : ""}`}>
            <Nav />
          </div>
          <header className="">
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </header>
          <div className="contant_div w-full ml-4 pr-7 mt-4 ">
            <div className="activtab flex justify-between">
              <h1 className="flex items-center justify-center gap-1 font-semibold">
                Add Category
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>

            {/* Order data */}
            <div className="container mt-11 rounded mx-auto p-4 border-[1px] border-[#4CBBA1]">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded px-8 pt-6 pb-8 mb-4"
              >
                <div className="flex justify-between">
                  <div className="category">
                    <div className="mb-4 flex gap-x-5 justify-center items-center">
                      <label
                        className="block text-nowrap text-gray-700 font-semibold mb-2"
                        htmlFor="categoryName"
                      >
                        Category Name*
                      </label>
                      <input
                        className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="categoryName"
                        type="text"
                        name="name"
                        placeholder="Enter Category Name"
                        value={formdata.name}
                        onChange={handelchange}
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
                        onChange={handelchange}
                      >
                        <option value="">Select option</option>
                        {data.map((category, index) => (
                          <option key={index} value={category.CategoryID}>
                            {category.Name}
                          </option>
                        ))}
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
                          value={isChecked}
                          checked={isChecked}
                          type="checkbox"
                          name="isoffer"
                          id="offer"
                          onChange={handleCheckboxChange}
                          className="size-5 custom-checkbox"
                        />
                      </div>
                    </div>

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
                              value={formdata.offerstartdate}
                              onChange={handelchange}
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
                              onChange={handelchange}
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
                        Status*
                      </label>
                      <select
                        className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="status"
                        name="status"
                        value={formdata.status}
                        onChange={handelchange}
                      >
                      
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>

                    <div className="flex mt-4 float-right gap-x-3">
                      <HasPermission module="Add Category" action="delete"> <button
                        className="bg-[#4CBBA1] text-white w-[104px] h-[42px] rounded focus:outline-none focus:shadow-outline"
                        type="reset"
                      >
                        Reset
                      </button></HasPermission>
                     
                      <HasPermission module="Add Category" action="create"> <button
                        className="bg-[#1C1D3E] text-white w-[104px] h-[42px] rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                      >
                        Save
                      </button></HasPermission>
                     
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AddCategory;
