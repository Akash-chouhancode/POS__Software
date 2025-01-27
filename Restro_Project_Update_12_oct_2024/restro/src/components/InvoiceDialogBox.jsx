import React, { useEffect, useState,useContext } from "react";
import axios from "axios";
const DialogBox = ({ isOpen, onClose, invoiceDatas}) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL;
  const [data, setData] = useState(null);

  const fetchImageData = () => {
    axios
      .get(`${API_BASE_URL}/websetting`)
      .then((response) => {
        setData(response.data.data);
        console.log("data shiw to imag",data)
      })
      .catch((error) => {
        console.error("Error fetching image data:", error);
      });
  };

  useEffect(() => {
    fetchImageData();
  }, []);
  const logoUrls = data?.map((val) => `${VITE_IMG_URL}${val.logo}`) || [];




  if (!isOpen) return null;
  if (!invoiceDatas || invoiceDatas.length === 0) {
    return <div>Loading...</div>;
  }
  const orderDetails = invoiceDatas[0].orderDetails;
  const menuItems = invoiceDatas[0].menuItems;
  return (
    <div>
      <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" w-full  px-20 ">
          <div className=" py-4  bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
            <div className="flex  py-5 px-4 justify-between items-center ">
              {/* <button className="text-white bg-[#4CBBA1] px-2  py-2  rounded-md  hover:scale-105 font-bold">
                print
              </button> */}
              <span></span>
              <button
                onClick={onClose}
                className="text-white bg-[#FB3F3F] px-2  rounded-md hover:scale-105 font-bold"
              >
                X
              </button>
            </div>
            <div className="">
  <div className="w-full bg-white p-6">
    {orderDetails.map((orderDetail, index) => (
      <div key={index}>
        <div className="flex justify-between items-center mb-6">
          <div className=" flex flex-col">
         <span><img src={logoUrls} alt="Logo" className="float-start" width={100} /></span> 
            <div className="mt-2">
            <h1 className="text-xl font-bold">{data[0].restro_name}</h1>
              <p className=" font-semibold ">
              {data[0].address}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">Invoice</h2>
            <p>Invoice No: {orderDetail.saleinvoice}</p>
            <p>Order Status: {orderDetail.order_status_name}</p>
            <p>
              Billing Date:{" "}
              {new Date(orderDetail.bill_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold">Billing From</h3>
            <p>{data[0].restro_name}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold">Billing To</h3>
            <p>{orderDetail.customer_name}</p>
            <p>Address: {orderDetail.customer_address}</p>
            <p>Mobile: {orderDetail.customer_phone}</p>
          </div>
        </div>

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-100 border-b">Item</th>
              <th className="py-2 px-4 bg-gray-100 border-b">Size</th>
              <th className="py-2 px-4 bg-gray-100 border-b">Unit Price</th>
              <th className="py-2 px-4 bg-gray-100 border-b">Quantity</th>
              <th className="py-2 px-4 bg-gray-100 border-b">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((menuItem, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border text-center">
                  {menuItem.ProductName}
                </td>
                <td className="py-2 px-4 border text-center">
                  {menuItem.variantName}
                </td>
                <td className="py-2 px-4 border text-center">
                  ${Number(menuItem.price || 0).toFixed(2)}
                </td>
                <td className="py-2 px-4 border text-center">
                  {menuItem.menuqty}
                </td>
                <td className="py-2 px-4 border text-center">
                  ${(Number(menuItem.price || 0) * menuItem.menuqty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="w-full">
          <tbody>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Subtotal</td>
              <td>${Number(orderDetail.totalamount || 0).toFixed(2)}</td>
            </tr>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Discount($)</td>
              <td className="border">${Number(orderDetail.discount || 0).toFixed(2)}</td>
            </tr>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Service Charge(20%)</td>
              <td className="border">${Number(orderDetail.service_charge || 0).toFixed(2)}</td>
            </tr>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Vat (%)</td>
              <td className="border">${Number(orderDetail.VAT || 0).toFixed(2)}</td>
            </tr>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Grand Total</td>
              <td className="border">${Number(orderDetail.bill_amount || 0).toFixed(2)}</td>
            </tr>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Customer Paid Amount</td>
              <td className="border">${Number(orderDetail.customerpaid || 0).toFixed(2)}</td>
            </tr>
            <tr className="py-2 px-4 border text-center">
              <td className="border">Change Due</td>
              <td className="border">
                ${(
                  Number(orderDetail.customerpaid || 0) -
                  Number(orderDetail.bill_amount || 0)
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ))}
  </div>
</div>
          </div>
        </div>
      </div>
      <div className=" opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
    </div>
  );
};

export default DialogBox;