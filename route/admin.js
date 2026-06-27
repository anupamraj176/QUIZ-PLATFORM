const express = require("express");
var jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();

router.post(
    "/adminlogin",
    async (req, res) => {
        const adminId = process.env.ADMINID;
        const adminpassord = process.env.ADMINPASSWORD;
        const { applicationNo, password } = req.body;
        // console.log(req.body)
        try {
            // const match = await bcrypt.compare(password, user.password);
            if (password === adminpassord && applicationNo === adminId) {
                data = {
                    id: process.env.ADMINNO
                }
                var authtoken = jwt.sign(data, process.env.JWT_TOKEN);
                res.status(200).json({ status: 0, authtoken });
            } else {
                return res.status(400).json({ status: -1 });
            }

        } catch (error) {
            res.status(500).json({ status: -2, error });
        }
    }
);


module.exports = router


