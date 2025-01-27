import React, { useState ,useEffect} from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import useFullScreen from "../../components/useFullScreen";
import HasPermission from "../../store/HasPermission";
const Add_user = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isOpen, setOpen] = useState(true);
  const initialFormData = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    about: "",
    status: 1,
    is_admin: 0,
    image: null, // This will hold the image file
  };

  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const [formData, setFormData] = useState(initialFormData);
  const [isChecked, setIsChecked] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image file input
  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0], // Set the image file in formData
    });
  };

  // Handle checkbox for is_admin
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    setFormData({
      ...formData,
      is_admin: e.target.checked ? 1 : 0, // Update is_admin based on checkbox
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData(initialFormData);
    setIsChecked(false);
  };

  // Submit form data to the API
  // const SubmitData = async () => {
  //   // Validate form data
  //   if (!formData.firstname) {
  //     toast.error("First name is required.");
  //     return;
  //   }
  //   if (!formData.lastname) {
  //     toast.error("Last name is required.");
  //     return;
  //   }
  //   if (!formData.email) {
  //     toast.error("Email is required.");
  //     return;
  //   }
  //   if (!formData.password) {
  //     toast.error("Password is required.");
  //     return;
  //   }
  //   if (!formData.about) {
  //     toast.error("About field is required.");
  //     return;
  //   }
  //   if (!formData.status) {
  //     toast.error("Status is required.");
  //     return;
  //   }

  //   const data = new FormData();
  //   data.append("firstname", formData.firstname);
  //   data.append("lastname", formData.lastname);
  //   data.append("email", formData.email);
  //   data.append("password", formData.password);
  //   data.append("about", formData.about);
  //   data.append("status", formData.status);
  //   data.append("is_admin", formData.is_admin);
  //   if (formData.image) {
  //     data.append("image", formData.image); // Append the image file if available
  //   }

  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/add`, data, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     if (response.status === 200) {
  //       toast.success("User added successfully!");
  //       resetForm(); // Reset the form on successful submission
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //     toast.error( error.response?.data?.error || "Add to faild user.");
  //   }
  // };

  const SubmitData = async () => {
    // Validate form data
    if (!formData.firstname) {
      toast.error("First name is required.");
      return;
    }
    if (!formData.lastname) {
      toast.error("Last name is required.");
      return;
    }
    if (!formData.email) {
      toast.error("Email is required.");
      return;
    }
    if (!formData.password) {
      toast.error("Password is required.");
      return;
    }
    if (!formData.about) {
      toast.error("About field is required.");
      return;
    }
    if (!formData.status) {
      toast.error("Status is required.");
      return;
    }
  
    const data = new FormData();
    data.append("firstname", formData.firstname);
    data.append("lastname", formData.lastname);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("about", formData.about);
    data.append("status", formData.status);
    data.append("is_admin", formData.is_admin);
    if (formData.image) {
      data.append("image", formData.image); // Append the image file if available
    }
  
    if (!navigator.onLine) {
      // Save data locally if offline
      const offlineData = JSON.parse(localStorage.getItem("offlineData")) || [];
      const newEntry = {
        id: Date.now(), // Unique ID for this entry
        formData: {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          about: formData.about,
          status: formData.status,
          is_admin: formData.is_admin,
        },
        image: formData.image || null,
      };
      offlineData.push(newEntry);
      localStorage.setItem("offlineData", JSON.stringify(offlineData));
      toast.success("You are offline. Data has been saved locally.");
      resetForm();
      return;
    }
  
    // Submit data online
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        toast.success("User added successfully!");
        resetForm(); // Reset the form on successful submission
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "Failed to add user.");
    }
  };
  
  // Sync offline data to the server
  const syncDataToServer = async () => {
    const offlineData = JSON.parse(localStorage.getItem("offlineData")) || [];
    if (offlineData.length === 0) return;
  
    const remainingData = []; // To store unsynced data
    for (const item of offlineData) {
      const data = new FormData();
      Object.keys(item.formData).forEach((key) => {
        data.append(key, item.formData[key]);
      });
  
      if (item.image) {
        data.append("image", item.image);
      }
  
      try {
        const response = await axios.post(`${API_BASE_URL}/add`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (response.status === 200) {
          console.log("Offline data synced:", item);
        } else {
          console.error("Error syncing data:", response.data?.message || "Unknown error");
          remainingData.push(item); // Keep this data for retry
        }
      } catch (error) {
        console.error("Error syncing offline data:", error);
        remainingData.push(item); // Keep this data for retry
      }
    }
  
    // Update localStorage with unsynced data or remove if empty
    if (remainingData.length > 0) {
      localStorage.setItem("offlineData", JSON.stringify(remainingData));
    } else {
      localStorage.removeItem("offlineData");
      toast.success("All offline data synced successfully!");
    }
  };
  
  // Listen for online and offline events
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
  
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  // Reset form function
 
  
  

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
              <h1 className=" font-semibold mb-3">
                Add Users <br />
                <span>This Section is Use Only for Store Management</span>
              </h1>

              <div className="notification flex gap-x-5">
                <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
              <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>

            <div className="mt-28 border-[1px] border-[#4CBBA1] bg-white rounded-sm">
              <form>
                <div className="pt-11 pb-16 pr-24">
                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
                      htmlFor="firstname"
                    >
                      First Name*
                    </label>
                    <input
                      value={formData.firstname}
                      onChange={handleChange}
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
                      Last Name*
                    </label>
                    <input
                      value={formData.lastname}
                      onChange={handleChange}
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
                      Email Address*
                    </label>
                    <input
                      value={formData.email}
                      onChange={handleChange}
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
                      Password*
                    </label>
                    <input
                      value={formData.password}
                      onChange={handleChange}
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
                      Image*
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
                      Description*
                    </label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>
                  <div className="mb-11 flex gap-x-7">
                    <label
                      className="m-auto w-[300px] text-right text-nowrap text-gray-700 font-semibold mb-2"
                      htmlFor="status"
                    >
                      Status*
                    </label>
                    <select
                      className="shadow border border-[#4CBBA1] rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
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
                  <HasPermission module="Add User" action="create">
                    <div className="float-right flex ml-16 space-x-4">
                      <button
                        type="reset"
                        className="w-[104px] h-[42px] bg-[#4CBBA1] text-gray-50 rounded-md"
                        onClick={resetForm}
                      >
                        Reset
                      </button>

                      <button
                        type="button"
                        onClick={SubmitData}
                        className="w-[104px] h-[42px] bg-[#1C1D3E] text-white rounded-md"
                      >
                        Save
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

export default Add_user;
