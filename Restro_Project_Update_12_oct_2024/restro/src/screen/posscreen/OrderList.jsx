import React, { useEffect, useRef, useState, useContext } from "react";
import { json, NavLink } from "react-router-dom";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";
import { RiTodoLine } from "react-icons/ri";
import { IoMdCart } from "react-icons/io";
import { MdCropRotate } from "react-icons/md";
import { IoIosPersonAdd } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { CiCircleList } from "react-icons/ci";
import { FaKitchenSet, FaMagnifyingGlass } from "react-icons/fa6";
import { IoQrCodeOutline, IoPizzaOutline } from "react-icons/io5";
import { GiKnifeFork } from "react-icons/gi";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { IoIosMan } from "react-icons/io";
import { useReactToPrint } from "react-to-print";
import { MdTableBar, MdOutlineZoomInMap } from "react-icons/md";
import defaultimage from "../../assets/images/pizza.jpeg";
import { toast } from "react-toastify";
import useFullScreen from "../../components/useFullScreen";
import beepSound from '../../assets/beep.mp3';
import { MdOutlineCancelPresentation } from "react-icons/md";
import {
  FaHandHoldingUsd,
  FaNetworkWired,
  FaCalculator,
  FaMoneyCheck,
  FaKeyboard,
  FaRegTrashAlt,
} from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa6";
import DialogBoxSmall from "../../components/DialogBoxSmall";
import axios from "axios";
import DialogBox from "../../components/DialogBox";
import TableDialogBox from "../../components/TableDialogBox";
import AddonDialogBox from "../../components/AddonDialogBox";
import { ComponentToPrint } from "../../components/ComponentToPrint";
import CompleteOrderDialogBox from "../../components/CompleteOrderDialogBox";
import { ComponentToPrintInvoice } from "../../components/ComponentToPrintInvoice";
import { PrintToKitchenPrinter } from "../../components/PrintToKitchenPrinter";
import { AuthContext } from "../../store/AuthContext";
import CashRegisterModel from "../../components/CashRegisterModel";
import DraftOrder from "./DraftOrder";
// Total Data
const DataTable = ({ total, vat, subtotal }) => {
  return (
    <div className="bg-[#4CBBA1] mb-4 rounded-sm">
      <div className=" flex justify-between p-2 flex-wrap items-center text-white">
        <div className="heading">
          <h1>Subtotal</h1>
          <h1>VAT</h1>
          <h1>Total</h1>
        </div>
        <div>
          <h1 className=" font-semibold w-[100px] text-center">$ {subtotal}</h1>
          <h1 className=" font-semibold w-[100px] text-center">$ {vat}</h1>
          <h1 className=" font-semibold w-[100px] text-center">$ {total}</h1>
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ message, children }) => {
  return (
    <div className="group relative flex">
      {children}
      <span className="absolute bottom-5 right-1 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
        {message}
      </span>
    </div>
  );
};

