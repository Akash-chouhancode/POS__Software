const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportsController");

router.get("/tablebysale", reportController.getTableBySale);

router.get('/salesbyreport', reportController.salesReport);
router.get("/watersalereport",reportController.getWaiterTotalAmount)
router.get("/servicechargereport",reportController.serviceChargeReport)
router.get("/commission",reportController.showDataCommsion)
router.get("/casherreport",reportController.orderCasherReport)
router.get("/tablebysale",reportController.getTableBySale)
router.get("/salereportfilter",reportController.salesReportFiltering)
router.get("/salebydate",reportController.salesByDate)
router.get("/itemsalereport",reportController.itemSalesReport)
router.get("/registerreport",reportController.getCashRegister)
router.get("/registeruser",reportController.getCashUser)
router.get("/registerview",reportController.getCashRegisterView)
router.get("/purchasereport",reportController.purchaseReport )
router.get("/cashregisters/:id",reportController.getCashRegisterView);
router.get('/foodstockreport', reportController.productwise);
router.get('/foodstockkitchen', reportController.ingredientReport);
router.get('/deliveryreport', reportController.orderDelivery);
module.exports = router;