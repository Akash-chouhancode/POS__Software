import React, { useState, useContext, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import pic1 from "../assets/images/Order_Management.png";
import pic2 from "../assets/images/eservation.png";
import pic3 from "../assets/images/Purchase_Manage.png";
import pic4 from "../assets/images/Report.png";
import pic5 from "../assets/images/Food_Mgmt.png";
import pic6 from "../assets/images/Loyalty.png";
import pic7 from "../assets/images/Setting.png";
import pic8 from "../assets/images/Account.png";
import pic9 from "../assets/images/Human_Resourse.png";
import pic10 from "../assets/images/Web_Setting.png";
import pic11 from "../assets/images/Waste_Tracking.png";
import pic12 from "../assets/images/inventory_management.png";
import pic13 from "../assets/images/Recipe_Mgmt.png";
import pic14 from "../assets/images/Roles_&_Permission.png";
import pic15 from "../assets/images/Master_Setup.png";
import Button from "../components/Button";
import Nav from "../components/Nav";
import { AuthContext } from "../store/AuthContext";
import { IoMdNotifications } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { LiaLanguageSolid } from "react-icons/lia";
import { FaBellConcierge } from "react-icons/fa6";
import { MdOutlineZoomOutMap } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa6";
import useFullScreen from "../components/useFullScreen";
import { FaClock } from "react-icons/fa";
import DialogBoxSmall from "../components/DialogBoxSmall";
import axios from "axios";
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  const data = children;

  return (
    <>
    <>
  <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
    <div className="relative w-auto my-6 mx-auto max-w-4xl">
      {/* Content */}
      <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
          <h3 className="text-3xl pr-11 font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-white bg-[#FB3F3F] px-2 hover:scale-105 font-bold rounded-sm"
          >
            X
          </button>
        </div>
        {/* Body */}
        <div className="relative p-6 flex-auto">
          <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data}
            </div>
          </p>
        </div>
      </div>
    </div>
  </div>
  <div className="opacity-55 fixed inset-0 z-40 bg-black"></div>
</>
    </>
  );
};

