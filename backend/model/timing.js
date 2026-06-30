const mongoose = require('mongoose');

const timingSchema = new mongoose.Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
});

module.exports = mongoose.model('Timing', timingSchema);