const OrderButtons = [
  { id: 1, title: "New Order", icon: <MdCropRotate />, link: "/order-list" },
  {
    id: 2,
    title: "On Going Order",
    icon: <CiSaveDown2 />,
    link: "/ongoing-order",
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

const OrderList = ({ setIsCashRegisterOpen }) => {
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const { token } = useContext(AuthContext);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  // Food Card
  const Card = ({ image, title, val }) => {
    const capitalizeFirstLetter = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    return (
      <div className="m-3 rounded-lg overflow-hidden shadow-sm  px-3 shadow-[#FF8100] border-[1px] border-[#FF8100]">
        <div
          onClick={() => {
            addProductToCart(val);
            console.log("MENUDATA ", menuData);
          }}
          className="p-3 w-full"
        >
          <div className="flex justify-center mb-3">
            <img
              onError={handleImageError}
              src={`${VITE_IMG_URL}${image}`}
              alt="Product Image"
              className="rounded-xl h-[80px] w-[100px]"
            />
          </div>
          <div className="text-center">
            <div className="font-semibold text-nowrap overflow-hidden mb-2">
              {capitalizeFirstLetter(title)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const defaultImage = defaultimage;
 
 const[orders,setOrders]=useState([])

  const [isOpen, setOpen] = useState(false);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
  const [cModal, setCmodal] = useState(false);
  const [cModal2, setCmodal2] = useState(false);
  const [cModal3, setCmodal3] = useState(false);
  const [cModal4, setCmodal4] = useState(false);
  const [cModal5, setCmodal5] = useState(false);
  const [cModal7, setCmodal7] = useState(false);
  const[cModal8,setCmodal8]=useState(false);
  const [cModal9, setCmodal9] = useState(false);
  const [customer, setCustomer] = useState([]);
  const [customerType, setCustomerType] = useState([]);
  const [Categories, setCategory] = useState([]);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [serviceChargeAmount, setServiceChargeAmount] = useState(0);
  const [menuData, setMenuData] = useState([]);
  const [floorData, setFloorData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, SetSubtotal] = useState([]);
  const [tableId, setTableid] = useState([]);
  const [searchName, setSearchName] = useState("");
  //selected addon
  //kitchen to print
  const [selectAddone, setSelectAddone] = useState([]);
  // Add-One Modal if data is Avilable

  const [cModal6, setCmodal6] = useState(false);

  const [addOneData, setAddOneData] = useState({
    productvat: "",
    ProductName: "",
    price: "",
    variants: [],
    addons: [],
    quantity: 1,
  });
  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };
  // place order data
  const [waiterName, setWaiterName] = useState("Please Select");
  const [customerTypeName, setCustomerTypeName] = useState("Dine-in Customer");
  const [tableName, setTableName] = useState("Select Table");
  const [selectCustomerName, setSelectCustomerName] = useState("Walkin");

  const [customerName, setCustomerName] = useState(1);
  const [selectCustomerType, setSelectCustomerType] = useState(1);
  const [waiter, setWaiter] = useState(null);
  const [selectTable, setSelectTable] = useState(null);
  const [vat, setVat] = useState(null);

  const [orderDetail, setOrderDetail] = useState([]);

  const [formData, setFormdata] = useState({
    customer_name: "",
    customer_email: "",
    customer_address: "",
    customer_phone: "",
  });

  const [WaiterData, setWaiterData] = useState([]);
  const [placeOrderData, setPlaceOrderData] = useState({
    customer_id: "",
    customer_type: "",
    waiter_id: "",
    table_id: "",
    order_details: [],
    grand_total: 0,
    service_charge: 0,
    discount: 0,
    VAT: 0,
  });
  //
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]);

  // working of escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setInvoiceModal(false);
        setCmodal(false);
        setCmodal2(false);
        setCmodal3(false);
        setCmodal4(false);
        setCmodal5(false);
        setCmodal6(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
 


  const playBeep=()=>{
   const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3');
audio.play();

   
  }


// const playBeep = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/soundsetting`);
//     const data = response.data.data[0];
//     const beepSoundPath = data.nofitysound;
//     const beepSoundURL = `${API_BASE_URL}/${beepSoundPath.replace(/\\/g, '/')}`;

//     console.log('Beep Sound URL:', beepSoundURL); // Debug: Log the URL
    
//     const audio = new Audio(beepSoundURL);
//     await audio.play();
//   } catch (error) {
//     console.error('Error fetching or playing beep sound:', error);
//   }
// };

// place Order function
  const  handlePlaceOrder = () => {
    if (!(customerType && customerName && waiter && cart.length > 0)) {
      if (cart.length === 0) {
        toast.error("Please add data to cart.");
        return;
      }
      if (!customerName) {
        toast.error("Please select a customer.");
        return;
      }
      if (!selectCustomerType) {
        toast.error("Please select a customer type.");
        return;
      }
      if (!waiter) {
        toast.error("Please select a waiter.");
        return;
      }
    } else {
      if (
        (selectCustomerType === 1 || selectCustomerType === 99) &&
        !selectTable
      ) {
        toast.error("Please select a table for the selected customer type.");
        return;
      }

      const updatedOrderData = {
        customer_id: customerName,
        customer_type: selectCustomerType,
        waiter_id: waiter || null,
        table_id: selectTable || null,
        order_details: orderDetail,
        grand_total: total,
        service_charge: serviceChargeAmount,
        discount: 0,
        VAT: vat || 0.0,
      };

      setPlaceOrderData(updatedOrderData);

      if (!navigator.onLine) {
        // Save order locally
        const offlineOrders =
          JSON.parse(localStorage.getItem("offlineOrders")) || [];
        offlineOrders.push(updatedOrderData);
        localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders));

        toast.warning("You are offline. Order saved locally.");
        resetOrderForm();
        return;
      }

      // Handle online order
      axios
        .post(`${API_BASE_URL}/orderplace`, updatedOrderData, {
          headers: { Authorization: token },
        })
        .then((res) => {
          if (res.data.message === "Order placed successfully") {
            console.log(updatedOrderData)
            playBeep();
            toast.success("Order placed successfully!");
            setInvoiceModal(true);
            setInvoiceData([res.data]);
            resetOrderForm();
          } else {
            toast.error("Failed to place order: " + res.data.message);
          }
        })
        .catch((error) => {
          toast.error("Error placing order: " + error.message);
        });
    }
  };

  const syncOfflineOrders = async () => {
    let offlineOrders = JSON.parse(localStorage.getItem("offlineOrders")) || [];
    if (offlineOrders.length === 0) {
      toast.info("No offline orders to sync.");
      return;
    }

    for (let i = 0; i < offlineOrders.length; i++) {
      const order = offlineOrders[i];
      try {
        const response = await axios.post(`${API_BASE_URL}/orderplace`, order, {
          headers: { Authorization: token },
        });
        if (response.data.message === "Order placed successfully") {
          console.log("Offline order synced:", order);

          // Remove synced order
          offlineOrders.splice(i, 1);
          i--; // Adjust index after removal
          localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders));
        } else {
          console.error("Error syncing order:", response.data.message);
          break; // Stop syncing to retry later
        }
      } catch (error) {
        console.error("Error syncing offline order:", error.message);
        break; // Stop syncing to retry later
      }
    }

    if (offlineOrders.length === 0) {
      localStorage.removeItem("offlineOrders");
      toast.success("All offline orders synced successfully!");
    }
  };

  useEffect(() => {
    const handleOffline = () => {
      toast.warning("You are offline. Orders will be saved locally.");
    };

    const handleOnline = () => {
      toast.info("You are online. Syncing offline orders...");
      syncOfflineOrders();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);



  const resetOrderForm = () => {
    setCart([]);
    setTotal(0);
    setOrderDetail([]);
    setServiceCharge(0);
    setSelectCustomerName("Walkin");
    setSelectCustomerType(1);
    setCustomerName(1);
    setWaiter(null);
    setSelectTable(null);
    getallTable();
    setWaiterName("Please Select");
    setTableName("Select Table");
    setVat(0);
  };

  const addProductToCart = (val) => {

    if (val.addons.length > 0 || val.variants.length > 1) {
      openAddons(val);
    } else {
      let findProductInCart = cart.find((i) => {
        return (
          i.ProductsID === val.ProductsID &&
          i.variantid === val.variants[0].variantid
        );
      });

      console.log("Price:", val.variants[0].price);
      if (findProductInCart) {
        let newCart = cart.map((cartItem) => {
          if (
            cartItem.ProductsID === val.ProductsID &&
            cartItem.variantid === val.variants[0].variantid
          ) {
            let newQuantity = cartItem.quantity + 1;
            return {
              ...cartItem,
              quantity: newQuantity,
              totalAmount: cartItem.price * newQuantity,
              variantName: val.variants[0].variantName, // Ensure correct variant name
            };
          } else {
            return cartItem;
          }
        });
        setCart(newCart);
      } else {
        let addingProduct = {
          ...val,
          ProductsID: val.ProductsID,
          productvat: val.productvat,
          variantid: val.variantid || val.variants[0].variantid,
          variantName: val.variants[0].variantName || val.variants[0].variant,

          menuid: val.menuid,
          quantity: val.quantity || 1,
          totalAmount:
            (val.price || val.variants[0].price) * (val.quantity || 1),
          ProductName: val.ProductName,
          price: val.price || val.variants[0].price,
          addons: val.checkedaddons || [],
        };
        setCart([...cart, addingProduct]);
        setOrderDetail([...orderDetail, addingProduct]);
      }
    }
  };

  const handleAddOnSubmit = () => {
    let findProductInCart = cart.find(
      (i) =>
        i.ProductName === addOneData.ProductName &&
        i.variantid === addOneData.variantid
    );

    if (findProductInCart) {
 
      let newCart = cart.map((cartItem) => {
        if (
          cartItem.ProductName === addOneData.ProductName &&
          cartItem.variantid === addOneData.variantid
        ) {
          let newQuantity = cartItem.quantity + addOneData.quantity;

          let updatedCheckedAddons = cartItem.checkedaddons.map((addon) => {
            let matchingAddon = addOneData.checkedaddons.find(
              (newAddon) => newAddon.add_on_name === addon.add_on_name
            );

            if (matchingAddon) {
              return {
                ...addon,
                add_on_quantity:
                  addon.add_on_quantity + matchingAddon.add_on_quantity,
              };
            } else {
              return addon;
            }
          });

          addOneData.checkedaddons.forEach((newAddon) => {
            if (
              !cartItem.checkedaddons.find(
                (addon) => addon.add_on_name === newAddon.add_on_name
              )
            ) {
              updatedCheckedAddons.push(newAddon);
            }
          });

          let addonTotal = updatedCheckedAddons.reduce((acc, addon) => {
            return acc + addon.add_on_price * addon.add_on_quantity;
          }, 0);

          return {
            ...cartItem,
            quantity: newQuantity,
            checkedaddons: updatedCheckedAddons,
            totalAmount: cartItem.price * newQuantity + addonTotal,
            variantName: addOneData.variantName, // Ensure correct variant name is set here
          };
        } else {
          return cartItem;
        }
      });

      setCart(newCart);
    } else {
      let addonTotal = addOneData.checkedaddons.reduce((acc, addon) => {
        return acc + addon.add_on_price * addon.add_on_quantity;
      }, 0);

      let addingProduct = {
        ...addOneData,
        totalAmount: addOneData.price * addOneData.quantity + addonTotal,
        addons: addOneData.checkedaddons || [],
        variantName: addOneData.variantName, // Ensure variant name is added here
      };

      setCart([...cart, addingProduct]);
      setOrderDetail([...orderDetail, addingProduct]);
    }

    setCmodal6(false);
  };

  const increaseQuantity = (productId, variantid) => {
    let newCart = cart.map((cartItem) => {
      if (
        cartItem.ProductsID === productId &&
        cartItem.variantid === variantid
      ) {
        let newQuantity = cartItem.quantity + 1;

        let addonTotal = (cartItem.checkedaddons || []).reduce((acc, addon) => {
          return acc + addon.add_on_price * addon.add_on_quantity;
        }, 0);

        let newTotalAmount = cartItem.price * newQuantity + addonTotal;

        return {
          ...cartItem,
          quantity: newQuantity,
          totalAmount: newTotalAmount,
        };
      } else {
        return cartItem;
      }
    });
    setCart(newCart);
  };

  const decreaseQuantity = (productId, variantid) => {
    let newCart = cart.map((cartItem) => {
      if (
        cartItem.ProductsID === productId &&
        cartItem.variantid === variantid &&
        cartItem.quantity > 1
      ) {
        let newQuantity = cartItem.quantity - 1;

        let addonTotal = (cartItem.checkedaddons || []).reduce((acc, addon) => {
          return acc + addon.add_on_price * addon.add_on_quantity;
        }, 0);

        let newTotalAmount = cartItem.price * newQuantity + addonTotal;

        return {
          ...cartItem,
          quantity: newQuantity,
          totalAmount: newTotalAmount,
        };
      } else {
        return cartItem;
      }
    });
    setCart(newCart);
  };

  useEffect(() => {
    let subTotal = cart.reduce((val, item) => {
      return val + item.totalAmount;
    }, 0);

    let totalVAT = cart.reduce((vat, item) => {
      return (
        vat + item.quantity * ((item.productvat * item.price) / 100).toFixed(2)
      );
    }, 0);

    let newTotalAmount = subTotal + totalVAT;

    SetSubtotal(parseFloat(subTotal).toFixed(2));
    setVat(parseFloat(totalVAT).toFixed(2));
    setTotal(newTotalAmount);
  }, [cart]);

  useEffect(() => {
    let totalServiceCharge = ((subtotal * serviceCharge) / 100).toFixed(2);

    setServiceChargeAmount(totalServiceCharge);

    const allTotal = (
      parseFloat(subtotal) +
      parseFloat(totalServiceCharge) +
      parseFloat(vat)
    ).toFixed(2);
    setTotal(allTotal);
  }, [serviceCharge, subtotal, vat]);

  const removeProduct = (val) => {
    const newCart = cart.filter(
      (cartItem) =>
        cartItem.ProductsID !== val.ProductsID ||
        cartItem.variantid !== val.variantid
    );
    setCart(newCart);
  };
  const show = (index) => {
    setOpenSubmenuIndex(index === openSubmenuIndex ? null : index);
  };

  const handleChange = (e) => {
    setAddOneData({ ...addOneData, [e.target.name]: e.target.value });
  };

  const openAddons = (val) => {
    setSelectAddone([]); // Clear selected add-ons after 1 time selected
    const initialPrice = val.variants.length > 0 ? val.variants[0].price : "";

    setAddOneData((prevData) => ({
      ...prevData,
      ProductsID: val.ProductsID,
      productvat: val.productvat,
      ProductName: val.ProductName,
      price: initialPrice,
      variants: [...val.variants],
      addons: [...val.addons],
      quantity: 1,
      variantid: val.variants.length > 0 ? val.variants[0].variantid : "",
      variantName: val.variants.length > 0 ? val.variants[0].variantName : "",
      checkedaddons: selectAddone,
      kitchenid: val.kitchenid,
      kitchen_name: val.kitchen_name,
      ip_address: val.ip_address,
      port: val.port,
    }));
    setCmodal6(true);
  };

  const handleaddonchange = (e, index) => {
    const { value, checked } = e.target;
    const updatedAddons = checked
      ? [
          ...selectAddone,
          {
            add_on_id: addOneData.addons[index].add_on_id,
            add_on_name: value,
            add_on_price: addOneData.addons[index].price,
            add_on_quantity: 1,
          },
        ]
      : selectAddone.filter((addon) => addon.add_on_name !== value);

    setSelectAddone(updatedAddons);
  };

  const handleaddonQuantityChange = (e, index) => {
    const { value } = e.target;
    const updatedAddons = selectAddone.map((addon) =>
      addon.add_on_name === addOneData.addons[index].add_on_name
        ? { ...addon, add_on_quantity: parseInt(value, 10) }
        : addon
    );

    setSelectAddone(updatedAddons);
  };

  const handleVariantChange = (event) => {
    const selectedVariantName = event.target.value;
    const selectedVariant = addOneData.variants.find(
      (variant) => variant.variantName === selectedVariantName
    );

    // Update the variant information in addOneData
    if (selectedVariant) {
      setAddOneData((prevData) => ({
        ...prevData,
        price: selectedVariant.price,
        variantid: selectedVariant.variantid,
        variantName: selectedVariant.variantName,
      }));
    }
  };

  const handleQuantityChange = (event) => {
    const { value } = event.target;
    setAddOneData((prevData) => ({
      ...prevData,
      quantity: parseInt(value, 10),
    }));
  };

  useEffect(() => {
    setAddOneData((prevData) => ({
      ...prevData,
      checkedaddons: selectAddone,
    }));
  }, [selectAddone]);

  const handelReactToPrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handelReactToPrint3 = useReactToPrint({
    content: () => componentRef3.current,
  });

  const handleprewiew = () => {
    handelReactToPrint();
  };

  const componentRef = useRef();
  const componentRef2 = useRef();
  const componentRef3 = useRef();
  // print invoice

  const handelReactToPrint2 = useReactToPrint({
    content: () => componentRef2.current,
    onBeforeGetContent: () => {
      if (isFullScreen) {
        document.exitFullscreen(); // Ensure fullscreen exits before printing
      }
    },
    onAfterPrint: () => {
      if (isFullScreen) {
        document.documentElement.requestFullscreen(); // Re-enter fullscreen if needed
      }
    },
  });
  const [showPrintComponent, setShowPrintComponent] = useState(false);
  const handlePrintInvoice = () => {
    setShowPrintComponent(true);
    console.log("invoice data to print", invoiceData);
    setTimeout(() => {
      handelReactToPrint2(); // Trigger the print
      setInvoiceModal(false); // Close modal after printing
    }, 100);
  };

  const handelChange = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const submitAddcustomer = (e) => {
    e.preventDefault();
    axios
      .post(`${API_BASE_URL}/customer`, formData)
      .then((res) => {
        console.log(res.data);
        setCmodal(false);
        toast.success("Customer sucessfully added");
        getCustomer();
        setFormdata("");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCategoryMenu = () => {
    axios
      .get(`${API_BASE_URL}/getCategoryList`)
      .then((res) => {
        console.log(res.data.data);
        setCategory(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCustomer = () => {
    axios
      .get(`${API_BASE_URL}/customer`)
      .then((res) => {
        console.log(res.data.data);
        setCustomer(res.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCustomerType = () => {
    axios
      .get(`${API_BASE_URL}/customertype`)
      .then((res) => {
        console.log(res.data);
        setCustomerType(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const   showMenudata = (categoryId) => {
    if (categoryId) {
      axios
        .get(`${API_BASE_URL}/products`, {
          params: { categoryId },
        })
        .then((res) => {
          console.log(res.data);
          setMenuData(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      axios
        .get(`${API_BASE_URL}/products`)
        .then((res) => {
          console.log(res.data);
          setMenuData(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // filter api

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchName(value);

    if (value.trim() === "") {
      showMenudata();
      return;
    }

    axios
      .get(`${API_BASE_URL}/products`, {
        params: { searchTerm: value },
      })
      .then((res) => {
        setMenuData(res.data.length > 0 ? res.data : []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Item Not Available");
      });
  };

  const getallTable = () => {
    axios
      .get(`${API_BASE_URL}/table`)
      .then((res) => {
        setTableData(res.data.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cant show table");
      });
  };

  const getWaiter = () => {
    axios
      .get(`${API_BASE_URL}/getWaiter`)
      .then((res) => {
        console.log(res.data);
        setWaiterData(res.data);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error in getting waiter");
      });
  };


  const rcenttransaction=()=>{
    axios.get(`${API_BASE_URL}/transaction`,{
      headers: { Authorization: token },
    })
    .then((res) => {
      setOrders(res.data.data)
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error in getting transaction");
        });
  }

//  const handleholdOrder=()=>{
//   console.log("Hold data ")

//  }



 // place Order function
 const handleholdOrder = () => {
  if (!(customerType && customerName && waiter && cart.length > 0)) {
    if (cart.length === 0) {
      toast.error("Please add data to cart.");
      return;
    }
    if (!customerName) {
      toast.error("Please select a customer.");
      return;
    }
    if (!selectCustomerType) {
      toast.error("Please select a customer type.");
      return;
    }
    if (!waiter) {
      toast.error("Please select a waiter.");
      return;
    }
  } else {
    if (
      (selectCustomerType === 1 || selectCustomerType === 99) &&
      !selectTable
    ) {
      toast.error("Please select a table for the selected customer type.");
      return;
    }

    const updatedOrderData = {
      customer_id: customerName,
      customer_type: selectCustomerType,
      waiter_id: waiter || null,
      table_id: selectTable || null,
      order_details: orderDetail,
      grand_total: total,
      service_charge: serviceChargeAmount,
      discount: 0,
      VAT: vat || 0.0,
    };

    setPlaceOrderData(updatedOrderData);

    if (!navigator.onLine) {
      // Save order locally
      const offlineOrders =
        JSON.parse(localStorage.getItem("offlineOrders")) || [];
      offlineOrders.push(updatedOrderData);
      localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders));

      toast.warning("You are offline. Order saved locally.");
      resetOrderForm();
      return;
    }

    // Handle online order
    axios
      .post(`${API_BASE_URL}/holdorder`, updatedOrderData, {
        headers: { Authorization: token },
      })
      .then((res) => {
        if (res.data.message === "Order placed successfully") {
          playBeep();
          console.log("Hold",updatedOrderData)
          toast.success("Order save in draft!");
          // setInvoiceModal(true);
          // setInvoiceData([res.data]);
          resetOrderForm();
        } else {
          toast.error("Failed to place order: " + res.data.message);
        }
      })
      .catch((error) => {
        toast.error("Error placing order: " + error.message);
      });
  }
};

const syncOfflineOrdershold = async () => {
  let offlineOrders = JSON.parse(localStorage.getItem("holdofflineOrders")) || [];
  if (offlineOrders.length === 0) {
    toast.info("No offline orders to sync.");
    return;
  }

  for (let i = 0; i < offlineOrders.length; i++) {
    const order = offlineOrders[i];
    try {
      const response = await axios.post(`${API_BASE_URL}/orderplace`, order, {
        headers: { Authorization: token },
      });
      if (response.data.message === "Order placed successfully") {
        console.log("Offline order synced:", order);

        // Remove synced order
        offlineOrders.splice(i, 1);
        i--; // Adjust index after removal
        localStorage.setItem("holdofflineOrders", JSON.stringify(offlineOrders));
      } else {
        console.error("Error syncing order:", response.data.message);
        break; // Stop syncing to retry later
      }
    } catch (error) {
      console.error("Error syncing offline order:", error.message);
      break; // Stop syncing to retry later
    }
  }

  if (offlineOrders.length === 0) {
    localStorage.removeItem("offlineOrders");
    toast.success("All offline orders synced successfully!");
  }
};

useEffect(() => {
  const handleOffline = () => {
    toast.warning("You are offline. Orders will be saved locally.");
  };

  const handleOnline = () => {
    toast.info("You are online. Syncing offline orders...");
    syncOfflineOrdershold();
  };

  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnline);

  // Cleanup listeners on component unmount
  return () => {
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  };
}, []);










  useEffect(() => {
    getCustomer();
    getCategoryMenu();
    getCustomerType();
    showMenudata();

    getallTable();
    getWaiter();
    rcenttransaction();
  }, []);
  return (
    <>
      <div className=" main_div flex gap-x-6 ">
        <section className=" side_section min-h-screen bg-[#1C1D3E]">
          <div className=" pt-5  pl-4 ">
            <header className=" text-white  m-auto  ">
              <Hamburger toggled={isOpen} toggle={setOpen} />
            </header>
          </div>

          <div className={`${isOpen == false ? "hidden" : ""}`}>
            <Nav />
          </div>

          <nav className={`${!isOpen == false ? "hidden" : ""}`}>
            <div className="bg-[#1C1D3E] text-nowrap text-zinc-100  p-5 pt-8 h-screen overflow-y-auto">
              <h1
                onClick={() => {
                  showMenudata();
                }}
                className=" mt-6 font-semibold text-xl mb-11 cursor-pointer"
              >
                All CATEGORIES
              </h1>

              {Categories.map((items, index) => (
                <ul key={index}>
                  <li
                    onClick={() => {
                      showMenudata(items.CategoryID), show(index);
                    }}
                    className="text-lg flex items-center gap-x-2 cursor-pointer p-2 hover:bg-[#4CBBA1] hover:scale-110 duration-150 rounded-md mt-6"
                    // onClick={() => }
                  >
                    <span
                      onClick={() => {
                        showMenudata(items.CategoryID);
                      }}
                      className="text-2xl"
                    >
                      <GiKnifeFork />
                    </span>
                    <span className="flex-1">
                      <NavLink
                        onClick={() => {
                          showMenudata(items.CategoryID);
                        }}
                      >
                        {items.CategoryName}
                      </NavLink>
                    </span>
                    {items.children && items.children.length > 0 && (
                      <FaCaretDown
                        onClick={() => {
                          showMenudata(items.CategoryID);
                        }}
                        className={`${
                          openSubmenuIndex === index && open ? "rotate-180" : ""
                        } duration-500`}
                      />
                    )}
                  </li>

                  {items.children &&
                    items.children.length > 0 &&
                    openSubmenuIndex === index &&
                    open && (
                      <ul className="ml-8 rounded-sm">
                        {items.children.map((subItem, subIndex) => (
                          <li
                            key={subIndex}
                            className="duration-500 text-sm flex items-center gap-x-2 cursor-pointer p-2 rounded-md mt-2 hover:scale-125"
                          >
                            <NavLink
                              onClick={() => {
                                showMenudata(items.children.CategoryID);
                              }}
                              className="hover:text-[#4cddA1] active"
                            >
                              {subItem.CategoryName}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                </ul>
              ))}
            </div>
          </nav>
        </section>

        {/* if (!navigator.onLine) {
        // Save order locally
        const offlineOrders =
          JSON.parse(localStorage.getItem("offlineOrders")) || [];
        offlineOrders.push(updatedOrderData);
        localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders));
  
        toast.warning("You are offline. Order saved locally.");
        resetOrderForm();
        return;
      } */}

        {/* Heading Button */}
        <section className="middel_section flex gap-x-6 ">
          <div className="order">
            <div className="  ">
              <div className="orderButton flex gap-y-3 flex-wrap mb-6 pt-2">
                {OrderButtons.map((val, index) => (
                  <div
                    className={`w-1/3 `}
                    key={index}
                  >
                    <NavLink
                      to={val.link}
                      className={({ isActive }) =>
                        `h-[60px] font-semibold w-full px-7 py-3 border-[2px] rounded-md flex justify-center items-center gap-3 ${
                          isActive
                            ? "bg-[#4CBBA1] text-white border-[#4CBBA1]"
                            : "bg-[#1C1D3E] text-[#fff] border-zinc-300 hover:bg-[#4CBBA1]"
                        } ${
                          !navigator.onLine || index === 2
                            ? "cursor-not-allowed pointer-events-none opacity-50"
                            : ""
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
            {/* Search Box */}
            <div className="flex m-auto  items-center px-6 py-2  rounded-md border-[1px] border-gray-900">
              <button className="px-4 text-[#0f044a] text-sm">
                <FaMagnifyingGlass />
              </button>
              <input
                value={searchName}
                onChange={handleSearch}
                placeholder="Search product..."
                type="search"
                className="w-full px-4 py-2 text-gray-700 leading-tight focus:outline-none"
              />
              {/* <button 
              onClick={handleSearch}
              className="text-[#fff] hover:scale-105 duration-100 bg-[#4CBBA1] rounded-md   cursor-pointer  px-3  py-1">
                Search
              </button> */}
            </div>

            {/*  Card Section */}
            <div className=" h-screen overflow-y-auto">
              <div className=" grid  grid-cols-5">
                {menuData.map((val, index) => (
                  <>
                    <div key={index} className="rounded-xl mt-6">
                      <Card
                        val={val}
                        image={val.ProductImage}
                        title={val.ProductName}
                      />
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2">
            {/* bitton data */}
            <div>
              <div className="orderButton">
                <div className="">
                  <div className="grid  grid-cols-5 ">
                    <button className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
                      <div className=" flex flex-row justify-center items-center   gap-x-1 ">
                        <button
                          onClick={() => {
                            setCmodal(true);
                          }}
                          className=" font-semibold  text-2xl   text-[#fff] cursor-pointer "
                        >
                          <IoIosPersonAdd />
                        </button>
                        <span>|</span>

                        <button
                          onClick={() => {
                            setCmodal2(true);
                          }}
                          className=" font-semibold   text-2xl   text-[#fff]   cursor-pointer "
                        >
                          <CiCircleList />
                        </button>
                      </div>
                      <span
                        onClick={() => {
                          setCmodal(true);
                        }}
                        className=" text-sm"
                      >
                        Add Cust.
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setCmodal3(true);
                      }}
                      className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
                    >
                      {" "}
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span className=" flex gap-x-2">
                          <TfiHeadphoneAlt />
                          <span className=" text-red-600  font-bold"> *</span>
                        </span>{" "}
                        Order type
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCmodal4(true);
                      }}
                      className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
                    >
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span className=" flex gap-x-2">
                          <IoIosMan />
                          <span className=" text-red-600  font-bold"> *</span>
                        </span>{" "}
                        Waiter
                      </div>
                    </button>

                    <button onClick={() => setCmodal7(true)} className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                         <MdOutlineCancelPresentation />
                        </span>{" "}
                       CloseReg.
                      </div>
                    </button>

                    <button
                      onClick={toggleFullScreen}
                      className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
                    >
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                          <MdOutlineZoomInMap onClick={toggleFullScreen} />
                        </span>{" "}
                        Zoom
                      </div>
                    </button>

                    <button
                      onClick={() => setCmodal5(true)}
                      className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
                    >
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                          <MdTableBar />
                        </span>{" "}
                        TableMgmt
                      </div>
                    </button>

                    <button   className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                          <FaMoneyCheck />
                        </span>{" "}
                        CashReg.
                      </div>
                    </button>

                    <button className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                          <FaCalculator />
                        </span>{" "}
                        Calculator
                      </div>
                    </button>

                    <button 
                     onClick={() => setCmodal9(true)}
                    
                    className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                          <FaHandHoldingUsd />
                        </span>{" "}
                        Hold
                      </div>
                    </button>

                    <button
                      onClick={() => setCmodal8(true)}
                     className=" font-semibold  w-full h-full bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
                      <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                        <span>
                          <FaNetworkWired />
                        </span>{" "}
                        Transaction
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Shopping type */}
            <section className="bg-white mt-3 p-1">
              <div className=" flex justify-between bg-emerald-50  leading-10">
                <h1 className=" text-center font-semibold">
                  Customer Name
                  <br />
                  <span className=" overflow-hidden text-sm">
                    {selectCustomerName}
                  </span>
                </h1>
                <h1 className=" text-center font-semibold">
                  Customer type <br />
                  <span className=" overflow-hidden text-sm">
                    {customerTypeName}
                  </span>
                </h1>
                <h1 className=" text-center font-semibold">
                  Waiter Name <br />
                  <span className=" overflow-hidden text-sm">
                    {" "}
                    {waiterName}
                  </span>
                </h1>

                <h1 className=" text-center font-semibold">
                  {" "}
                  Table
                  <br />
                  <span className=" overflow-hidden text-sm ">{tableName}</span>
                </h1>
              </div>
            </section>
            
            {/* Product data in cart */}
            <div className="table border-[1px] shadow-[#FF8100]  mt-5 w-full border-[#FF8100]  rounded-sm shadow-sm">
              <div className="h-[500px] overflow-y-auto">
                <div className="flex justify-between  items-center py-4 px-3 rounded-sm border-b-[1px] border-green-200 m-3 shadow-sm shadow-green-400 bg-gray-100 font-bold">
                  <span className="w-[100px] text-nowrap">Product</span>
                  <span className="w-[50px] text-center">Price</span>
                  <span className="w-[50px] text-center">Quantity</span>
                  <span className="w-[50px] text-center">Action</span>
                </div>
                {console.log("Cart data", cart)}
                {cart && cart.length > 0 ? (
                  cart.map((val, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center py-4 px-3 rounded-sm border-[1px] border-green-200 m-3 shadow-sm shadow-green-400">
                        <span className="w-[100px] text-nowrap">
                          {val.ProductName} <br />
                          {val.variantName ? (
                            <span> ({val.variantName})</span>
                          ) : (
                            <span>({val.variants[0].variantName})</span>
                          )}
                        </span>

                        <span className="w-[50px] text-center">
                          {val.price}
                        </span>
                        <div className="flex items-center gap-x-2">
                          <button
                            className="w-[20px] rounded-sm text-md bg-[#1C1D3E] text-white text-center"
                            onClick={() =>
                              increaseQuantity(val.ProductsID, val.variantid)
                            }
                          >
                            +
                          </button>
                          <span>{val.quantity}</span>
                          <button
                            className="w-[20px] rounded-sm text-md bg-[#1C1D3E] text-white text-center"
                            onClick={() =>
                              decreaseQuantity(val.ProductsID, val.variantid)
                            }
                          >
                            -
                          </button>
                        </div>
                        <Tooltip message="Remove">
                          <button onClick={() => removeProduct(val)}>
                            <FaRegTrashAlt className="text-red-600 font-bold cursor-pointer" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className=" text-center">No Item In Cart</p>
                )}
              </div>
     
              <section className=" billing p-2">
                <div className="">
                  <DataTable total={total} vat={vat} subtotal={subtotal} />
                </div>
              </section>
            </div>
            {/* Service  charge */}
            <section className=" mt-2">
              <div className="flex gap-x-5 justify-center items-center">
                <label className="block  text-nowrap mb-2 text-sm font-bold  text-gray-700">
                  Service Charge :
                </label>
                <input
                  placeholder="0.00 %"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  min={0.0}
                  max={100}
                  type="number"
                  name="productvat"
                  className="shadow w-full outline-none appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </section>
            {/* Orders Button */}



            <section className="PreviewButton flex justify-center items-center mt-3 gap-4">
              <div className="flex  gap-2">
                <button
                  onClick={handleprewiew}
                  className={`h-[51px] w-[146px] bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md px-7 py-3 ${
                    cart.length == 0 ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  disabled={cart.length == 0}
                >
                  Preview
                </button>

                {total !== 0 ? (
                  <button
                    onClick={handlePlaceOrder}
                    className="h-[51px] w-[146px]  bg-[#3FB500] text-[#fff] border-[2px] border-zinc-300 rounded-md   cursor-pointer  px-7 py-3"
                  >
                    Place Order
                  </button>
                ) : (
                  <button className="h-[51px] w-[146px]    bg-[#FB3F3F] text-[#fff] border-[2px] border-zinc-300 rounded-md  cursor-not-allowed  px-7 py-3">
                    Not Select
                  </button>
                )}
                <button
                  onClick={() => {
                    setCart([]);
                    setTotal(0);
                    setOrderDetail([]);
                    setCustomerName([]);
                    setSelectCustomerType();
                    setWaiter([]);
                    setSelectTable([]);
                    setVat([]);
                  }}
                  className="h-[51px] w-[146px]  bg-[#FB3F3F] text-[#fff] border-[2px] border-zinc-300 rounded-md   cursor-pointer  px-7 py-3"
                >
                  Cancel
                </button>


                <button
                 

                  onClick={handleholdOrder}
                  className="h-[51px] w-[146px]  bg-[#4f71d1] text-[#fff] border-[2px] border-zinc-300 rounded-md   cursor-pointer  px-7 py-3"
                >
                  Hold Order
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>

      {/* Preview */}
      <div className="hidden">
        <ComponentToPrint
          ref={componentRef}
          cart={cart}
          total={total}
          vat={vat}
          subtotal={subtotal}
          serviceCharge={serviceChargeAmount}
        />
      </div>

      {/* For print invoice after the place order */}

      <div className="hidden">
        <ComponentToPrintInvoice
          invoiceData={invoiceData}
          ref={componentRef2}
        />
      </div>

      {/* Table */}
      <TableDialogBox
        title={"View All Tables"}
        isOpen={cModal5}
        onClose={() => setCmodal5(false)}
      >
        <form action="" onSubmit={(e) => e.preventDefault()}>
          <div className="mt-2">
            <div className="p-5 h-[700px] overflow-y-scroll">
              <div className="flex  flex-wrap gap-6">
                {tableData.map((val, index) => (
                  <div
                    key={val.tableid}
                    className="border-[#4CBBA1] border-[1px]  w-auto rounded-md"
                  >
                    <div className="flex justify-between items-center gap-x-4 p-2">
                      <div>
                        <div className="flex flex-row items-center  gap-x-5 mb-3 justify-between">
                          {val.status !== "booked" && (
                            <input
                              type="checkbox"
                              name="special"
                              className="size-5 custom-checkbox"
                              value={val.tableid}
                              onChange={(e) => {
                                setTableid(e.target.value);
                                const selectedTable = tableData.find(
                                  (table) => table.tableid == e.target.value
                                );
                                setTableName(
                                  selectedTable ? selectedTable.tablename : ""
                                );
                                <h1>Select This Table</h1>;
                              }}
                            />
                          )}

                          <div className="image w-[50px] h-[50px]">
                            <div className=" image w-[50px] h-[50px]">
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
                        </div>

                        <div>
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
                    </div>

                    {val.status === "booked" ? (
                      <div className=" w-full text-center py-3 px-4">
                        <button
                          className="bg-[#bb4c4c] w-full text-[#fff] rounded-md cursor-none p-4"
                          // onClick={() => clearTable(val.tableid)}
                        >
                          Reserved
                        </button>
                      </div>
                    ) : (
                      <div className=" w-full text-center py-3 px-4">
                        <button
                          className="bg-[#4cbbb2] w-full text-[#fff] rounded-md cursor-none p-4"
                          // onClick={() => clearTable(val.tableid)}
                        >
                          Unbooked
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-start space-x-4 mt-10 float-right">
                <button
                  onClick={() => setCmodal5(false)}
                  type="button"
                  className="px-4 py-2 bg-[#1C1D3E] text-white rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectTable(tableId);
                    setCmodal5(false);
                    console.log("Selected table id", tableId);
                    console.log("Selected table name", tableName);
                  }}
                  type="button"
                  className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </form>
      </TableDialogBox>

      {/* See All Customer */}
      <DialogBoxSmall
        title={"See All Customer List"}
        onClose={() => {
          setCmodal2(false);
        }}
        isOpen={cModal2}
      >
        <div className="p-10">
          <form action="" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                className="block text-nowrap text-gray-700 font-semibold mb-2"
                htmlFor="parentCategory"
              >
                All Customer
              </label>
              <select
                value={customerName}
                onChange={(e) => {
                  const selectedCustomer = customer.find(
                    (val) => val.customer_id == e.target.value
                  );
                  setCustomerName(e.target.value);
                  setSelectCustomerName(
                    selectedCustomer ? selectedCustomer.customer_name : ""
                  );
                }}
                className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="parentCategory"
                name="parentid"
              >
                <option value="">Select</option>
                {customer.map((val, index) => (
                  <option key={index} value={val.customer_id}>
                    {val.customer_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-start space-x-4 float-right mt-3  ">
              <button
                onClick={() => setCmodal2(false)}
                type="button"
                className="px-4 py-2 bg-[#1C1D3E] text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setCustomerName(customerName);
                  setCmodal2(false);
                  console.log(customerName);
                }}
                type="button"
                className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
              >
                Select
              </button>
            </div>
          </form>
        </div>
      </DialogBoxSmall>

      {/*  Customer Type */}
      <DialogBoxSmall
        title={"All Customer Type"}
        onClose={() => {
          setCmodal3(false);
        }}
        isOpen={cModal3}
      >
        <div className=" p-10">
          <form action="" onSubmit={(e) => e.preventDefault()}>
            <div className="p-10">
              <label
                className="block text-nowrap text-gray-700 font-semibold mb-2"
                htmlFor="parentCategory"
              >
                All Customer
              </label>
              <select
                value={selectCustomerType}
                onChange={(e) => {
                  const selectedCustomerType = customerType.find(
                    (val) => val.customer_type_id == e.target.value
                  );
                  setSelectCustomerType(e.target.value);
                  setCustomerTypeName(
                    selectedCustomerType
                      ? selectedCustomerType.customer_type
                      : ""
                  );
                }}
                className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="parentCategory"
                name="parentid"
              >
                {customerType.map((val, index) => (
                  <option key={index} value={val.customer_type_id}>
                    {val.customer_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-start space-x-4 float-right  ">
              <button
                onClick={() => setCmodal3(false)}
                type="button"
                className="px-4 py-2 bg-[#1C1D3E] text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectCustomerType(selectCustomerType);
                  setCmodal3(false);
                  console.log(selectCustomerType);
                }}
                type="button"
                className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
              >
                Select
              </button>
            </div>
          </form>
        </div>
      </DialogBoxSmall>

      {/* Add Customer */}
      <DialogBoxSmall
        isOpen={cModal}
        title={"Add Customer"}
        onClose={() => {
          setCmodal(false);
        }}
      >
        <div className="">
          <form
            onSubmit={submitAddcustomer}
            className="bg-white rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="">
              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  onChange={handelChange}
                  value={formData.customer_name}
                  name="customer_name"
                  placeholder=" Customer Name"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="text"
                  onChange={handelChange}
                  value={formData.customer_email}
                  name="customer_email"
                  placeholder=" Customer E-mail"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2  text-sm font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  type="number"
                  onChange={handelChange}
                  value={formData.customer_phone}
                  name="customer_phone"
                  placeholder=" Mobile Number"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className=" mb-2  mt-5">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  onChange={handelChange}
                  value={formData.customer_address}
                  name="customer_address"
                  className="shadow w-full border-[#4CBBA1] appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>
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
          </form>
        </div>
      </DialogBoxSmall>


       {/* Recent Transaction */}
       <DialogBoxSmall
        title={"Recent Transaction "}
        onClose={() => {
          setCmodal8(false);
        }}
        isOpen={cModal8}
      >
        <div className="p-10">
          
        
        <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Customer Type</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{order.order_id}</td>
              <td className="border border-gray-300 px-4 py-2">{order.customer_type_name}</td>
              <td className="border border-gray-300 px-4 py-2">{order.customer_name}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">{order.totalamount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>






        </div>
      </DialogBoxSmall>

      {/* Waiter  */}

      <DialogBoxSmall
        title={"All Waiter'& List"}
        onClose={() => {
          setCmodal4(false);
        }}
        isOpen={cModal4}
      >
        <div className=" p-16">
          <form action="" onSubmit={(e) => e.preventDefault()}>
            <div className="">
              <label
                className="block text-nowrap text-gray-700 font-semibold mb-2"
                htmlFor="parentCategory"
              >
                All Waiter
              </label>
              <select
                value={waiter}
                onChange={(e) => {
                  const selectedWaiter = WaiterData.find(
                    (val) => val.id == e.target.value
                  );
                  setWaiter(e.target.value);
                  setWaiterName(selectedWaiter ? selectedWaiter.firstname : "");
                }}
                className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="parentCategory"
                name="parentid"
              >
                <option value="">Select</option>
                {WaiterData.map((val, index) => (
                  <option key={index} value={val.id}>
                    {`${val.firstname} ${val.lastname}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-start space-x-4 float-right  mt-4 ">
              <button
                onClick={() => setCmodal4(false)}
                type="button"
                className="px-4 py-2 bg-[#1C1D3E] text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setWaiter(waiter);
                  setCmodal4(false);
                  console.log(waiter);
                }}
                type="button"
                className="px-4 py-2 bg-[#4CBBA1] text-white rounded-md hover:bg-green-600"
              >
                Select
              </button>
            </div>
          </form>
        </div>
      </DialogBoxSmall>
      {/* Plaace Order Dialog box */}

      <CompleteOrderDialogBox
        isOpen={invoiceModal}
        onClose={() => {
          setInvoiceModal(false);
        }}
        onPrint={handlePrintInvoice}
      ></CompleteOrderDialogBox>

      {/* add food and variant data */}
      <AddonDialogBox
        isOpen={cModal6}
        title={"Food Add-On & Variant"}
        onClose={() => {
          setCmodal6(false);
        }}
        isClick={handleAddOnSubmit}
        button={"Add to Cart"}
      >
        <div className="flex flex-col gap-y-11 justify-between gap-x-9 p-11">
          <div>
            <div className="">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                      Product
                    </th>
                    <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                      Variants
                    </th>
                    <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                      Quantity
                    </th>
                    <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b text-center">
                    <td className="py-2 px-4 w-[200px] border border-[#4CBBA1]">
                      {addOneData.ProductName}
                    </td>
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      <select
                        className="border w-[200px] border-gray-300 rounded p-1"
                        onChange={handleVariantChange}
                        value={addOneData.variantName || ""}
                      >
                        {addOneData.variants.map((item, index) => (
                          <option key={index} value={item.variantName}>
                            {item.variantName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      <input
                        min={0}
                        max={100}
                        name="quantity"
                        value={addOneData.quantity}
                        type="number"
                        className="border border-gray-300 rounded p-1 w-full"
                        placeholder="Quantity"
                        onChange={handleQuantityChange}
                      />
                    </td>
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      <input
                        disabled={true}
                        value={addOneData.price}
                        type="number"
                        className="border border-gray-300 rounded p-1 w-full"
                        placeholder="Price"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="">
            <table className={`min-w-full bg-white`}>
              <thead className="">
                <tr>
                  <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                    Select
                  </th>
                  <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                    Add on name
                  </th>
                  <th className="py-4  px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                    Add on Quantity
                  </th>
                  <th className="py-4 px-4 bg-[#4CBBA1] text-gray-50 uppercase text-sm">
                    Price
                  </th>
                </tr>
              </thead>
         

              <tbody>
                {addOneData.addons.map((val, index) => (
                  <tr key={index} className="border-b text-center">
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      <input
                        type="checkbox"
                        className="form-checkbox size-5 custom-checkbox"
                        value={val.add_on_name}
                        onChange={(e) => handleaddonchange(e, index)}
                      />
                    </td>
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      {val.add_on_name}
                    </td>
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="border border-gray-300 rounded p-1 w-full"
                        placeholder="1"
                        onChange={(e) => handleaddonQuantityChange(e, index)}
                      />
                    </td>
                    <td className="py-2 px-4 border border-[#4CBBA1]">
                      <input
                        disabled={true}
                        type="number"
                        value={val.price}
                        className="border border-gray-300 rounded p-1 w-full"
                        placeholder="Price"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AddonDialogBox>


      <CashRegisterModel
     onClose={() => {
      setCmodal7(false);
    }}
    isOpen={cModal7}
    setIsCashRegisterOpen={setIsCashRegisterOpen}
      
      >

      </CashRegisterModel>

      <DraftOrder

onClose={() => {
  setCmodal9(false);
}}
isOpen={cModal9}
      
      
      >



      </DraftOrder>
    </>
  );
};

export default OrderList;