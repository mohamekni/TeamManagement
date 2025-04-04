const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    role: { 
        type: String, 
        enum: ["admin", "membre"], 
        required: true 
    },
    userType: {
        type: String,
        enum: ["etudiant", "enseignant"],
        required: true
    },
    team: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team', 
        required: true 
    }
}, 
{ timestamps: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
module.exports = TeamMember;