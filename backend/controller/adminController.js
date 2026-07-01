const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.adminLogin = async (req, res) => {
    const adminId = process.env.ADMINID;
    const adminPassword = process.env.ADMINPASSWORD;
    const { applicationNo, password } = req.body;
    try {
        if (password === adminPassword && applicationNo === adminId) {
            const data = {
                id: process.env.ADMINNO
            };
            const authtoken = jwt.sign(data, process.env.JWT_TOKEN);
            res.status(200).json({ status: 0, authtoken });
        } else {
            return res.status(400).json({ status: -1 });
        }
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ status: -2, error: error.message });
    }
};
