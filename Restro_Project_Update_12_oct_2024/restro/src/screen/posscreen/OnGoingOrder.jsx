import React, { useEffect, useRef, useState } from "react";
import Nav from "../../components/Nav";
import { useReactToPrint } from "react-to-print";
import { NavLink } from "react-router-dom";
import Hamburger from "hamburger-react";
import { TiFlowMerge } from "react-icons/ti";
import { FaRegEdit } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoPrintOutline } from "react-icons/io5";
import { PiSplitHorizontalBold } from "react-icons/pi";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import DialogBox from "../../components/DialogBox";
import {
  FaUserPlus,
  FaHandHoldingUsd,
  FaCalculator,
  FaMoneyCheck,
  FaNetworkWired,
} from "react-icons/fa";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { MdCropRotate, MdOutlineZoomInMap, MdTableBar } from "react-icons/md";
import { CiSaveDown2 } from "react-icons/ci";
import { FaKitchenSet, FaKeyboard } from "react-icons/fa6";
import { IoQrCodeOutline } from "react-icons/io5";
import { IoMdCart, IoIosMan } from "react-icons/io";
import { RiTodoLine } from "react-icons/ri";
import { CiShop } from "react-icons/ci";
import axios from "axios";
import logo from "../../assets/images/restrologo.png";
import PaynmentDialogBox from "../../components/PaynmentDialogBox";
import InvoiceDialogBox from "../../components/InvoiceDialogBox";
import { ComponentToPrintInvoice } from "../../components/ComponentToPrintInvoice";
import { InvoiceDialogBox2 } from "../../components/InvoiceDialogeBox2";
import { data } from "autoprefixer";
import { toast } from "react-toastify";
import SplitModal from "../../components/SplitModal";
import SplitPaynmentModal from "../../components/SplitPaynmentModal";
import DuemergePaynmentModal from "../../components/DuemergePaynmentModal";
import SplitpayModal from "../../components/SplitpayModal";

