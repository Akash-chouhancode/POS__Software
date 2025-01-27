const express = require("express");

const router = express.Router();

const addfloorController = require("../controllers/addFloor");

router.post("/addfloor", addfloorController.createFloor);
router.get("/getfloor", addfloorController.getFloors);
router.delete('/deletefloors/:floorID', addfloorController.deleteFloor);
router.get("/floors/:id",addfloorController.getFloorById)
router.put('/floors/:id', addfloorController.updateFloor);
module.exports = router;
