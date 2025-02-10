const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const axios =require("axios")
// const authenticateJWT = require("../middleware/middleware");
const userControllers = require("../controllers/userController");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "asset/user");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

router.post("/add", upload.single("image"), userControllers.addUser);
router.get("/all", userControllers.getUsers);
router.delete("/deleteuser/:id", userControllers.deleteUser);
router.get("/userbyid/:id",userControllers.getUserById)
router.put("/updateuser/:id", upload.single("image"), userControllers.updateUser);


// log in api routs
router.post("/login", userControllers.loginUser);
router.post("/logout/:id", userControllers.logoutUser);

router.get('/countries', userControllers.getAllCountry);

// check-in 
router.get('/checkin',userControllers.checkIncheckOut);

// forgot pass
router.post("/forgetpassword",userControllers.ForgetPasswordController)
router.post("/resetpassword/:id/:token",userControllers.resetPasswordController)
module.exports = router;
