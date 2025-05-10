const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getOwnerStats } = require("../controllers/statsController"); // ✅ Correct name

router.get("/", auth, allowRoles("Owner"), getOwnerStats); // ✅ Match here

module.exports = router;
