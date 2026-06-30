const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: { type: String },
        ques: { type: String },
        choice: [{ type: String }],
        answer: { type: String }
    }
)

module.exports = mongoose.model('question', schema);