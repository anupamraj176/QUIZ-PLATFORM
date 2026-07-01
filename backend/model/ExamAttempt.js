const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true   
    },
    exam : {
        type: String,
        required : true
    },
    warningCount : {
        type : Number,
        default : 0
    },
    violations : [{
        type : {
            type : String
        },
        timestamp: { 
            type: Date, 
            default: Date.now 
        }
    }],
    status: {
        type: String,
        enum: ['in_progress', 'submitted', 'auto_submitted'],
        default: 'in_progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: Date
});

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);