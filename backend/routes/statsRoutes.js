const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getStatistics } = require("../controllers/statsController");

router.get("/", auth, allowRoles("Owner"), getStatistics);

module.exports = router;
