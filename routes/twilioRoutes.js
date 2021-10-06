const express = require("express");
const router = express.Router();

const twilioController = require("../controllers/twilioController");

router.post("/createroom", twilioController.createRoom);
router.get("/accesstoken", twilioController.accessToken);

module.exports = router;
