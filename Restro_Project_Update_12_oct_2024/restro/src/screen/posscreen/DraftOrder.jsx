import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../store/AuthContext";
import { FaRegEye, FaRegEdit, FaCheck } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const headers = [
  "SL.",
  "Order ID",
  "Customer Name ",
  "Customer Type ",
  "Amount",

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

const DraftOrder = ({ isOpen, onClose }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { token } = useContext(AuthContext);
  if (!isOpen) return null;
  const [draftorder, setDraftorder] = useState([]);
  const [isDeletOpen, setIsDeletOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const closeModaldelete = () => setIsDeletOpen(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const getDratOrder = () => {
    axios
      .get(`${API_BASE_URL}/getdraft`)
      .then((res) => {
        console.log(res.data);
        setDraftorder(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(canceldata.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };
 // cancle order process
 const deleteOrder = (order_id) => {
    setSelectedOrderId(order_id);
    setIsDeletOpen(true);
  };

  const navigate=useNavigate()
    const handleEditClick = (id) => {
      // Fetch data for the given ID
          navigate(`/edit-order/${id}`); // Navigate to the edit page with the role ID
       
    };

  const DeletModal = ({ isOpen, onClose, order_id }) => {
    if (!isOpen) return null;
    const [anyreason, setAnyreason] = useState(""); // renamed to match backend

    const cancelOrder = (order_id) => {
      axios
      .post(
        `${API_BASE_URL}/cancelOrder/${order_id}`,
        { anyreason }, 
        { headers: { "Content-Type": "application/json" } } 
      )
      .then((response) => {
        console.log(response.data);
        getDratOrder(); // Assuming this fetches updated order data
        onClose(); // Close modal after successful cancellation
        toast.success("Order cancel sucessfully.")
      })
        .catch((error) => {
          console.error(error);
        });
    };


 
   
    return (
      <>
        <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
          <div className=" w-1/2 px-20 ">
            <div className=" py-4  bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
              <div className="flex  py-5 px-4 justify-between items-center border-b-[1px] border-black">
                <h2 className="text-xl  font-semibold">Cancle Order</h2>
                <button
                  onClick={onClose}
                  className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold"
                >
                  X
                </button>
              </div>

              <div className=" flex  justify-around mt-11 mb-6">
                <div className="">
                  <div className=" flex  gap-x-24">
                    <h1 className=" font-bold">Order Id :</h1>

                    <span className=" float-right">{order_id}</span>
                  </div>
                  <div className=" flex gap-x-5">
                    <h1 className=" font-bold">Cancle Reasion :-</h1>

                    <textarea
                      rows={7}
                      cols={20}
                      id="message"
                      name="message"
                      required
                      placeholder="Note..."
                      className=" ring-1 ring-[#4CBBA1] rounded-md px-4 outline-none focus:ring-2  text-black py-1 mt-2"
                      value={anyreason}
                      onChange={(e) => setAnyreason(e.target.value)} // Update reason state on change
                    ></textarea>
                  </div>
                  <div className=" mt-5">
                    <button
                      onClick={() => {
                        cancelOrder(order_id);
                      }}
                      className="  float-end bg-[#4CBBA1] text-white px-10 py-2 font-semibold rounded"
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" opacity-5 fixed inset-0 z-40 bg-slate-800"></div>
      </>
    );
  };
  useEffect(() => {
    getDratOrder();
  }, []);

  return (
    <>

<div>
      <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" w-full px-20 ">
          <div className=" py-4  bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
            <div className="flex  py-5 px-4 justify-between items-center border-b-[1px] border-black">
              <h2 className="text-xl  font-semibold ">Draft Orders</h2>
              <button
                onClick={onClose}
                className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold"
              >
                X
              </button>
            </div>
            <div className="">
              <section className="tabledata">
                <div className="p-6">
                  <table className="min-w-full bg-white ">
                    <thead className="">
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="py-4 px-4 bg-[#4CBBA1] text-gray-50 tex uppercase text-sm"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                    {draftorder.length > 0 ? (
                        draftorder
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )
                          .map((row, index) => (
                            <tr key={index} className="border-b text-center ">
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {index + 1}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.order_id}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.customer_name}
                              </td>
                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.customer_type}
                              </td>

                              <td className="py-2 px-4 border border-[#4CBBA1]">
                                {row.totalamount}$
                              </td>

                              <td className=" border border-[#4CBBA1]">
                                <div className=" flex justify-evenly font-bold  items-center ">
                                  <button

onClick={() => handleEditClick(row.order_id)}
                                    
                                    className=" bg-[#1C1D3E] items-center gap-1  px-2 py-1 flex  text-[#fff]  cursor-pointer rounded-md text-sm"
                                  >
                                    <FaRegEdit />
                                    Add to cart
                                  </button>

                                  <button
                                    className=" items-center gap-1  px-2 py-1 flex bg-[#a02828] text-[#fff]  cursor-pointer rounded-md text-sm"
                                    onClick={() => {
                                        deleteOrder(row.order_id);
                                      }}
                                  >
                                    <FaRegTrashCan />
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))) : (
                            <tr>
                              <td colSpan="9" className="py-2 px-4 text-center">
                                No Draft Order Are Available.
                              </td>
                            </tr>
                          )}
                    </tbody>
                  </table>

                  <div className="flex justify-between mt-7">
                    <span></span>
                    {draftorder.length > 0 && (
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
                            ...Array(
                              Math.ceil(draftorder.length / itemsPerPage)
                            ),
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
                              Math.ceil(draftorder.length / itemsPerPage)
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

                <div className=" flex justify-between p-3">
                  <span></span>

                  <div className=" flex gap-x-2 items-center">
                    <button
                      className=" bg-[#6f65a7]  text-white font-bold p-2 rounded-md"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <div className=" opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
    </div>

    <DeletModal
                            isOpen={isDeletOpen}
                            order_id={selectedOrderId}
                            onClose={closeModaldelete}
                          />
    </>
   
  );
};

export default DraftOrder;
