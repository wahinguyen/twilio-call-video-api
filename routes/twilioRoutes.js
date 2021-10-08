const express = require("express");
const router = express.Router();

const twilioController = require("../controllers/twilioController");

router.post(
  "/create",
  twilioController.validate("createRoom"),
  twilioController.createRoom
);
router.post(
  "/connect",
  twilioController.validate("connectRoom"),
  twilioController.connectRoom
);

module.exports = router;