const Menuecard = [
  {
    title: "Manage Order",
    submanu: true,
    images: pic1,

    submanuItems: [
      { title: "POS Invoice", link: "/order-list" },
      { title: "Order List", link: "/orders-list" },
      { title: "Pending Order", link: "/pending-order" },
      { title: "Complete Order", link: "/complete-order" },
      { title: "Cancel Order", link: "/cancel-order" },
    
    ],
  },
  {
    title: "Reservation",
    submanu: true,
    images: pic2,

    submanuItems: [
      { title: "All Reservations", link: "/reservation" },
      { title: "Add Booking", link: "/add-booking" },
      { title: "Unavailable today", link: "/unavailability-days" },
    ],
  },
  {
    title: "Purchase Manage",

    submanu: true,
    images: pic3,
    submanuItems: [
      { title: "Purchase Item", link: "/purchase-item" },
      { title: "Add Purchase", link: "/add-purchase" },
      { title: "Purchase Return", link: "/purchase-return" },
      { title: "Return Invoice", link: "/return-invoice" },
      { title: "Supplier Manage", link: "/supplier-manage" },
      { title: "Supplier Ledger", link: "/supplier-ladger" },
      { title: "Stock out ingredients", link: "/stock-out-ingredients" },
    ],
  },
  {
    title: "Report",

    submanu: true,
    images: pic4,
    submanuItems: [
      // { title: "Purchase Report", link: "/purchase-report" },
      // { title: "Stock Report (Food Items)", link: "/foodstock-report" },
      // { title: "Stock Report (Kitchen)", link: "/kitchenstock-report" },
      { title: "Sale Report", link: "/sale-report" },
      { title: "Waiter Sale Report", link: "/waitersale-report" },
      { title: "Service Charge Report", link: "/servicecharge-report" },
      { title: "Sale Report Cashie", link: "/cashier-report" },
      { title: "Item Sales Report", link: "/itemsale-report" },
      // { title: "Cash Register Report", link: "/case-register-report" },
      { title: "Sale Report Filtering", link: "/sale-report-filter" },
      { title: "Sale By Date", link: "/saleby-day" },
      { title: "Sale By Table", link: "/saleby-table" },
      { title: "Commission Report", link: "/commission" },
    ],
  },
  {
    title: "Food Mgmt.",

    submanu: true,
    images: pic5,
    submanuItems: [
      { title: "Add Category", link: "/add-category" },
      { title: "Category List", link: "/category-list" },
      { title: "Add Food", link: "/add-food" },
      { title: "Food List", link: "/food-list" },
      { title: "Menu Type", link: "/menu-type" },
      { title: "Add Ons", link: "/add-ons" },
    ],
  },
  {
    title: "Recipe Mgmt.",

    submanu: true,
    images: pic13,
    submanuItems: [
      { title: "Set Production Unit", link: "/set-production-unit" },
      { title: "Production Set List", link: "/set-production-list" },
      { title: "Add Production", link: "/add-production" },
      // { title: "Production Setting", link: "/working" },
    ],
  },
  {
    title: "Invenory Mgmt.",

    submanu: true,
    images: pic12,
    submanuItems: [
      { title: "Ingredient stock list", link: "/stock-list" },
      { title: "Stock out ingredients", link: "/stock-out-ingredients" },
      
    ],
  },
  {
    title: "Loyalty",

    submanu: true,
    images: pic6,
    submanuItems: [
      { title: "Point Setting", link: "/point-setting" },
      { title: "Customer Point List", link: "/customer-point" },
    ],
  },
  {
    title: "Setting",

    submanu: true,
    images: pic7,
    submanuItems: [
      { title: "Paynment Method setting", link: "/" },
      { title: "Manage Table", link: "/" },
      { title: "Coustomer Type", link: "/" },
      { title: "Kitchen Setting", link: "/" },
      { title: "Unit Masurement", link: "/" },
      { title: "SMS Setting", link: "/" },
      { title: "Bank", link: "/" },
      { title: "Language", link: "/" },
      { title: "Sound Setting", link: "/" },
    ],
  },
  {
    title: "User & Staf",

    submanu: true,
    images: pic8,
    submanuItems: [
      { title: "Add User", link: "/add-user" },
      { title: "User List", link: "/user-list" },
    ],
  },
  {
    title: "Human Resourse",

    submanu: true,
    images: pic9,
    submanuItems: [
      { title: "Designation", link: "/designation" },
      { title: "Add Employee", link: "/add-employee" },
      { title: "Manage Employee", link: "/manageemployee" },
      { title: "Add Expense Item", link: "/addexpenseitem" },
      { title: "Add Expense", link: "/addexpense" },
      { title: "Department", link: "/department" },
      { title: "Division", link: "/division" },
      ,
      { title: "Holiday", link: "/holiday" },
      { title: "Leave Type", link: "/leavetype" },
      { title: "Leave Application", link: "/leaveapplication" },
      // { title: "Payroll", link: "/working" },
    ],
  },
  {
    title: "Web Setting",

    submanu: true,
    images: pic10,
    submanuItems: [
      { title: "Payment Method Setting", link: "/working" },
      { title: "Manage Table", link: "/working" },
      { title: "Customer Type", link: "/working" },
      { title: "Kitchen Setting", link: "/working" },
      { title: "SMS Setting", link: "/working" },
      { title: "Bank", link: "/working" },
      { title: "Language", link: "/working" },
      { title: "Sound Setting", link: "/working" },
    ],
  },
  {
    title: "Roles & Permission",
    submanu: true,
    images: pic14,

    submanuItems: [
      // { title: "Permission Setup", link: "/premission-setup" },
      { title: "Add Role", link: "/add-role" },
      { title: "Role List", link: "/rolelist" },
      { title: "User Access Role", link: "/user-access-role" },
    ],
  },
  {
    title: "Master Set-up",
    submanu: true,
    images: pic15,
    submanuItems: [
      { title: "Unit Measurement", link: "/unit-measurement" },
      { title: "Ingredients", link: "/ingredient-list" },
      { title: "Kitchen List", link: "/kitchen-list" },
      { title: "Printers", link: "/printer-list" },
      { title: "Table & Floor Manage", link: "/table-list" },
      { title: "All Table-QR", link: "/alltable-Qr" },
      { title: "Add Customers", link: "/add-customer" },
      { title: "Customer Type", link: "/customer-type" },
      { title: "Commission Setting", link: "/commission-setting" },
    ],
  },
  {
    title: "Waste Tracking",
    submanu: true,
    images: pic11,

    submanuItems: [
      { title: "Packaging Food", link: "/packaging-food" },
      { title: "Purchase Food Waste", link: "/purchasefood-waste" },
      { title: "Making Food Waste", link: "/makingfood-waste" },
    ],
  },
];

