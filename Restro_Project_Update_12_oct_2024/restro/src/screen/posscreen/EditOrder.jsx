import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Nav from "../../components/Nav";
import Hamburger from "hamburger-react";

import { CiCircleList } from "react-icons/ci";
import { FaKitchenSet, FaMagnifyingGlass } from "react-icons/fa6";
import { IoQrCodeOutline, IoPizzaOutline } from "react-icons/io5";
import { GiKnifeFork } from "react-icons/gi";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { IoIosMan } from "react-icons/io";

import { MdTableBar, MdOutlineZoomInMap } from "react-icons/md";
import defaultimage from "../../assets/images/pizza.jpeg";
import { toast } from "react-toastify";
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
import useFullScreen from "../../components/useFullScreen";

import CashRegisterModel from "../../components/CashRegisterModel";
import DraftOrder from "./DraftOrder";
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

const EditOrder = () => {
  const { token } = useContext(AuthContext);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;
  const VITE_IMG_URL= import.meta.env.VITE_IMG_URL
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const defaultImage = defaultimage;
  const [isOpen, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const { id } = useParams(); // Get the ID from the URL
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
  const [Categories, setCategory] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [orderDetail, setOrderDetail] = useState([]);
  const [cModal2, setCmodal2] = useState(false);
  const [cModal3, setCmodal3] = useState(false);
  const [cModal4, setCmodal4] = useState(false);
  const [serviceChargeAmount, setServiceChargeAmount] = useState(0);
  const [customer, setCustomer] = useState([]);
  const [customerType, setCustomerType] = useState([]);
  const [WaiterData, setWaiterData] = useState([]);
  const [cart, setCart] = useState([]);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [total, setTotal] = useState(0);
  const [subtotal, SetSubtotal] = useState([]);
  const [vat, setVat] = useState(null);
  const [selectAddone, setSelectAddone] = useState([]);
  const [cModal6, setCmodal6] = useState(false);
  const [addOneData, setAddOneData] = useState({
    productvat: "",
    ProductName: "",
    price: "",
    variants: [],
    addons: [],
    quantity: 1,
  });
  const [orderDetais, setOrderDetails] = useState([]);
  const [menuDetails, setMenuDetails] = useState([]);
  // menu card 
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

  // all menu data 
  const showMenudata = (categoryId) => {
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
  // image error when no image 
  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };
  // category menu
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

  
// all waiter data
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
// all customer data
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
// get customer type
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

  // search menu item 
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




  




  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/getOrderById/${id}`)
      .then((response) => {
        const orderDetails = response.data.orderDetails[0];
        const menuItems = response.data.menuItems;
  
        console.log("Prefilled customer data:", orderDetails);
        console.log("Prefilled menu data:", menuItems);
  
        setOrderDetails(orderDetails);
        setMenuDetails(menuItems);
  
        // Initialize orderDetail with prefilled menu data
        const prefilledOrderDetail = menuItems.map((item) => ({
          ProductsID: item.menu_id,
          row_id: item.row_id,
          price: parseFloat(item.price),
          quantity: item.menuqty || 1, // Use provided menu quantity
          ProductName: item.ProductName || "Default Name",
          variantid: item.varientid || 0, // Ensure fallback
          variantName: item.variantName || "Default",
          totalAmount: parseFloat(item.price) * (item.menuqty || 1), // Calculate total
          addons: item.add_ons || [], // Use available add-ons
          productvat: item.productvat || 0,
        }));
        setCart(prefilledOrderDetail);
        setOrderDetail(prefilledOrderDetail);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [id]);



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
            };
          } else {
            return cartItem;
          }
        });
        setCart(newCart);
  
        // Update quantity in orderDetail for the same item
        let updatedOrderDetail = orderDetail.map((item) =>
          item.ProductsID === val.ProductsID &&
          item.variantid === val.variants[0].variantid
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        setOrderDetail(updatedOrderDetail);
      } else {
        let addingProduct = {
          ...val,
          ProductsID: val.ProductsID,
          productvat: val.productvat,
          variantid: val.variantid || val.variants[0].variantid,
          variantName: val.variants[0].variantName || val.variants[0].variant,
          menuid: val.menuid,
          quantity: 1,
          totalAmount: val.price || val.variants[0].price,
          price: val.price || val.variants[0].price,
          addons: val.checkedaddons || [],
        };
        setCart([...cart, addingProduct]);
        setOrderDetail([...orderDetail, addingProduct]);
      }
    }
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
    const selectedAddon = {
        add_on_id: addOneData.addons[index].add_on_id,
        add_on_name: value,
        add_on_price: addOneData.addons[index].price,
        add_on_quantity: 1,
    };

    setAddOneData((prevState) => {
        const updatedCheckedAddons = checked
            ? [...prevState.checkedaddons, selectedAddon]
            : prevState.checkedaddons.filter((addon) => addon.add_on_name !== value);

        return {
            ...prevState,
            checkedaddons: updatedCheckedAddons,
        };
    });
};



const handleaddonQuantityChange = (e, index) => {
  const newQuantity = parseInt(e.target.value, 10) || 1;

  setAddOneData((prevState) => ({
      ...prevState,
      checkedaddons: prevState.checkedaddons.map((addon, idx) =>
          idx === index ? { ...addon, add_on_quantity: newQuantity } : addon
      ),
  }));
};
  const handleAddOnSubmit = () => {
    let findProductInCart = cart.find(
      (i) =>
        i.ProductName === addOneData.ProductName &&
        i.variantid === addOneData.varientid
    );

    if (findProductInCart) {
      let newCart = cart.map((cartItem) => {
        if (
          cartItem.ProductName === addOneData.ProductName &&
          cartItem.variantid === addOneData.varientid
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
    setOrderDetail( newCart);
    
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
    setOrderDetail( newCart);
  };



  // calculating total accourding to cart dataa
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



  //servic charge accourding to the change in data
  useEffect(() => {
    const validSubtotal = parseFloat(subtotal) || 0;
    const validServiceCharge = parseFloat(serviceCharge) || 0;
    const validVat = parseFloat(vat) || 0;
  
    // Bound service charge percentage between 0 and 100
    const boundedServiceCharge = Math.min(Math.max(validServiceCharge, 0), 100);
  
    // Calculate service charge amount
    const totalServiceCharge = ((validSubtotal * boundedServiceCharge) / 100).toFixed(2);
    setServiceChargeAmount(totalServiceCharge);
  
    // Calculate total amount
    const allTotal = (
      validSubtotal +
      parseFloat(totalServiceCharge) +
      validVat
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

  const handleQuantityChange = (event) => {
    const { value } = event.target;
    setAddOneData((prevData) => ({
      ...prevData,
      quantity: parseInt(value, 10),
    }));
  };

  const prepareUpdatePayload = () => {
    const payload = {
      customer_id: orderDetais.customer_id,
      customer_type: orderDetais.cutomertype,
      waiter_id: orderDetais.waiter_id || null,
      table_id: orderDetais.table_no || null,
      order_details: orderDetail, // Use the updated orderDetail
      grand_total: total,
      service_charge: serviceCharge,
      discount: 0,
      VAT: vat || 0.0,
    };
  
    return payload;
  };


const navigate=useNavigate()
  const updateOrderDetails=()=>{
  
    const payload = prepareUpdatePayload();
    console.log("data jo gya ",payload)
    axios.put(`${API_BASE_URL}/draft/${id}`,payload,{
      headers:  { Authorization: token}
    })
    .then((res)=>{
      console.log(res.data)
      toast.success("Order placed successfully")
      navigate('/order-list')
    })
    .catch((err)=>{
      console.log(err)
    })
  }





  useEffect(() => {
    showMenudata();
    getCustomer();
    getCategoryMenu();
    getCustomerType();
    getWaiter();
  }, []);
  return (
    <>
      <div className=" flex gap-x-6  ">
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

        {/* Heading Button */}
        <section className="middel_section  ">
          <div className="order">
            <div className="  mt-10 text-center text-xl mb-4 font-bold ">
              <h1>Edit Order</h1>
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
        </section>

        <section className=" flex-grow">
          <div className="flex items-center">
            <button className=" font-semibold  w-full h-[75px] bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3">
              <div className=" flex flex-row justify-center items-center   gap-x-1 ">
                <button
                  onClick={() => {
                    setCmodal2(true);
                  }}
                  className=" font-semibold   text-2xl   text-[#fff]   cursor-pointer "
                >
                  <CiCircleList />
                </button>
              </div>
              <span className=" text-sm">Cust Name</span>
            </button>

            <button
              onClick={() => {
                setCmodal3(true);
              }}
              className=" font-semibold  w-full h-[75px] bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
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
              className=" font-semibold  w-full h-[75px] bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
            >
              <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                <span className=" flex gap-x-2">
                  <IoIosMan />
                  <span className=" text-red-600  font-bold"> *</span>
                </span>{" "}
                Waiter
              </div>
            </button>

            <button
              onClick={toggleFullScreen}
              className=" font-semibold  w-full h-[75px] bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer   py-3"
            >
              <div className=" flex flex-col justify-center items-center   gap-x-1 ">
                <span>
                  <MdOutlineZoomInMap onClick={toggleFullScreen} />
                </span>{" "}
                Zoom
              </div>
            </button>
          </div>
          <div className=" ">
            {/* bitton data */}

            {/* Shopping type */}
            <section className="bg-white mt-3 p-1">
              <div className=" flex justify-between bg-emerald-50  leading-10">
                <h1 className=" text-center font-semibold">
                  Customer Name
                  <br />
                  <span className=" overflow-hidden text-sm">
                    {orderDetais.customer_name}
                  </span>
                </h1>
                <h1 className=" text-center font-semibold">
                  Customer Type <br />
                  <span className=" overflow-hidden text-sm">
                    {/* {customerTypeName} */}
                    {orderDetais.cutomertype === 1
                      ? "Walk In Customer"
                      : orderDetais.cutomertype === 2
                      ? "Online Customer"
                      : orderDetais.cutomertype === 3
                      ? "Third Party"
                      : orderDetais.cutomertype === 4
                      ? "Take Away"
                      : orderDetais.cutomertype === 99
                      ? "QR Customer"
                      : "Not Found"}
                  </span>
                </h1>
                <h1 className=" text-center font-semibold">
                  Waiter Name <br />
                  <span className=" overflow-hidden text-sm">
                    {`${orderDetais.waiter_first_name} ${orderDetais.waiter_last_name}`}
                  </span>
                </h1>

                <h1 className=" text-center font-semibold">
                  {" "}
                  Table Number
                  <br />
                  <span className=" overflow-hidden text-sm ">
                    {orderDetais.table_no}
                  </span>
                </h1>
              </div>
            </section>
            {/* Product data in cart */}
            <div className="table border-[1px] shadow-[#FF8100] mt-5 w-full border-[#FF8100] rounded-sm shadow-sm">
              <div className="h-[600px] overflow-y-auto">
                <div className="flex justify-between items-center py-4 px-3 rounded-sm border-b-[1px] border-green-200 m-3 shadow-sm shadow-green-400 bg-gray-100 font-bold">
                  <span className="w-[100px] text-nowrap">Product</span>
                  <span className="w-[50px] text-center">Price</span>
                  <span className="w-[50px] text-center">Quantity</span>
                  <span className="w-[50px] text-center">Action</span>
                </div>
                {cart && cart.length > 0 ? (
                  cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-4 px-3 rounded-sm border-[1px] border-green-200 m-3 shadow-sm shadow-green-400"
                    >
                      <span className="w-[100px] text-nowrap">
                        {item.ProductName}
                        <br />
                        {item.variantName && <span>({item.variantName})</span>}
                      </span>
                      <span className="w-[50px] text-center">{item.price}</span>
                      <div className="flex items-center gap-x-2">
                        <button
                          className="w-[20px] rounded-sm text-md bg-[#1C1D3E] text-white text-center"
                          onClick={() =>
                            increaseQuantity(item.ProductsID, item.variantid)
                          }
                        >
                          +
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="w-[20px] rounded-sm text-md bg-[#1C1D3E] text-white text-center"
                          onClick={() =>
                            decreaseQuantity(item.ProductsID, item.variantid)
                          }
                        >
                          -
                        </button>
                      </div>
                      <Tooltip message="Remove">
                        <button onClick={() => removeProduct(item)}>
                          <FaRegTrashAlt className="text-red-600 font-bold cursor-pointer" />
                        </button>
                      </Tooltip>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No Item In Cart</p>
                )}
              </div>
              <section className="billing p-2">
                <DataTable total={total} vat={vat} subtotal={subtotal} />
              </section>
            </div>
            {/* Service  charge */}
            <section className="mt-2">
  <div className="flex gap-x-5 justify-center items-center">
    <label className="block text-nowrap mb-2 text-sm font-bold text-gray-700">
      Service Charge (%):
    </label>
    <input

      value={serviceCharge} // Bind to state
      onChange={(e) => setServiceCharge(e.target.value)}
      min={0.0}
      max={100}
      type="number"
      className="shadow w-full outline-none appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
  </div>
</section>
            {/* Orders Button */}

            <section className=" flex float-right  mt-3">
              <div className="flex  gap-x-2">
                <button
                   onClick={()=>{
                    navigate('/order-list')
                   }}
                  className={`h-[51px] bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md px-7 py-3 
                    cursor-pointer`}
                  // disabled={cart.length == 0}
                >
                  Back To POS
                </button>

              

                <button
                 onClick={updateOrderDetails}
                  className="h-[51px]   bg-[#3FB500] text-[#fff] border-[2px] border-zinc-300 rounded-md   cursor-pointer  px-7 py-3"
                >
                  Place Order /Update Order
                </button>

                {/* <button
                  // onClick={() => {
                  //   setCart([]);
                  //   setTotal(0);
                  //   setOrderDetail([]);
                  //   setCustomerName([]);
                  //   setSelectCustomerType();
                  //   setWaiter([]);
                  //   setSelectTable([]);
                  //   setVat([]);
                  // }}
                  className="h-[51px] w-[146px]  bg-[#FB3F3F] text-[#fff] border-[2px] border-zinc-300 rounded-md   cursor-pointer  px-7 py-3"
                >
                  Cancel
                </button> */}
              </div>
            </section>
          </div>
        </section>
      </div>

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
                className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={orderDetais.waiter_id}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetais,
                    waiter_id: e.target.value, // Update the orderDetails state when selection changes
                  })
                }
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
                  setCmodal4(false);
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
                className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="parentCategory"
                name="parentid"
                value={orderDetais.cutomertype}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetais,
                    cutomertype: e.target.value, // Update the orderDetails state when selection changes
                  })
                }
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
                  setCmodal3(false);
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
                value={orderDetais.customer_id}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetais,
                    customer_id: e.target.value, // Update the orderDetails state when selection changes
                  })
                }
                className="shadow border border-[#4CBBA1] rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  setCmodal2(false);
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
    </>
  );
};

export default EditOrder;
