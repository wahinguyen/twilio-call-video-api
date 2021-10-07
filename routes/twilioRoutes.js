const express = require("express");
const router = express.Router();

const twilioController = require("../controllers/twilioController");

router.post("/create", twilioController.createRoom);
router.post("/connect", twilioController.connectRoom);

module.exports = router;
