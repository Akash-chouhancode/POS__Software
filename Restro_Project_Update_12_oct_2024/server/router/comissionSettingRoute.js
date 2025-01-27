const express = require("express");

const router = express.Router();
const auth=require("../middleware/authicantejwt")
const ComissionController = require("../controllers/CommissionSettings");

router.get('/getcomissiondata', ComissionController.getAllCommissionSettings);
router.post('/postcommission',auth,ComissionController.createCommissionSetting);
router.delete('/deletecomission/:id', ComissionController.deleteCommissionSetting);
router.get('/comissionbyid/:id', ComissionController.getCommissionSettingById);
router.put('/updatecomission/:id', ComissionController.updateCommissionSetting);
module.exports=router