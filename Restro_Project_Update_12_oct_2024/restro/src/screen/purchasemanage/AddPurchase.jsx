import React, { useEffect, useState,useContext } from "react";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { IoMdNotifications, IoIosAddCircleOutline } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { MdOutlineZoomOutMap } from "react-icons/md";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import { FaRegTrashCan } from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import { data } from "autoprefixer";
import useFullScreen from "../../components/useFullScreen"
import HasPermission from "../../store/HasPermission";
import { AuthContext } from "../../store/AuthContext";
const AddPurchase = () => {
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  //get supplier
  const [suppler, setSupplier] = useState([]);
  // paynment method
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(1);
  const handleMethodChange = (event) => {
    setSelectedMethod(Number(event.target.value));
  };
  //add supplier
  const [formData, setFormdata] = useState({
    supName: "",
    supEmail: "",
    supMobile: "",
    supAddress: "",
  });
  const [cModal, setCmodal] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState({
    invoiceid: '',
    paymenttype: selectedMethod,
    paid_amount: '',
    details: '',
    purchasedate: '',
    purchaseexpiredate: '',
    suplierID: '',
  });
  const { token } = useContext(AuthContext);

  // Handle form submission
  const handleSubmit = async () => {
    // Validation for required fields
    if (!purchaseDetails.invoiceid) {
      toast.error("Invoice ID is required");
      return;
    }
    if (!purchaseDetails.paymenttype) {
      toast.error("Payment type is required");
      return;
    }
    if (!purchaseDetails.paid_amount) {
      toast.error("Paid amount is required");
      return;
    }
    if (!purchaseDetails.details) {
      toast.error("Details are required");
      return;
    }
    if (!purchaseDetails.purchasedate) {
      toast.error("Purchase date is required");
      return;
    }
    if (!purchaseDetails.purchaseexpiredate) {
      toast.error("Expiration date is required");
      return;
    }
    if (!purchaseDetails.suplierID) {
      toast.error("Supplier ID is required");
      return;
    }
    if (items.length === 0 || items.some((item) => !item.item || !item.quantity || !item.rate)) {
      toast.error("All item details are required");
      return;
    }
  
    // Prepare data for API request if all validations pass
    const requestData = {
      purchasedetail: [
        {
          ...purchaseDetails,
          total_price: grandTotal,
        },
      ],
      itemdetails: items.map((item) => ({
        indredientid: item.item,
        quantity: item.quantity,
        price: item.rate,
      })),
    };
  
    try {
      const response = await fetch(`${API_BASE_URL}/addPurchaseItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           "Authorization":token
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      const data = await response.json();
      console.log('Success:', data);
      toast.success("Purchase added successfully!");
  
      // Reset form fields and state variables
      setPurchaseDetails({
        invoiceid: '',
        paymenttype: paymentMethod,
        paid_amount: '',
        details: '',
        purchasedate: '',
        purchaseexpiredate: '',
        suplierID: '',
      });
  
      setItems([{ item: "", stock_qty: 0, quantity: 0, rate: 0, total: 0 }]);
      setGrandTotal(0);
      setSelectedMethod(1);
  
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong.");
    }
  };
  

  // Handle form input change
  const handlePurchaseDetailChange = (e) => {
    setPurchaseDetails({
      ...purchaseDetails,
      [e.target.name]: e.target.value,
    });
  };


  useEffect(() => {
    setPurchaseDetails((prevDetails) => ({
      ...prevDetails,
      purchasedate: new Date().toISOString().split('T')[0], // Format: 'YYYY-MM-DD'
    }));
  }, []);


  const [isOpen, setOpen] = useState(true);

  const [items, setItems] = useState([
    { item: "", stock_qty: 0, quantity: 0, rate: 0, total: 0 },
  ]);
  const [apiItems, setApiItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);

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
  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const updatedItems = [...items];
  
    if (name === 'item') {
      // Find the selected item from apiItems
      const selectedItem = apiItems.find((item) => item.id === parseInt(value));
      
      if (selectedItem) {
        // Update item, stock_qty, and reset other fields if necessary
        updatedItems[index] = {
          ...updatedItems[index],
          item: selectedItem.id,
          stock_qty: selectedItem.stock_qty, // Automatically set stock_qty
          quantity: 1, // Reset quantity to default or handle as required
          
        };
      }
    } else {
      // Handle other fields like quantity, rate, etc.
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };
      
      // If quantity or rate changes, recalculate total
      if (name === 'quantity' || name === 'rate') {
        const quantity = updatedItems[index].quantity || 0;
        const rate = updatedItems[index].rate || 0;
        updatedItems[index].total = quantity * rate;
      }
    }
  setItems(updatedItems); // Update the state with the modified row
calculateGrandTotal(updatedItems); // Recalculate grand total
    setItems(updatedItems); // Update the state with the modified row
  };
  
  // Add more rows
  const addRow = () => {
    setItems([...items, { item: '', stock: 0, quantity: 0, rate: 0, total: 0 }]);
  };

  const removeRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateGrandTotal(updatedItems);
  };
   // Calculate grand total
const calculateGrandTotal = (items) => {
  const totals = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  setGrandTotal(totals);
  
};


  //

  const allPaynmnetMethod = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/paynmenttype`);
      setPaymentMethod(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // get supplier name

  const getsupplier = () => {
    axios
      .get(`${API_BASE_URL}/suppliers`)
      .then((response) => {
        console.log(response.data);
        setSupplier(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // add supplier

  const handelChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };
  const submitAddsupplier = (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!formData.supName) {
      toast.error("Supplier name is required.");
      return;
    }
    if (!formData.supEmail) {
      toast.error("Supplier email is required.");
      return;
    }
    if (!formData.supMobile) {
      toast.error("Supplier mobile number is required.");
      return;
    }
    if (!formData.supAddress) {
      toast.error("Supplier address is required.");
      return;
    }
  
    axios
      .post(`${API_BASE_URL}/suppliers`, formData)
      .then((res) => {
        console.log(res.data);
        setCmodal(false);
        getsupplier();
        allPaynmnetMethod();
        IngredientsQuantity();
        toast.success("Supplier successfully added");
      })
      .catch((error) => {
        console.log("Error adding supplier:", error);
        toast.error("Failed to add supplier.");
      });
  };

  useEffect(() => {
    getsupplier();
    allPaynmnetMethod();
    IngredientsQuantity();
  },[]);

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
                Add Purchase
              </h1>

              <div className="notification flex gap-x-5 ">
                <IoMdNotifications className="  bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <IoSettings className="   bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <LiaLanguageSolid className=" bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
                <MdOutlineZoomOutMap  onClick={toggleFullScreen} className=" bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl" />
              </div>
            </div>
            <div className=" flex justify-between mt-11">
              <span></span>
              <div className=" flex justify-center items-center gap-x-5 ">
                <HasPermission module="Add Purchase" action="create">
                <button
                  onClick={() => setCmodal(true)}
                  className=" bg-[#4CBBA1] h-[46px] w-[124px] rounded-sm  flex justify-center items-center
               gap-x-1 text-white font-semibold"
                >
                  <IoIosAddCircleOutline className=" font-semibold text-lg" />
                  Add Supplier
                </button>
                </HasPermission>
               
              </div>
            </div>

            <div className=" mt-11  w-full ">
              <form className="">
                {/* purchase details */}
                <div>
                  <div className="border-[1px] border-[#4CBBA1] rounded-md p-10 mb-10">

                    <div className=" flex  justify-between">
                    <div className=" left">
                      <div className="mb-4 flex  gap-x-5 justify-center items-center">
                        <label
                          className="block text-nowrap text-gray-700   font-semibold mb-2"
                          htmlFor="categoryName"
                        >
                          Supplier Name*
                        </label>
                        <select
                         value={purchaseDetails.suplierID}
                         onChange={handlePurchaseDetailChange}
                          className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="parentCategory"
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
                      <div className="">
                        <label className="block text-nowrap text-gray-700   font-semibold mb-2">
                          Payment Method*
                        </label>
                        <select
                         value={selectedMethod}
                         onChange={handleMethodChange}
                        
                        
                          className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          name="paymenttype"
                          id="paymenttype"
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
                                  Payment Information*
                                </h2>
                                <form>
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 sm:col-span-1">
                                      <label
                                        htmlFor="card-number"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                      >
                                        Card Number
                                      </label>
                                      <input
                                        type="text"
                                        name="card-number"
                                        id="card-number"
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                      <label
                                        htmlFor="expiration-date"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                      >
                                        Expiration Date
                                      </label>
                                      <input
                                        type="text"
                                        name="expiration-date"
                                        id="expiration-date"
                                        placeholder="MM / YY"
                                        className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                      <label
                                        htmlFor="cvv"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                      >
                                        CVV
                                      </label>
                                      <input
                                        type="text"
                                        name="cvv"
                                        id="cvv"
                                        placeholder="000"
                                        className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                      <label
                                        htmlFor="card-holder"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                      >
                                        Card Holder
                                      </label>
                                      <input
                                        type="text"
                                        name="card-holder"
                                        id="card-holder"
                                        placeholder="Full Name"
                                        className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-8">
                                    <button
                                      type="button"
                                      className="w-full bg-[#4CBBA1] hover:bg-[#90d8c7] text-white font-medium py-3 rounded-lg focus:outline-none"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className=" middel">
                      <div className="mb-4 flex  gap-x-5 justify-center items-center">
                        <label
                          className="block text-nowrap text-gray-700   font-semibold mb-2"
                         
                        >
                          Invoice No.*
                        </label>
                        <input
                          value={purchaseDetails.invoiceid}
                          onChange={handlePurchaseDetailChange}
                        name="invoiceid"
                          className="shadow w-full  border-[#4CBBA1] appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="invoiceid"
                          type="number"
                          placeholder="Invoice Number"
                        />
                      </div>

                      <div className="mb-4 flex  gap-x-5 justify-center items-center">
                        <label
                          className="block text-nowrap text-gray-700   font-semibold mb-2"
                          
                        >
                          Add Details*
                        </label>
                        <input
                         value={purchaseDetails.details}
                         onChange={handlePurchaseDetailChange}
                        name="details"
                          className="shadow w-full  border-[#4CBBA1] appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="text"
                          placeholder="detail"
                        />
                      </div>

                      <div className="mb-4 flex gap-x-5 justify-center items-center">
  <label className="block text-nowrap text-gray-700 font-semibold mb-2">
    Purchase Date*
  </label>
  <input
    value={purchaseDetails.purchasedate || new Date().toISOString().split('T')[0]} // Default to current date
    onChange={handlePurchaseDetailChange}
    name="purchasedate"
    className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    type="date"
    placeholder="Purchase Date"
  />
</div>


                      <div className="mb-4 flex  gap-x-5 justify-center items-center">
                        <label
                          className="block text-nowrap text-gray-700   font-semibold mb-2"
                        
                        >
                          Expiry Date*
                        </label>
                        <input
                         value={purchaseDetails.purchaseexpiredate}
                         onChange={handlePurchaseDetailChange}
                        name="purchaseexpiredate"
                          className="shadow w-full  border-[#4CBBA1] appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="date"
                          placeholder=" Expiry Date"
                        />
                      </div>
                    </div>
                    </div>
                   
                  </div>
                </div>
{/* Add items form */}
                <div className="border-[1px] border-[#4CBBA1] rounded-md p-10">
                  <div className="grid grid-cols-6 gap-x-3 mb-6 font-semibold text-center">
                    <div>Item Information*</div>
                    <div>Stock/Quantity*</div>
                    <div>Quantity*</div>
                    <div>Rate*</div>
                    <div>Total</div>
                    <div>Action</div>
                  </div>

                  {items.map((val, index) => (
                    <div key={index} className="grid grid-cols-6 gap-x-3 mb-6">
                      {/* Item Information (Select) */}
                      <select
                        className="shadow border border-[#4CBBA1] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-2"
                       
                        name="item"
                        value={val.item}
                         onChange={(e) => handleItemChange(index, e)}
                      >
                        <option value="">Select Item</option>
                        {apiItems.map((apiItem) => (
                          <option key={apiItem.id} value={apiItem.id}>
                            {apiItem.ingredient_name}
                          </option>
                        ))}
                      </select>

                      {/* Stock (Read-only) */}
                      <input
                        type="number"
                        value={val.stock_qty}
                        readOnly
                        className="shadow border border-[#4CBBA1] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-2"
                      />

                      {/* Quantity */}
                      <input
                        type="number"
                        name="quantity"
                        value={val.quantity}
                        placeholder="Quantity"
                        onChange={(e) => handleItemChange(index, e)}
                  
                        className="shadow border border-[#4CBBA1] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-2"
                      />

                      {/* Rate */}
                      <input
                      name="rate"
                        type="number"
                        value={val.rate}
                        onChange={(e) => handleItemChange(index, e)}
                        placeholder="0.00"
                        className="shadow border border-[#4CBBA1] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-2"
                      />

                      {/* Total (Read-only) */}
                      <input
                        name="total"
                        type="number"
                        value={val.total}
                        readOnly
                        className="shadow border border-[#4CBBA1] rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mx-2"
                      />

                      {/* Delete Button */}
                      
                      <div
                        className="cursor-pointer h-[46px] w-[90px] flex justify-center items-center gap-x-2 text-white font-normal bg-[#FB3F3F] p-2 rounded ml-16"
                        onClick={() => removeRow(index)}
                      >
                        <FaRegTrashCan />
                        <button type="button">Delete</button>
                      </div>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className="ml-[610px]">
                    <div className="mb-4 flex gap-x-5 justify-center items-center">
                      <label className="block text-nowrap text-gray-700 w-[100px] font-semibold mb-2">
                        Grand Total:
                      </label>
                      <input
                      name="total_price"
                        className="shadow border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="number"
                        value={grandTotal}
                        readOnly
                        placeholder="Grand Total"
                      />
                    </div>
                  </div>

                  {/* Add More Item Button */}
                  <button
                    type="button"
                   onClick={addRow}
                    className="bg-[#4CBBA1] text-white p-2 rounded"
                  >
                    Add More Item
                  </button>

                  {/* Submit Button */}
                  <div className="ml-[610px]">
                    <div className="mb-4 flex gap-x-5 justify-center items-center">
                      <label className="block text-nowrap text-gray-700 w-[100px] font-semibold mb-2">
                        Paid Amount*:
                      </label>
                      <input
                      
                       value={purchaseDetails.paid_amount}
                       onChange={handlePurchaseDetailChange}
                      name="paid_amount"
                        className="shadow border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="number"
                        placeholder="Paid Amount"
                      />
                    </div>
                  </div>
                </div>

                <div className="submit_button mt-[50px]">
                  <HasPermission module="Add Purchase"action="create">
                  <button
                   onClick={handleSubmit}
                    type="button"
                    className="bg-[#1C1D3E] w-[168px] h-[46px] text-white p-2 rounded"
                  >
                    Submit
                  </button>
                  </HasPermission>
                 
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Add Supplier */}
      <DialogBoxSmall
        isOpen={cModal}
        title={"Add Supplier"}
        onClose={() => {
          setCmodal(false);
        }}
      >
        <div className="">
          {/* <form className="bg-white rounded px-8 pt-6 pb-8 mb-4">
            <div className="">
              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Supplier Name*
                </label>
                <input
                  type="text"
                  onChange={handelChange}
                  value={formData.supName}
                  name="supName"
                  placeholder=" Supplier Name"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Email Address*
                </label>
                <input
                  type="text"
                  onChange={handelChange}
                  value={formData.supEmail}
                  name="supEmail"
                  placeholder=" Customer E-mail"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Mobile*
                </label>
                <input
                  type="number"
                  onChange={handelChange}
                  value={formData.supMobile}
                  name="supMobile"
                  placeholder=" Mobile Number"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Address*
                </label>
                <textarea
                  onChange={handelChange}
                  value={formData.supAddress}
                  name="supAddress"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>
              </div>

              <div className="flex mt-4 float-right gap-x-3">
                <button
                  onClick={submitAddsupplier}
                  className="bg-[#1C1D3E] text-white w-[104px] h-[42px] rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </div>
          </form> */}
          <form className="bg-white rounded px-8 pt-6 pb-8 mb-4">
            <div className="">
              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Supplier Name*
                </label>
                <input
                  type="text"
                  onChange={handelChange}
                  value={formData.supName}
                  name="supName"
                  placeholder=" Supplier Name"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Email Address*
                </label>
                <input
                  type="text"
                  onChange={handelChange}
                  value={formData.supEmail}
                  name="supEmail"
                  placeholder=" Customer E-mail"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Mobile*
                </label>
                <input
                  type="number"
                  onChange={handelChange}
                  value={formData.supMobile}
                  name="supMobile"
                  placeholder=" Mobile Number"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>


              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                Previous Credit Balance *
                </label>
                <input
                  type="number"
                  onChange={handelChange}
                  value={formData.amount}
                  name="amount"
                  placeholder="Pevious Credit Balance"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Address*
                </label>
                <textarea
                  onChange={handelChange}
                  value={formData.supAddress}
                  name="supAddress"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>
              </div>

              <div className="flex mt-4 float-right gap-x-3">
              <HasPermission module="Add Purchase"action="create">
                <button
                  onClick={submitAddsupplier}
                  className="bg-[#1C1D3E] text-white w-[104px] h-[42px] rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save
                </button>
                </HasPermission>
              </div>
            </div>
          </form>
        </div>
      </DialogBoxSmall>
    </>
  );
};

export default AddPurchase;
