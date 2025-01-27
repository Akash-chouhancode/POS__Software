const express = require("express");
const router = express.Router();
const posController = require("../controllers/posController");
const auth=require("../middleware/authicantejwt")
router.get("/getCategoryList", posController.getCategoryList);
router.get("/products/:categoryId?", posController.getProductsByCategory);
//place oreder
router.post("/orderplace",auth,posController.orderPlace);
router.get("/getTodayOrders", posController.getTodayOrders);
router.get("/getWaiter",posController.getWaiter);
router.get("/qrorders", posController.getQROrders);
router.get("/getAllOrderList", posController.allOrderList);
router.get("/getOrderById/:order_id", posController.getOrderById);
router.get("/getOngoingOrder", posController.getOngoingOrder);
router.get("/cancelorderdata",posController.cancelOrdersList)
router.post("/cancelOrder/:order_id", posController.cancelorder);
router.get("/getCompleteOrders", posController.completeOrders);
router.get('/filterdata', posController.OrderListBySearchFilter);
router.get('/pendingorder',posController.pendingOrders)
router.get('/qrorderdata/:categoryId?', posController.getQrorderdata);
// router.get('/qrfilterdata/:categoryId?', posController.getQRByCategory);
router.get('/onlineOrders', posController.getOnlineOrders);
router.post("/qrorderplace", posController.Placeqrorder)
router.get("/getQrOrderById/:id", posController.getQrOrderById);
router.get("/getQrOrderDetailsById/:id", posController.getQrOrderDetailsById);
router.put("/updateqrorder/:id",posController.Updateqrorder);
module.exports = router;
