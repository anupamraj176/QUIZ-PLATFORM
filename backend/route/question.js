const express = require("express");
const router = express.Router();
const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });
const upload = require("../middleware/imgUpd");
const jwtaccess = require("../middleware/jwtverification");
const questionController = require("../controller/questionController");

router.post("/addquestion", jwtaccess, upload.single('img'), questionController.addQuestion);
router.post("/updatequestionImage", jwtaccess, upload.single('img'), questionController.updateQuestionImage);
router.post("/updatequestion", jwtaccess, questionController.updateQuestion);
router.post("/updatequestionText", jwtaccess, questionController.updateQuestion); // Support frontend route
router.post("/sendAdminquestion", jwtaccess, questionController.sendAdminQuestions);
router.post("/deletequestion", jwtaccess, questionController.deleteQuestion); // Support frontend route
router.post("/deleteAdminquetion", jwtaccess, questionController.deleteQuestion); // Support legacy backend route
router.post("/sendquestion", jwtaccess, questionController.sendCandidateQuestions);

// Bulk questions upload alignment (support frontend input 'file' and legacy 'excelFile')
router.post("/uploadexcel", jwtaccess, excelUpload.single('excelFile'), questionController.bulkUploadQuestions);
router.post("/addbulkquestion", jwtaccess, excelUpload.single('file'), questionController.bulkUploadQuestions);

module.exports = router;