const Home = () => {
  const { userId, username } = useContext(AuthContext);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Declare useNavigate at the top level
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleNavigation1 = () => {
    navigate("/order-list");
  };

  const handleNavigation2 = () => {
    navigate("/orders-list");
  };

  const handleNavigation3 = () => {
    navigate("/complete-order");
  };
  const [modalContent, setModelContent] = useState([]);
  const [checkOut, setCheckOut] = useState(false);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
  const [orders, setOrders] = useState([]);
 const { permissions, isAdmin } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const selectPage = (page) => {
    if (page > 0 && page <= Math.ceil(orders.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };
  const showitem = (index) => {
    setOpenSubmenuIndex(index === openSubmenuIndex ? null : index);
    console.log(openSubmenuIndex);
  };

  const showmodeldata = (index) => {
    const selectedMenu = Menuecard[index];
    setModalTitle(selectedMenu.title);
    setModelContent(selectedMenu.submanuItems || []);

    setShowModal(index === openSubmenuIndex ? false : true);
  };
  const rcenttransaction = () => {
    axios
      .get(`${API_BASE_URL}/checkin`)
      .then((res) => {
        // setOrders(res.data.data);
        setOrders(res.data.data || []);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error in getting transaction");
      });
  };


  const hasAnyPermission = (moduleName) => {
    if (isAdmin) {
      return true;
    }

    const modulePermissions = permissions.find(
      (perm) => perm.module_name === moduleName
    );
    return (
      modulePermissions &&
      (modulePermissions.can_access === 1 ||
        modulePermissions.can_create === 1 ||
        modulePermissions.can_edit === 1 ||
        modulePermissions.can_delete === 1)
    );
  };


  useEffect(() => {
    rcenttransaction();
  }, []);
  const { isFullScreen, toggleFullScreen } = useFullScreen();

  return (
    <>
     <div className="main_div flex gap-x-4">
     <div className="nav-container hide-scrollbar h-screen overflow-y-auto">
  <Nav />
</div>  

  <div className="mt-5 p-2 flex-1  hide-scrollbar h-screen overflow-y-auto">
  <div className="flex flex-col lg:flex-row justify-between items-center">
  <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
    <button
      onClick={handleNavigation1}
      className="text-xl flex h-[51px] items-center gap-x-3 bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer px-7 py-3"
    >
      <FaBellConcierge /> POS Invoice
    </button>
    <button
      onClick={handleNavigation2}
      className="text-xl flex h-[51px] items-center gap-x-3 bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer px-7 py-3"
    >
      <FaClipboardList /> Order List
    </button>
    <button
      onClick={handleNavigation3}
      className="text-xl flex h-[51px] items-center gap-x-3 bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer px-7 py-3"
    >
      <FaClipboardList /> Complete Order
    </button>
    <button
      onClick={() => setCheckOut(true)}
      className="text-xl flex h-[51px] items-center gap-x-3 bg-[#1C1D3E] text-[#fff] border-[2px] border-zinc-300 rounded-md cursor-pointer px-7 py-3"
    >
      <FaClock />
      Check-in/Check-out
    </button>
  </div>
  <div className="flex flex-row gap-x-7 mt-4 lg:mt-0">
    <IoMdNotifications className="bg-[#1C1D3E] text-white rounded-sm p-1 text-4xl" />
    <MdOutlineZoomOutMap
      onClick={toggleFullScreen}
      className="bg-[#1C1D3E] text-white cursor-pointer rounded-sm p-1 text-4xl"
    />
  </div>
</div>

    <h1 className="mt-7 font-bold text-xl">Welcome {username}</h1>

    {/* service card */}
    <div
  onClick={() => {
    showitem();
    showmodeldata();
  }}
  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ${showModal && "opacity-55"}`}
>
  {Menuecard.filter((items) => {
    const filteredSubmenuItems = items.submanuItems
      ? items.submanuItems.filter((subItem) => hasAnyPermission(subItem.title))
      : [];

    if (items.submanu && filteredSubmenuItems.length === 0) return false;

    return true;
  }).map((items, index) => (
    <div
      key={index}
      className="overflow-hidden bg my-5 border-[3px] border-[#1C1D3E] rounded-lg cursor-pointer w-full" // Removed responsive widths here
      onClick={() => {
        showitem(index);
        showmodeldata(index);
      }}
    >
      <div className="px-6 py-4 flex flex-col justify-center items-center">
        <div className="overflow-hidden w-24 h-16">
          <img src={items.images} alt="image" className="w-full h-full" />
        </div>
        <div className="text-xl mb-1 text-center">{items.title}</div>
      </div>
    </div>
  ))}
</div>
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={modalTitle}
    >
      {modalContent.map((val, index) => (
        <Button key={index}>
          <NavLink to={val.link}>{val.title}</NavLink>
        </Button>
      ))}
    </Modal>
  </div>
</div>

      <DialogBoxSmall
        title={"Check-in/Check-out "}
        onClose={() => {
          setCheckOut(false);
        }}
        isOpen={checkOut}
      >
        <div className="p-10">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    User Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Last Login Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Last Logout Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Last Login Time
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Last Logout Time
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Time Count
                  </th>
                </tr>
              </thead>
              <tbody>
        {orders.length > 0 ? (
          orders
            .slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )
            .map((order) => (
              <tr key={order.order_id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {order.username}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.last_login_date}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.last_logout_date}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {new Date(order.last_login_time).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {new Date(order.last_logout_time).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {new Date(order.last_logout_time) - new Date(order.last_login_time)} {/* Duration in milliseconds */}
                </td>
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan="6" className="py-2 px-4 text-center">
              No results found
            </td>
          </tr>
        )}
      </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-7">
            {orders.length > 0 && (
              <div className="mt-10">
                <div className="float-right flex items-center space-x-2">
                  <button
                    onClick={() => selectPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-[46px] w-[70px] cursor-pointer border-[1px] border-[#1C1D3E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(Math.ceil(orders.length / itemsPerPage))].map(
                    (_, index) => {
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
                    }
                  )}
                  <button
                    onClick={() => selectPage(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(orders.length / itemsPerPage)
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
      </DialogBoxSmall>
    </>
  );
};

export default Home;
