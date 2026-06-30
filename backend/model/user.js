const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: { type: String },
        applicationNo: { type: String, default: "" },
        password: { type: String },
        marks: { type: Number, default: 0 },
        attempted: { type: Boolean, default: false },
        answer: [{ type: Object }],
        visited: [{ type: Object }],
        review: [{ type: Object }],
        stream: { type: String, default: "" },
        program: { type: String, default: "" }
    }
)

module.exports = mongoose.model('user', schema);
