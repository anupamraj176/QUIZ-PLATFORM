const express = require('express');

const router = express.Router();

router.get('/timing',(req,res)=>{
    const SDate = new Date(Date.now() - 60 * 60 * 1000).toString(); // 1 hour ago
    const EDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toString(); // 2 hours from now
    const presentDate = new Date();
    res.json({SDate:SDate, EDate:EDate, presentDate : presentDate});
})

module.exports = router;
