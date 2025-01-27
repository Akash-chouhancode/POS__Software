import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { toast } from "react-toastify";
import { IoMdNotifications } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";

import axios from "axios";
import Designation from "./Designation";
import HasPermission from "../../store/HasPermission";
import useFullScreen from "../../components/useFullScreen";
const AddEmpolye = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const [isOpen, setOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [division, setDivision] = useState([]);
  const [dutyType, setDutyType] = useState([]);
  const [position, setPosition] = useState([]);
  const [payfrequency, setPayfrequency] = useState([]);
  const [rateType, setRateType] = useState([]);
  const [mstatus, setMstatus] = useState([]);
  const [gendar, setGendar] = useState([]);
  // country
  const [countries, setCountries] = useState([]);
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  

  const getCountry=()=>{
    axios.get(`${API_BASE_URL}/countries`)
    .then((res)=>{
     setCountries(res.data.data)
    })
    .catch((error)=>{
      console.log(error)

    })
  }









  // full screen

  const handleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  // get division
  const getallDivision = async () => {
    await axios
      .get(`${API_BASE_URL}/division`)
      .then((res) => {
        setDivision(res.data.data);
        console.log("data recive hua", division);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // duty type
  const getDutyType = async () => {
    await axios
      .get(`${API_BASE_URL}/dutytype`)
      .then((res) => {
        setDutyType(res.data.data);
        console.log("data recive  duty ak", dutyType);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // get all designations
  const getPositions = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/designation`);
      console.log(res.data);
      setPosition(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  // get Pay frequency
  const getPayFrequency = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/frequencytype`);
      console.log(res.data);
      setPayfrequency(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // get rate type

  const getrateType = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/ratetype`);
      console.log(res.data);
      setRateType(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  // mstatus
  const getMstatus = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/mstatus`);
      console.log(res.data);
      setMstatus(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getGender = async () => {
    try {
      let res = await axios.get(`${API_BASE_URL}/gender`);
      console.log(res.data);
      setGendar(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  // post data
  // File

  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    gender: "",
    dob: "",
    marital_status: "",
    picture: null,
    division_id: "",
    pos_id: "", // designation id
    duty_type: "",
    voluntary_termination: "",
    home_email: "",
    home_phone: "",
    emerg_contct: "",
    emrg_w_phone: "",
    termination_reason: "",
    hire_date: "",
    original_hire_date: "",
    termination_date: "",
    rehire_date: "",
    rate_type: "",
    rate: "",
    pay_frequency: "",
    pay_frequency_txt: "",
    password: "",
  };
  const [formdata, setFormdata] = useState(initialFormData);

  // Handle image file input
  const handleImageChange = (e) => {
    setFormdata({
      ...formdata,
      picture: e.target.files[0], // Set the image file in formData
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata({
      ...formdata,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data to be sent:", formdata);

    // Create a FormData object
    const formDataToSend = new FormData();

    // Validation function to check if fields are empty
    const validateFields = (fields) => {
      for (const field of fields) {
        if (!formdata[field]) {
          toast.error(`${field.replace(/_/g, " ")} is required.`);
          return false;
        }
      }
      return true;
    };

    // Fields to validate
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "gender",
      "dob",
      "pos_id",
      "duty_type",
      "hire_date",
      "password",
    ];

    // Validate required fields
    if (!validateFields(requiredFields)) {
      return; // Stop submission if validation fails
    }

    // Append each property from formdata to formDataToSend
    formDataToSend.append("first_name", formdata.first_name);
    formDataToSend.append("last_name", formdata.last_name);
    formDataToSend.append("email", formdata.email);
    formDataToSend.append("phone", formdata.phone);
    formDataToSend.append("zip", formdata.zip);
    formDataToSend.append("state", formdata.state);
    formDataToSend.append("country", formdata.country);
    formDataToSend.append("city", formdata.city);
    formDataToSend.append("gender", formdata.gender);
    formDataToSend.append("dob", formdata.dob);
    formDataToSend.append("marital_status", formdata.marital_status);
    formDataToSend.append("picture", formdata.picture);
    formDataToSend.append("division_id", formdata.division_id);
    formDataToSend.append("pos_id", formdata.pos_id);
    formDataToSend.append("duty_type", formdata.duty_type);
    formDataToSend.append(
      "voluntary_termination",
      formdata.voluntary_termination
    );
    formDataToSend.append("home_email", formdata.home_email);
    formDataToSend.append("home_phone", formdata.home_phone);
    formDataToSend.append("emerg_contct", formdata.emerg_contct);
    formDataToSend.append("emrg_w_phone", formdata.emrg_w_phone);
    formDataToSend.append("termination_reason", formdata.termination_reason);
    formDataToSend.append("hire_date", formdata.hire_date);
    formDataToSend.append("original_hire_date", formdata.original_hire_date);
    formDataToSend.append("termination_date", formdata.termination_date);
    formDataToSend.append("rehire_date", formdata.rehire_date);
    formDataToSend.append("rate_type", formdata.rate_type);
    formDataToSend.append("rate", formdata.rate);
    formDataToSend.append("pay_frequency", formdata.pay_frequency);
    formDataToSend.append("pay_frequency_txt", formdata.pay_frequency_txt);
    formDataToSend.append("password", formdata.password);

    // Send POST request to create a new employee
    axios
      .post(`${API_BASE_URL}/createemployee`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        toast.success("Employee added successfully.");
        setFormdata({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          zip: "",
          gender: "",
          dob: "",
          marital_status: "",
          picture: null,
          division_id: "",
          pos_id: "",
          duty_type: "",
          voluntary_termination: "",
          home_email: "",
          home_phone: "",
          emerg_contct: "",
          emrg_w_phone: "",
          termination_reason: "",
          hire_date: "",
          original_hire_date: "",
          termination_date: "",
          rehire_date: "",
          rate_type: "",
          rate: "",
          pay_frequency: "",
          pay_frequency_txt: "",
          password: "",
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("Something went wrong.");
      });
  };

  useEffect(() => {
    getallDivision();
    getDutyType();
    getPositions();
    getPayFrequency();
    getrateType();
    getMstatus();
    getGender();
    getCountry()
  }, []);

  return (
    <>
      <>
        <div className="main_div ">
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
                  Add Employee
                </h1>

                <div className="notification flex gap-x-5 ">
                  <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                  <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                  <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />

                  <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />

                </div>
              </div>

              {/* Search Bar */}

              <div className=" w-full border-[#4CBBA1] border-[1px] p-2 mt-11">
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">
                      Employee Information - Step 1
                    </h2>
                    <form>
                      {/* Persional information */}
                      <div className="info1 flex items-center justify-between mt-9">
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            First Name*
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.first_name}
                            name="first_name"
                            type="text"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Last Name*
                          </label>
                          <input
                            name="last_name"
                            onChange={handleChange}
                            value={formdata.last_name}
                            type="text"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Email*
                          </label>
                          <input
                            name="email"
                            onChange={handleChange}
                            value={formdata.email}
                            type="email"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Phone*
                          </label>
                          <input
                            name="phone"
                            onChange={handleChange}
                            value={formdata.phone}
                            type="number"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div className="country flex justify-between items-center mt-8">
                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Country*
                          </label>
                          <select
                            className="shadow   border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            name="country"
                            onChange={handleChange}
                          >
                            <option value="">Select Country</option>
                            {countries.map((country) => (
                              <option key={country.id} value={country.countryName}>
                                {country.countryName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            State*
                          </label>
                          <input
                            name="state"
                            onChange={handleChange}
                            value={formdata.state}
                            placeholder="state"
                          
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>

                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            City*
                          </label>
                          <input
                            name="city"
                            onChange={handleChange}
                            value={formdata.city}
                            placeholder="city"
                           
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>

                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Zip Code*
                          </label>
                          <input
                            name="zip"
                            onChange={handleChange}
                            value={formdata.zip}
                            placeholder="Zip Code"
                            type="number"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                      </div>
                      {/* Division 1*/}

                      <div className="country flex justify-between items-center mt-9">
                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Division*
                          </label>
                          <select
                            value={formdata.division_id}
                            onChange={handleChange}
                            name="division_id"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {division.map((val) => (
                              <option key={val.dept_id} value={val.division_id}>
                                {val.division_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Designation*
                          </label>
                          <select
                            value={formdata.pos_id}
                            onChange={handleChange}
                            name="pos_id"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {position.map((val) => (
                              <option key={val.pos_id} value={val.pos_id}>
                                {val.position_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Duty Type*
                          </label>
                          <select
                            onChange={handleChange}
                            name="duty_type"
                            value={formdata.duty_type}
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {dutyType.map((val) => (
                              <option key={val.id} value={val.id}>
                                {val.type_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Voluntary Termination
                          </label>
                          <select
                            value={formdata.voluntary_termination}
                            onChange={handleChange}
                            name="voluntary_termination"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>

                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>

                      {/* Persional information */}
                      <div className="info1 flex items-center justify-between mt-9">
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            DOB*
                          </label>
                          <input
                            name="dob"
                            value={formdata.dob}
                            onChange={handleChange}
                            type="date"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Gender*
                          </label>
                          <select
                            onChange={handleChange}
                            name="gender"
                            value={formdata.gender}
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {gendar.map((val) => (
                              <option key={val.id} value={val.id}>
                                {val.gender_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Marital Status*
                          </label>
                          <select
                            onChange={handleChange}
                            name="marital_status"
                            value={formdata.marital_status}
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {mstatus.map((val) => (
                              <option key={val.id} value={val.id}>
                                {val.marital_sta}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Photo*
                          </label>
                          <input
                            name="picture"
                            type="file"
                            onChange={handleImageChange}
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                      </div>

                      {/* Persional information 2 */}
                      <div className="info1 flex items-center justify-between mt-9">
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Home Email
                          </label>
                          <input
                            onChange={handleChange}
                            name="home_email"
                            value={formdata.home_email}
                            type="email"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Home Phone
                          </label>
                          <input
                            value={formdata.home_phone}
                            onChange={handleChange}
                            name="home_phone"
                            type="number"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Emergency Contact*
                          </label>
                          <input
                            value={formdata.emerg_contct}
                            onChange={handleChange}
                            name="emerg_contct"
                            type="number"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Emergency Work Phone *
                          </label>
                          <input
                            onChange={handleChange}
                            name="emrg_w_phone"
                            value={formdata.emrg_w_phone}
                            type="number"
                            className="shadow w-[250px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                      </div>

                      <div className=" mt-5">
                        <label className="block mb-2  font-semibold text-xl text-gray-700">
                          Termination Reason
                        </label>
                        <textarea
                          className="shadow w-full h-[100px] border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          name="termination_reason"
                          value={formdata.termination_reason}
                          onChange={handleChange}
                          id=""
                          rows={5}
                          cols={10}
                        ></textarea>
                      </div>
                      <div className=" flex justify-between">
                        <span></span>
                        <button
                          type="button"
                          onClick={nextStep}
                          className="bg-blue-500 text-white mt-11  mb-3 px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Next
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">
                      Employe Information - Step 2
                    </h2>
                    <form>
                      {/*  division 2*/}

                      <div className="country flex justify-between items-center mt-9">
                        <div>
                          <label
                            className=" block mb-2  text-sm font-medium text-gray-700"
                            htmlFor="categoryName"
                          >
                            Hire Date *
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.hire_date}
                            name="hire_date"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="date"
                          />
                        </div>

                        <div>
                          <label
                            className=" block mb-2  text-sm font-medium text-gray-700"
                            htmlFor="categoryName"
                          >
                            Original Hire Date *
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.original_hire_date}
                            name="original_hire_date"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="date"
                          />
                        </div>

                        <div>
                          <label
                            className=" block mb-2  text-sm font-medium text-gray-700"
                            htmlFor="categoryName"
                          >
                            Termination Date*
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.termination_date}
                            name="termination_date"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="date"
                          />
                        </div>

                        <div>
                          <label
                            className=" block mb-2  text-sm font-medium text-gray-700"
                            htmlFor="categoryName"
                          >
                            Re Hire Date*
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.rehire_date}
                            name="rehire_date"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="date"
                          />
                        </div>
                      </div>

                      {/* division 3 */}

                      <div className="country flex justify-between items-center mt-9">
                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Rate Type*
                          </label>
                          <select
                            onChange={handleChange}
                            value={formdata.rate_type}
                            name="rate_type"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {rateType.map((val) => (
                              <option key={val.id} value={val.id}>
                                {val.r_type_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Rate*
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.rate}
                            name="rate"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="number"
                          />
                        </div>

                        <div>
                          <label className="block mb-2  text-sm font-medium text-gray-700">
                            Pay Frequency *
                          </label>

                          <select
                            onChange={handleChange}
                            value={formdata.pay_frequency}
                            name="pay_frequency"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="">Select</option>
                            {payfrequency.map((val) => (
                              <option key={val.id} value={val.id}>
                                {val.frequency_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className=" block mb-2  text-sm font-medium text-gray-700">
                            Pay Frequency Text
                          </label>
                          <input
                            onChange={handleChange}
                            value={formdata.pay_frequency_txt}
                            name="pay_frequency_txt"
                            className="shadow border border-[#4CBBA1] rounded w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                          />
                        </div>
                      </div>

                      {/* divsion 4 */}

                      <div className=" w-full mb-11">
                        <h1 className=" text-center font-semibold text-xl mb-4">
                          Register{" "}
                        </h1>

                        <div className=" flex  justify-between gap-x-11 ">
                          <div className="w-full">
                            <label
                              className=" block mb-2  text-center text-sm font-medium text-gray-700"
                              htmlFor="categoryName"
                            >
                              Email*
                            </label>
                            <input
                              name="email"
                              onChange={handleChange}
                              value={formdata.email}
                              className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              type="text"
                            />
                          </div>

                          <div className=" w-full">
                            <label
                              className=" block mb-2  text-center text-sm font-medium text-gray-700"
                              htmlFor="categoryName"
                            >
                              Password*
                            </label>
                            <input
                              onChange={handleChange}
                              value={formdata.password}
                              name="password"
                              className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              type="password"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={prevStep}
                        className="bg-gray-500 mb-10 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      <HasPermission module="Add Employee" action="create">
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="bg-green-500 mb-10 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Submit
                      </button>
                      </HasPermission>
                     
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </>
    </>
  );
};

export default AddEmpolye;
