import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PaymentDialogBox = ({
  

  isOpen,
  onClose,
  paymentData,
  paymentMethod,
  refreshOrderList,
}) => {
  if (!isOpen) return null;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  const [selectedMethod, setSelectedMethod] = useState(1);
  const [paidAmount, setPaidAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percent"); // or "amount"
  const orderDetails = paymentData?.[0]?.orderDetails || [];

  useEffect(() => {
    if (orderDetails.length > 0) {
      const totalAmount = orderDetails[0].totalamount;
      const calculatedAmount = calculateDiscountedAmount(
        totalAmount,
        discount,
        discountType
      );
      setPaidAmount(calculatedAmount);
    }
  }, [discount, discountType, orderDetails]);

  const calculateDiscountedAmount = (total, discount, type) => {
    if (type === "percent") {
      return total - (total * discount) / 100;
    } else if (type === "amount") {
      return total - discount;
    }
    return total;
  };

  const handleMethodChange = (event) => {
    setSelectedMethod(Number(event.target.value));
  };

  const handleDiscountChange = (event) => {
    setDiscount(Number(event.target.value));
  };

  const handleDiscountTypeChange = (event) => {
    setDiscountType(event.target.value);
  };
  // get all booked table
  const getBookTable = () => {
    axios
      .get(`${API_BASE_URL}/bookedtable`)
      .then((res) => {
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cant show table");
      });
  };
  const payPayment = (order_id) => {
    const formData = {
      payment_method_id: selectedMethod,
      paidAmount,
      order_id,
      discount: discount,
    };

    axios
      .post(`${API_BASE_URL}/makePayment/${order_id}`, formData)
      .then((response) => {
        console.log(response.data);
        toast.success("Payment Complete");
        getBookTable()
        refreshOrderList(); // Refresh the order list
        onClose(); // Close the modal after payment
      })
      .catch((error) => {
        console.error(error);
        toast.error("Payment Failed");
      });
  };

  return (
    <div>
      <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="w-8/12 px-20">
          <div className="py-4 bg-white rounded-md shadow-md border-[1px] border-[#1C1D3E]">
          <div className="flex  py-5 px-4 justify-between items-center ">
              <span></span>
              <button
                onClick={onClose}
                className="text-white bg-[#FB3F3F] px-2  rounded-md hover:scale-105 font-bold"
              >
                X
              </button>
            </div>

            <div className="px-6">
              {orderDetails.length > 0 ? (
                <div className="flex justify-between w-full p-4 rounded-lg shadow-md border border-[#4CBBA1]">
                  <div className="flex-1">
                    <label className="block mb-2">Payment Method</label>
                    <select
                      value={selectedMethod}
                      onChange={handleMethodChange}
                      className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      name="paymentMethod"
                      id="paymentMethod"
                    >
                      {paymentMethod.map((method, index) => (
                        <option key={index} value={method.payment_method_id}>
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

                  <div className="flex flex-col ml-4">
                    {orderDetails.map((val, index) => (
                      <div key={index} className="mb-4  rounded-lg">
                        <div className="flex justify-between px-3 border-[1px] border-[#4CBBA1] py-3 rounded-sm shadow-[#4CBBA1] shadow-sm">
                          <h1>Total Amount</h1>
                          <input
                            type="text"
                            value={val.totalamount}
                            readOnly
                            className="text-right"
                          />
                        </div>
                        <div className="flex mt-4 justify-between px-3 border-[1px] border-[#4CBBA1] py-3 rounded-sm shadow-[#4CBBA1] shadow-sm">
                          <h1>Amount Due</h1>
                          <input
                            type="text"
                            value={val.bill_amount}
                            readOnly
                            className="text-right"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="">
                      <label className="block mb-2">Discount Type</label>
                      <select
                        className="w-full p-2 border rounded border-[#4CBBA1]"
                        value={discountType}
                        onChange={handleDiscountTypeChange}
                      >
                        <option value="percent">Percent(%)</option>
                        <option value="amount"> Fixed</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="block mb-2">Discount</label>
                      <input
                        min={0}
                        type="number"
                        className="w-full p-2 border rounded border-[#4CBBA1]"
                        value={discount}
                        onChange={handleDiscountChange}
                      />
                    </div>

                    <div className="mt-4">
                      <h1 className="block mb-2 font-bold">
                        Final Amount: {paidAmount.toFixed(2)}
                      </h1>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => payPayment(orderDetails[0].order_id)}
                        className="bg-[#1C1D3E] float-right text-white py-2 px-4 rounded-md hover:bg-[#2B2F4A] text-nowrap"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600">Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
    </div>
  );
};

export default PaymentDialogBox;
