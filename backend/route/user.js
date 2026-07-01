const express = require("express");
const router = express.Router();
const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });
const jwtaccess = require("../middleware/jwtverification");
const userController = require("../controller/userController");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/access", jwtaccess, userController.accessUser);
router.post("/sendDatatoAdmin", jwtaccess, userController.sendDataToAdmin);
router.post("/userDatatoAdmin", jwtaccess, userController.userDataToAdmin);
router.post("/adddata", jwtaccess, userController.addData);
router.post("/uploadAnswer", jwtaccess, userController.uploadAnswer);
router.post("/uploadAnswermiddle", jwtaccess, userController.uploadAnswerMiddle);
router.post("/uploadvisited", jwtaccess, userController.uploadVisited);
router.post("/uploadmarkasreview", jwtaccess, userController.uploadMarkAsReview);
router.post("/bulk-register", jwtaccess, userController.bulkRegisterUsers);
router.post("/uploadCandidates", jwtaccess, excelUpload.single('candidatesFile'), userController.uploadCandidates);

module.exports = router;