const OnGoingOrder = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isOpen, setOpen] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState();
  const [paynmentModal, setPaynmentModal] = useState(false);
  const [mergepaynmentModal, setMergePaynmentModal] = useState(false);
  const [splitpaynmentModal, setSplitPaynmentModal] = useState(false);
  const [mergeduepaynmentModal, setMergeduepaynmentModal] = useState(false);
  const [paymentData, setPaymentData] = useState([]);
  const [isDeletOpen, setIsDeletOpen] = useState(false);
  const [ongoingData, setOngoingData] = useState({
    nonmergedata: [],
    mergedOrders: [],
  });
  const [invoiceData, setInvoiceData] = useState([]);
  const [billData, setBillData] = useState([]);
  const [cModal5, setCmodal5] = useState(false);
  const [bookTableData, setBookTableData] = useState([]);
  const [cModal4, setCmodal4] = useState(false);
  const [ubookedData, setUnbookedData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [splitData, setSplitData] = useState([]);
  const [splitModal, setSplitModal] = useState(false);
  const [invoiceDataModal, setInvoiceDataModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selecteSplitOrderid, setSelecteSplitOrderid] = useState(0);
  const [selectedDueOrders, setSelectedDueOrders] = useState([]);
const [customersplitID,setCustomersplitID]=useState(null)
const[orderSplitId,setOrderSplitID]=useState(null)
  //delete id
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const closeModaldelete = () => setIsDeletOpen(false);

  const OrderButtons = [
    { id: 1, title: "New Order", icon: <MdCropRotate />, link: "/order-list" },
    {
      id: 2,
      title: "On Going Order",
      icon: <CiSaveDown2 />,
      // link: "/ongoing-order",
    },
    {
      id: 3,
      title: "Kitchen Status",
      icon: <FaKitchenSet />,
      link: "/kitchen-status",
    },
    { id: 4, title: "QR Order", icon: <IoQrCodeOutline />, link: "/qr-order" },
    { id: 5, title: "Online Order", icon: <IoMdCart />, link: "/online-order" },
    { id: 6, title: "Today Order", icon: <RiTodoLine />, link: "/today-order" },
  ];
  const ButtonsData2 = [
    { id: 1, title: "AddCust.", icon: <FaUserPlus /> },
    { id: 2, title: "Cust.type", icon: <TfiHeadphoneAlt /> },
    { id: 3, title: "Waiter", icon: <IoIosMan /> },
    { id: 4, title: "Shortcut", icon: <FaKeyboard /> },
    { id: 5, title: "Zoom", icon: <MdOutlineZoomInMap /> },
    { id: 6, title: "TableMgmt.", icon: <MdTableBar /> },
    { id: 7, title: "CaseReg.", icon: <FaMoneyCheck /> },
    { id: 8, title: "Calculator", icon: <FaCalculator /> },
    { id: 9, title: "Hold", icon: <FaHandHoldingUsd /> },
    { id: 10, title: "Transaction", icon: <FaNetworkWired /> },
  ];
  // get all booked table
  const getBookTable = () => {
    axios
      .get(`${API_BASE_URL}/bookedtable`)
      .then((res) => {
        setBookTableData(res.data.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cant show table");
      });
  };

  // get all unbooked table

  const getunBookTable = () => {
    axios
      .get(`${API_BASE_URL}/unbookedtable`)
      .then((res) => {
        setUnbookedData(res.data.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cant show table");
      });
  };

  // working of escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCmodal5(false);
        setPaynmentModal(false);
        setInvoiceDataModal(false);
        setIsDeletOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const showPaynment = (order_id) => {
    axios
      .get(`${API_BASE_URL}/getOrderById/${order_id}`)
      .then((response) => {
        console.log(response.data);
        setPaymentData(response.data);
        setPaynmentModal(true);
        getBookTable();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (paymentData) {
      console.log("paydata", paymentData);
    }
  }, [paymentData]);

  const allPaynmnetMethod = () => {
    axios
      .get(`${API_BASE_URL}/paynmenttype`)
      .then((response) => {
        setPaymentMethod(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getOngoing = async () => {
    try {
      const responce = await axios.get(`${API_BASE_URL}/duemergeorder`);
      console.log(responce.data.data);
      setOngoingData({
        nonmergedata: responce.data.NonMergedOrder || [],
        mergedOrders: responce.data.MergeOrder || [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  // print bill process
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const showBillDetails = async (order_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice/${order_id}`);
      setBillData([response.data]); // Set the data first
      console.log("Bill me daal na h ye data ", response.data);
      // Delay the print action until after the state has been updated
      setTimeout(() => {
        handlePrint(); // Trigger the print
      }, 100); // A small timeout to ensure state update
    } catch (error) {
      console.error(error);
    }
  };
  // cancle order process
  const deleteOrder = (order_id) => {
    setSelectedOrderId(order_id);
    setIsDeletOpen(true);
  };

  // delete modal
  const DeletModal = ({ isOpen, onClose, order_id }) => {
    if (!isOpen) return null;
    const [anyreason, setAnyreason] = useState(""); // renamed to match backend

    const cancelOrder = (order_id) => {
      axios
        .post(
          `${API_BASE_URL}/cancelAllOrder/${order_id}`,
          { anyreason },
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          console.log(response.data);
          getOngoing(); // Assuming this fetches updated order data
          onClose(); // Close modal after successful cancellation
          toast.success("Order cancel sucessfully.");
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

  const showShplitData = (order_id,customer_id) => {
    axios
      .get(`${API_BASE_URL}/splitorderdata/${order_id}`)
      .then((response) => {
        setSplitData(response.data.menuItems);
        setSplitModal(true);
        setCustomersplitID(customer_id)
        setOrderSplitID(order_id)
        getBookTable();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCheckboxChange = (item) => {
    if (selectedItems.some((selected) => selected.row_id === item.row_id)) {
      setSelectedItems(
        selectedItems.filter((selected) => selected.row_id !== item.row_id)
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const closeModal = () => {
    setSplitModal(false);
    setSelectedItems([]); // Reset selected items when closing modal
  };
  const Toatalsplit = (selectedItems
    .reduce((acc, item) => acc + item.menuqty * parseFloat(item.price), 0)
    .toFixed(2));

//  const orderIds = selectedItems.map((order) => order.order_id);
  const payForselecteditem = ()=>{
    const formData = {
      order_id: orderSplitId,
      customer_id:customersplitID,
      total_price:Toatalsplit,
      order_menu:selectedItems
     
    };
 
   
  
    axios
    .post(`${API_BASE_URL}/postsplit`, formData)
    .then((response) => {
    console.log("subid ",response.data.sub_order_ids
      );
      setSelecteSplitOrderid(response.data.sub_order_ids)   
    setSplitPaynmentModal(true)
    })
    .catch((error) => {
      console.error(error);
      toast.error("Something went wrong..");
    });

  }

  const remainingItems = splitData.filter(
    (item) => !selectedItems.some((selected) => selected.row_id === item.row_id)
  );

  useEffect(() => {
    if (splitData) {
      console.log("paydata", paymentData);
    }
  }, [splitData]);

  const handleCheckboxMerge = (val) => {
    setSelectedOrders((prevSelected) => {
      if (prevSelected.find((order) => order.order_id === val.order_id)) {
        // If already selected, remove it
        return prevSelected.filter((order) => order.order_id !== val.order_id);
      } else {
        // If not selected, add it
        return [...prevSelected, val];
      }
    });
  };

  const handleMergeOrders = () => {
    if (selectedOrders.length === 1 || selectedOrders.length === 0) {
      toast.error("Please select at least Two order to merge!");
      return;
    }
    setMergePaynmentModal(true);
  };
  const showInvoiceData = async (order_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice/${order_id}`);
      setInvoiceData([response.data]);
      console.log("Invoice Data: ", invoiceData);
      setInvoiceDataModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getMergePaymentdata = (id) => {
    setMergeduepaynmentModal(true);
    axios
      .get(`${API_BASE_URL}/invoice/${id}`)
      .then((response) => {
        console.log("due merger data", response.data);
        setSelectedDueOrders(response.data.orderDetails);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const refreshOrderList = () => {
    getOngoing();
    getBookTable();
    getunBookTable();
    setSelectedOrders([]);
  };
  useEffect(() => {
    getOngoing();
    allPaynmnetMethod();
    getBookTable();
    getunBookTable();
  }, []);
  return (
    <>
      {/* Main Div */}

      <div className="main_div  ">
        <section className=" side_section flex">
          <div className={`${isOpen == false ? "hidden" : ""}`}>
            <Nav />
          </div>
          <header className="">
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </header>

          <div className=" ">
            <section className="section1 flex justify-evenly gap-x-6 pt-2 ">
              <div className=" flex gap-x-6">
                <div className="orderButton flex flex-wrap ">
                  {OrderButtons.map((val, index) => (
                    <div
                      className={`w-1/3 ${
                        index === 2 ? "pointer-events-none" : ""
                      }`}
                      key={index}
                    >
                      <NavLink
                        to={val.link}
                        className={({ isActive }) =>
                          `h-[60px] font-semibold w-full px-7 py-3 border-[2px] rounded-md cursor-pointer flex justify-center items-center gap-3 ${
                            isActive
                              ? "bg-[#4CBBA1] text-white border-[#4CBBA1]"
                              : "bg-[#1C1D3E] text-[#fff] border-zinc-300 hover:bg-[#4CBBA1]"
                          }`
                        }
                      >
                        <span className="text-emerald-50 text-xl">
                          {val.icon}
                        </span>
                        {val.title}
                      </NavLink>
                    </div>
                  ))}
                </div>
              </div>

              <div className="orderButton flex flex-wrap  ">
                {ButtonsData2.map((val, index) => (
                  <>
                    <div className="w-1/5 ">
                      <button className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-not-allowed  py-3">
                        {" "}
                        <div className=" flex flex-col justify-center items-center   gap-1 ">
                          <span>{val.icon}</span> {val.title}
                        </div>{" "}
                      </button>
                    </div>
                  </>
                ))}
              </div>
            </section>
            {/* //show booked and unbookd table */}
            <section className=" section2 mt-7">
              <div className=" flex gap-x-6 ">
                <button
                  onClick={() => setCmodal5(true)}
                  className=" cursor-pointer  w-full text-md bg-[#4CBBA1] flex gap-1 justify-center items-center leading-4 px-4 py-5  rounded-md  text-white "
                >
                  {" "}
                  <MdTableBar />
                  Booked Table
                </button>

                <button
                  onClick={() => setCmodal4(true)}
                  className=" cursor-pointer  w-full text-md bg-[#4CBBA1] flex gap-1 justify-center items-center leading-4 px-4 py-5  rounded-md  text-white "
                >
                  {" "}
                  <MdTableBar />
                  Unbooked Table
                </button>

                <button
                  onClick={handleMergeOrders}
                  className=" cursor-pointer  w-full text-md bg-[#4CBBA1] flex gap-1 justify-center items-center leading-4 px-4 py-5  rounded-md  text-white "
                >
                  {" "}
                  <TiFlowMerge />
                  Merge order
                </button>
              </div>
            </section>

            <section className="section3  mt-10">
              <h2 className="text-xl font-bold mb-2">Non-Merged Orders</h2>
              <div className="table_data flex flex-wrap gap-y-8">
                {ongoingData.nonmergedata.length === 0 ? (
                  <div className="no-orders-message">
                    <h2 className=" text-2xl font-semibold ">
                      No ongoing orders are available.
                    </h2>
                  </div>
                ) : (
                  ongoingData.nonmergedata.map((val, index) => (
                    <>
                      <div className=" card p-5">
                        <div className=" p-2 border-[1px] border-[#4CBBA1] shadow-sm shadow-[#4CBBA1]">
                          <div className=" flex gap-2  items-center leading-3 px-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              className=" size-9"
                            >
                              <title>Dining Table</title>
                              <g id="Dining_Table" data-name="Dining Table">
                                <path d="M29.109,37.871,27,36.465V24H37a2,2,0,0,0,2-2V20a2,2,0,0,0-2-2H33.949A10.015,10.015,0,0,0,25,9.051V8h1a1,1,0,0,0,0-2H22a1,1,0,0,0,0,2h1V9.051A10.015,10.015,0,0,0,14.051,18H10a2,2,0,0,0-2,2v2a2,2,0,0,0,2,2H21V36.465l-2.109,1.406A2,2,0,0,0,18,39.535V40a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2v-.465A2,2,0,0,0,29.109,37.871ZM24,11a8.008,8.008,0,0,1,7.931,7H16.069A8.008,8.008,0,0,1,24,11ZM10,22V20H37v2ZM28,40H20v-.465l2.109-1.406A2,2,0,0,0,23,36.465V24h2V36.465a2,2,0,0,0,.891,1.664L28,39.535Z"></path>
                                <path d="M46.374,30.4l1.608-12.133A2,2,0,0,0,46.006,16H44.92a2,2,0,0,0-1.926,1.481l-2.587,9.662H34.243a2.986,2.986,0,0,0-2.892,2.248L31.064,30.5h0a2,2,0,0,0,1.9,2.5l-1.932,7.762a1,1,0,0,0,.73,1.212A.961.961,0,0,0,32,42a1,1,0,0,0,.97-.758L35.022,33H43.2l1.825,8.217A1,1,0,0,0,46,42a1.018,1.018,0,0,0,.218-.024,1,1,0,0,0,.76-1.193l-1.854-8.341A2.992,2.992,0,0,0,46.374,30.4ZM33,31l.286-1.109a.988.988,0,0,1,.956-.747h6.932a1,1,0,0,0,.966-.741L44.92,18H46L44.392,30.133a1,1,0,0,1-.981.867L33,31Z"></path>
                                <path d="M16.58,32.227a1.993,1.993,0,0,0,.357-1.727h0l-.286-1.106a2.988,2.988,0,0,0-2.893-2.25H7.593L5.006,17.481A2,2,0,0,0,3.08,16H1.994A2,2,0,0,0,.018,18.264L1.626,30.4a2.991,2.991,0,0,0,1.161,1.98L.919,40.783a1,1,0,0,0,1.953.434L4.7,33h8.175l2.052,8.242A1,1,0,0,0,15.9,42a.961.961,0,0,0,.242-.03,1,1,0,0,0,.729-1.212L14.935,33h.07A1.981,1.981,0,0,0,16.58,32.227ZM4.589,31a1,1,0,0,1-.981-.867L1.994,18h1.08L5.859,28.4a1,1,0,0,0,.966.741h6.932a.99.99,0,0,1,.957.748L15,31Z"></path>
                              </g>
                            </svg>
                            <span className=" font-semibold">
                              Table:
                              {val.tablename ? val.tablename : "No table found"}
                            </span>
                            <input
                              type="checkbox"
                              onChange={() => handleCheckboxMerge(val)}
                              className="size-5 custom-checkbox"
                              checked={selectedOrders.some(
                                (order) => order.order_id === val.order_id
                              )}
                            />
                          </div>

                          <div className="  px-3 font-semibold">
                            <h1>Order Number :{val.order_id}</h1>
                            <h2>
                              Waiter:{" "}
                              {val.waiter_first_name && val.waiter_last_name
                                ? `${val.waiter_first_name} ${val.waiter_last_name}`
                                : "No Waiter Found"}
                            </h2>
                          </div>
                          {val.bill_status !== 1 && (
                            <div className=" flex gap-x-2">
                              <button
                                onClick={() => {
                                  showPaynment(val.order_id);
                                }}
                                className=" mb-3 mt-5  w-full items-center  justify-center gap-1  px-1 py-1 flex bg-[#4CBBA1] text-[#fff]  cursor-pointer  rounded-sm "
                              >
                                <IoMdCheckmarkCircleOutline />

                                <span className="text-[#fff]">
                                  {" "}
                                  Make Payment
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  showShplitData(val.order_id,val.customer_id);
                                }}
                                className=" mb-3 mt-5  w-full items-center  justify-center gap-1  px-1 py-1 flex bg-[#4CBBA1] text-[#fff]  cursor-pointer  rounded-sm "
                              >
                                <PiSplitHorizontalBold />

                                <span className="text-[#fff]">Split</span>
                              </button>
                            </div>
                          )}

                          <div className=" flex gap-x-3 overflow-hidden">
                            <button
                              onClick={() => {
                                showInvoiceData(val.order_id);
                              }}
                              className="  items-center gap-1  px-1 py-1 flex bg-[#4CBBA1] text-[#fff]  cursor-pointer rounded-sm text-sm"
                            >
                              <IoDocumentAttachOutline />
                              Invoice
                            </button>
                            <button
                              onClick={() => showBillDetails(val.order_id)}
                              className="items-center gap-1 px-1 py-1 flex bg-[#4CBBA1] text-[#fff] cursor-pointer rounded-sm text-sm"
                            >
                              <IoPrintOutline />
                              Print
                            </button>

                            <button
                              className=" items-center gap-1  px-1 py-1 flex bg-[#a02828] text-[#fff]  cursor-pointer rounded-sm text-sm"
                              onClick={() => {
                                deleteOrder(val.order_id);
                              }}
                            >
                              <FaRegTrashCan />
                              Cancel
                            </button>
                            <DeletModal
                              isOpen={isDeletOpen}
                              order_id={selectedOrderId}
                              onClose={closeModaldelete}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ))
                )}
              </div>
            </section>

            <section className="section3  mt-10">
              <h2 className="text-xl font-bold mt-6 mb-2">Merged Orders</h2>
              <div className="table_data flex flex-wrap gap-y-8">
                {ongoingData.mergedOrders.length === 0 ? (
                  <div className="no-orders-message">
                    <h2 className=" text-2xl font-semibold ">
                      No merge Due orders are available.
                    </h2>
                  </div>
                ) : (
                  ongoingData.mergedOrders.map((val, index) => (
                    <>
                      <div className=" card p-5">
                        <div className=" p-2 border-[1px] border-[#4CBBA1] shadow-sm shadow-[#4CBBA1]">
                          <div className="  px-3 font-semibold">
                            <h1>Order Number :{val.marge_order_id}</h1>
                            <h2>
                              Waiter:{" "}
                              {val.waiter_first_name && val.waiter_last_name
                                ? `${val.waiter_first_name} ${val.waiter_last_name}`
                                : "No Waiter Found"}
                            </h2>
                          </div>
                          {val.bill_status !== 1 && (
                            <div className=" flex gap-x-2">
                              <button
                                // onClick={}

                                onClick={() => {
                                  getMergePaymentdata(val.marge_order_id);
                                }}
                                className=" mb-3 mt-5  w-full items-center  justify-center gap-1  px-1 py-1 flex bg-[#4CBBA1] text-[#fff]  cursor-pointer  rounded-sm "
                              >
                                <IoMdCheckmarkCircleOutline />

                                <span className="text-[#fff]">
                                  {" "}
                                  Make Payment
                                </span>
                              </button>
                            </div>
                          )}

                          <div className="  flex gap-x-3  overflow-hidden">
                            <button
                              onClick={() => {
                                showInvoiceData(val.marge_order_id);
                              }}
                              className="  items-center gap-1  px-1 py-1 flex bg-[#4CBBA1] text-[#fff]  cursor-pointer rounded-sm text-sm"
                            >
                              <IoDocumentAttachOutline />
                              Invoice
                            </button>
                            <button
                              onClick={() =>
                                showBillDetails(val.marge_order_id)
                              }
                              className="items-center gap-1 px-1 py-1 flex bg-[#4CBBA1] text-[#fff] cursor-pointer rounded-sm text-sm"
                            >
                              <IoPrintOutline />
                              Print
                            </button>

                            <button
                              className=" items-center gap-1  px-1 py-1 flex bg-[#a02828] text-[#fff]  cursor-pointer rounded-sm text-sm"
                              onClick={() => {
                                deleteOrder(val.marge_order_id);
                              }}
                            >
                              <FaRegTrashCan />
                              Cancel
                            </button>
                            <DeletModal
                              isOpen={isDeletOpen}
                              order_id={selectedOrderId}
                              onClose={closeModaldelete}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>

      {/*  Booked Table */}
      <DialogBox
        title={"View Booked Tables"}
        isOpen={cModal5}
        onClose={() => setCmodal5(false)}
      >
        <div className="mt-2">
          <div className="p-5 h-[700px]  overflow-y-scroll items-center">
            <div className="flex flex-wrap gap-x-6 gap-y-4 ">
              {bookTableData.length > 0 ? (
                bookTableData.map((val, index) => (
                  <div
                    key={val.tableid}
                    className="border-[#4CBBA1] border-[1px] w-auto rounded-md"
                  >
                    <div className="flex justify-between items-center gap-x-4 p-2">
                      <div>
                        <div className="flex flex-row items-center gap-x-5 mb-3 justify-between">
                          <div className="image w-[50px] h-[50px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                            >
                              <title>Dining Table</title>
                              <g id="Dining_Table" data-name="Dining Table">
                                <path
                                  d="M28.555,39.7,26.445,38.3A1,1,0,0,1,26,37.465V25H22V37.465a1,1,0,0,1-.445.832L19.445,39.7a1,1,0,0,0-.445.832V41a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1v-.465A1,1,0,0,0,28.555,39.7Z"
                                  id="id_101"
                                  style={{ fill: "rgb(76, 187, 161)" }}
                                ></path>
                                <rect
                                  x="9"
                                  y="19"
                                  width="29"
                                  height="4"
                                  rx="1"
                                  id="id_102"
                                ></rect>
                                <path
                                  d="M25,9.054V8h1a1,1,0,0,0,0-2H22a1,1,0,0,0,0,2h1V9.054A10.019,10.019,0,0,0,14.2,17H33.8A10.019,10.019,0,0,0,25,9.054Zm-2.3,4.087a6.026,6.026,0,0,0-3.462,2.205,1,1,0,0,1-1.588-1.217,8.036,8.036,0,0,1,4.617-2.941,1,1,0,1,1,.433,1.953Z"
                                  id="id_103"
                                ></path>
                                <path
                                  d="M47.5,16.679a1.994,1.994,0,0,0-1.5-.679H44.921A2,2,0,0,0,43,17.481l-2.587,9.662H34.244a2.99,2.99,0,0,0-2.894,2.25L31.065,30.5h0A2,2,0,0,0,33,33h.069l-1.931,7.758a1,1,0,0,0,.73,1.212.961.961,0,0,0,.242.03,1,1,0,0,0,.97-.758L35.127,33H42.3l1.826,8.217A1,1,0,0,0,45.1,42a1.018,1.018,0,0,0,.218-.024,1,1,0,0,0,.76-1.193l-1.764-7.936A3,3,0,0,0,46.375,30.4l1.608-12.132A2.005,2.005,0,0,0,47.5,16.679Z"
                                  id="id_104"
                                ></path>
                                <path
                                  d="M16.58,32.227a1.993,1.993,0,0,0,.357-1.727h0l-.286-1.106a2.988,2.988,0,0,0-2.893-2.25H7.593L5.006,17.481A2,2,0,0,0,3.08,16H1.994A2,2,0,0,0,.018,18.264L1.626,30.4a3,3,0,0,0,2.057,2.451L1.919,40.783a1,1,0,0,0,1.953.434L5.7,33h7.176l2.051,8.242A1,1,0,0,0,15.9,42a.961.961,0,0,0,.242-.03,1,1,0,0,0,.729-1.212L14.935,33h.07A1.981,1.981,0,0,0,16.58,32.227Z"
                                  id="id_105"
                                ></path>
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="w-[200px]">
                          <div className="flex">
                            <h1 className="text-nowrap w-28">Table Name:</h1>
                            <h1 className="text-nowrap">{val.tablename}</h1>
                          </div>
                          <div className="flex">
                            <h1 className="text-nowrap w-28">Seat:</h1>
                            <h1 className="text-nowrap">
                              {val.person_capicity}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>

                    {val.status === 1 ? (
                      <div className="w-full text-center py-3 px-4">
                        <button className="bg-[#bb4c4c] w-full text-[#fff] rounded-md cursor-none p-4">
                          Reserved
                        </button>
                      </div>
                    ) : (
                      <div className="w-full text-center py-3 px-4">
                        <button className="bg-[#4cbbb2] w-full text-[#fff] rounded-md cursor-none p-4">
                          Unbooked
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-10">
                  <h1 className="text-[#bb4c4c] text-lg">No Tables Booked</h1>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogBox>

      {/* UnBooked Table */}

      <DialogBox
        title={"View Unbooked Tables"}
        isOpen={cModal4}
        onClose={() => setCmodal4(false)}
      >
        <div className="mt-2">
          <div className="p-5 h-[700px] overflow-y-scroll">
            <div className="flex flex-wrap gap-6">
              {ubookedData.length > 0 ? (
                ubookedData.map((val, index) => (
                  <div
                    key={val.tableid}
                    className="border-[#4CBBA1] border-[1px] w-auto rounded-md"
                  >
                    <div className="flex justify-between items-center gap-x-4 p-2">
                      <div>
                        <div className="flex flex-row items-center gap-x-5 mb-3 justify-between">
                          <div className="image w-[50px] h-[50px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                            >
                              <title>Dining Table</title>
                              <g id="Dining_Table" data-name="Dining Table">
                                <path
                                  d="M28.555,39.7,26.445,38.3A1,1,0,0,1,26,37.465V25H22V37.465a1,1,0,0,1-.445.832L19.445,39.7a1,1,0,0,0-.445.832V41a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1v-.465A1,1,0,0,0,28.555,39.7Z"
                                  id="id_101"
                                  style={{ fill: "rgb(76, 187, 161)" }}
                                ></path>
                                <rect
                                  x="9"
                                  y="19"
                                  width="29"
                                  height="4"
                                  rx="1"
                                  id="id_102"
                                ></rect>
                                <path
                                  d="M25,9.054V8h1a1,1,0,0,0,0-2H22a1,1,0,0,0,0,2h1V9.054A10.019,10.019,0,0,0,14.2,17H33.8A10.019,10.019,0,0,0,25,9.054Zm-2.3,4.087a6.026,6.026,0,0,0-3.462,2.205,1,1,0,0,1-1.588-1.217,8.036,8.036,0,0,1,4.617-2.941,1,1,0,1,1,.433,1.953Z"
                                  id="id_103"
                                ></path>
                                <path
                                  d="M47.5,16.679a1.994,1.994,0,0,0-1.5-.679H44.921A2,2,0,0,0,43,17.481l-2.587,9.662H34.244a2.99,2.99,0,0,0-2.894,2.25L31.065,30.5h0A2,2,0,0,0,33,33h.069l-1.931,7.758a1,1,0,0,0,.73,1.212.961.961,0,0,0,.242.03,1,1,0,0,0,.97-.758L35.127,33H42.3l1.826,8.217A1,1,0,0,0,45.1,42a1.018,1.018,0,0,0,.218-.024,1,1,0,0,0,.76-1.193l-1.764-7.936A3,3,0,0,0,46.375,30.4l1.608-12.132A2.005,2.005,0,0,0,47.5,16.679Z"
                                  id="id_104"
                                ></path>
                                <path
                                  d="M16.58,32.227a1.993,1.993,0,0,0,.357-1.727h0l-.286-1.106a2.988,2.988,0,0,0-2.893-2.25H7.593L5.006,17.481A2,2,0,0,0,3.08,16H1.994A2,2,0,0,0,.018,18.264L1.626,30.4a3,3,0,0,0,2.057,2.451L1.919,40.783a1,1,0,0,0,1.953.434L5.7,33h7.176l2.051,8.242A1,1,0,0,0,15.9,42a.961.961,0,0,0,.242-.03,1,1,0,0,0,.729-1.212L14.935,33h.07A1.981,1.981,0,0,0,16.58,32.227Z"
                                  id="id_105"
                                ></path>
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="w-[200px]">
                          <div className="flex">
                            <h1 className="text-nowrap w-28">Table Name:</h1>
                            <h1 className="text-nowrap">{val.tablename}</h1>
                          </div>
                          <div className="flex">
                            <h1 className="text-nowrap w-28">Seat:</h1>
                            <h1 className="text-nowrap">
                              {val.person_capicity}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </div>

                    {val.status === 1 ? (
                      <div className="w-full text-center py-3 px-4">
                        <button className="bg-[#bb4c4c] w-full text-[#fff] rounded-md cursor-none p-4">
                          Reserved
                        </button>
                      </div>
                    ) : (
                      <div className="w-full text-center py-3 px-4">
                        <button className="bg-[#4cbbb2] w-full text-[#fff] rounded-md cursor-none p-4">
                          Unbooked
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-10">
                  <h1 className="text-[#bb4c4c] text-lg">No Tables Booked</h1>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogBox>

      <SplitModal
        title="Split Bill for Menu Items"
        isOpen={splitModal}
        onClose={() => closeModal()}
      >
        {/* div to show the menu item */}
        <div className="w-1/3">
          {splitData && splitData.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Menu Items</h2>
              <ul className="space-y-4">
                {splitData.map((item) => (
                  <li
                    key={item.row_id}
                    className="flex items-center justify-between gap-x-5 p-2 border-[1px] border-[#4CBBA1] rounded-md shadow-sm"
                  >
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        onChange={() => handleCheckboxChange(item)}
                        className="size-5 custom-checkbox "
                      />
                      <span className="text-gray-700">{item.ProductName}</span>
                    </label>
                    <div className="flex items-center space-x-6">
                      <span>Quantity: {item.menuqty}</span>
                      <span>Price: {parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No menu items available.</p>
          )}
        </div>
        <div className=" w-full">
          {/* Selected Items Section */}
          <div className="">
            <div>
              <h3 className="text-lg font-bold ">Selected Items</h3>
              <table className="min-w-full border-collapse border-[1px] border-[#4CBBA1]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-[1px] border-[#4CBBA1] p-2 text-left">
                      Product Name
                    </th>
                    <th className="border-[1px] border-[#4CBBA1] p-2 text-left">
                      Quantity
                    </th>
                    <th className="border-[1px] border-[#4CBBA1] p-2 text-left">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.row_id} className="border-b">
                      <td className="border-[1px] border-[#4CBBA1] p-2">
                        {item.ProductName}
                      </td>
                      <td className="border-[1px] border-[#4CBBA1] p-2">
                        {item.menuqty}
                      </td>
                      <td className="border-[1px] border-[#4CBBA1] p-2">
                        {parseFloat(item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <strong>Total: </strong>
              {selectedItems
                .reduce(
                  (acc, item) => acc + item.menuqty * parseFloat(item.price),
                  0
                )
                .toFixed(2)}
            </div>
            <button 
            onClick={(()=>{
              payForselecteditem()
            })}
            
            className="bg-[#0f044a]  text-[#fff] border-[2px] border-zinc-300 rounded-xl cursor-pointer p-3">
              Pay for Selected Items
            </button>
          </div>

          {/* Remaining Items Section */}
          <div className=" ">
            <h3 className="text-lg font-bold">Remaining Items</h3>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">
                    Product Name
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Quantity
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Price
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {remainingItems.map((item) => (
                  <tr key={item.row_id} className="border-b">
                    <td className="border border-gray-300 p-2">
                      {item.ProductName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.menuqty}
                    </td>
                    <td className="border border-gray-300 p-2">{item.price}</td>
                    <td className="border border-gray-300 p-2">
                      {(item.menuqty * parseFloat(item.price)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="3"
                    className="border border-gray-300 p-2 text-right"
                  >
                    <strong>Total:</strong>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {remainingItems
                      .reduce(
                        (acc, item) =>
                          acc + item.menuqty * parseFloat(item.price),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </SplitModal>

      <PaynmentDialogBox
        refreshOrderList={refreshOrderList}
        isOpen={paynmentModal}
        onClose={() => setPaynmentModal(false)}
        paymentData={[paymentData]}
        paymentMethod={paymentMethod}
      ></PaynmentDialogBox>

      <SplitPaynmentModal
        refreshOrderList={refreshOrderList}
        isOpen={mergepaynmentModal}
        onClose={() => setMergePaynmentModal(false)}
        paymentData={[selectedOrders]}
        paymentMethod={paymentMethod}
      ></SplitPaynmentModal>

 <SplitpayModal
  refreshOrderList={refreshOrderList}
  isOpen={splitpaynmentModal}
  onClose={() => setSplitPaynmentModal(false)}
  paymentData={[selectedItems]}
  paymentMethod={paymentMethod}
  Orderids={selecteSplitOrderid}
 
 
 
 >




 </SplitpayModal>



      <DuemergePaynmentModal
        refreshOrderList={refreshOrderList}
        isOpen={mergeduepaynmentModal}
        onClose={() => setMergeduepaynmentModal(false)}
        paymentData={[selectedDueOrders]}
        paymentMethod={paymentMethod}
      />

      <InvoiceDialogBox
        isOpen={invoiceDataModal}
        onClose={() => setInvoiceDataModal(false)}
        invoiceDatas={invoiceData}
        img={logo}
      ></InvoiceDialogBox>
      <div className=" hidden">
        <InvoiceDialogBox2 billData={billData} ref={componentRef} />
      </div>
    </>
  );
};

export default OnGoingOrder;
