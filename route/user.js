const express = require("express");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtaccess = require("../middleware/jwtverification");
const User = require("../model/user");
const router = express.Router();


router.post(
    "/register",
    async (req, res) => {
        try {
            let user = await User.findOne({ applicationNo: req.body.applicationNo });
            if (user) {
                return res.status(400).json({ status: 1 });
            }
            // bcrypt.hash(req.body.password, 10, async function (err, hash) {
            var arr = new Array();
            user = await User.create({
                applicationNo: req.body.applicationNo,
                password: req.body.password,
                answer: arr
            })
                .then((user) => {
                    res.status(200).json({ status: 0 })
                })
                .catch((error) => res.status(400).json({ status: -1 }));
            // });
        } catch (error) {
            console.error("Register Error:", error);
            res.status(500).json({ status: -2, error: error.message });
        }
    }
);



router.post(
    "/login",
    async (req, res) => {
        const { applicationNo, password } = req.body;
        // console.log(req.body)
        try {
            let user = await User.findOne({ applicationNo: applicationNo });
            if (!user) {
                return res.json({ status: -1 })
            }
            // const match = await bcrypt.compare(password, user.password);
            if (password == user.password) {
                if (user.attempted == true) {
                    return res.json({ status: 2 })
                }
                data = {
                    id: user._id
                }
                await User.findOneAndUpdate({ applicationNo: applicationNo },{attempted : true})
                var authtoken = jwt.sign(data, process.env.JWT_TOKEN);
                res.status(200).json({ status: 0, authtoken });
            } else {
                return res.status(400).json({ status: -1 });
            }

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ status: -2, error: error.message });
        }
    }
);

router.post('/access', jwtaccess, async (req, res) => {
    try {
        var user = await User.findById(req.userid);
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        var data = {
            name: user.name,
            stream: user.stream,
            applicationNo: user.applicationNo,
            program: user.program,
            answer: user.answer,
            visited: user.visited,
            review: user.review
        }
        res.json({ status: 0, data });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})


router.post('/sendDatatoAdmin', jwtaccess, async (req, res) => {
    try {
        const id = req.userid;
        // console.log(id);
        if (id !== process.env.ADMINNO) {
            // console.log(id);
            return res.json({ status: -1 });
        }
        // console.log(req.body.stream)
        let data = await User.find({stream : req.body.stream});
        res.json({ status: 0, data });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})

router.post('/userDatatoAdmin', jwtaccess, async (req, res) => {
    try {
        const id = req.userid;
        // console.log(id);
        if (id !== process.env.ADMINNO) {
            // console.log(id);
            return res.json({ status: -1 });
        }
        // console.log(req.body);
        let data = await User.findOne({_id:req.body.id});
        // console.log(data)
        res.json({ status: 0, data });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})



router.post('/adddata', jwtaccess, async (req, res) => {
    try {
        var user = await User.findByIdAndUpdate(req.userid, {
            name: req.body.name,
            stream: req.body.stream,
            program: req.body.program
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.status(500).json({ status: -2 });
    }
})


router.post('/uploadAnswer', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer)
        var user = await User.findByIdAndUpdate(req.userid, {
            attempted: true,
            answer: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})

router.post('/uploadAnswermiddle', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer)
        var user = await User.findByIdAndUpdate(req.userid, {
            answer: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})


router.post('/uploadvisited', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer)
        var user = await User.findByIdAndUpdate(req.userid, {
            visited: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})


router.post('/uploadmarkasreview', jwtaccess, async (req, res) => {
    try {
        // console.log(req.body.answer);
        var user = await User.findByIdAndUpdate(req.userid, {
            review: req.body.answer
        });
        if (!user) {
            return res.status(400).json({ status: -1 });
        }
        res.json({ status: 0 });
    } catch (error) {
        res.json({ status: -1 })
    }
})


module.exports = router;