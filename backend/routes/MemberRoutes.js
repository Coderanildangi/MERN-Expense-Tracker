const express = require('express');
const Member = require('../models/Member');

// Routes
const memberRouter = express.Router();

// Get all members
memberRouter.get('/', async (req, res) => {
    try {
        const members = await Member.find();
        return res.status(200).json({
            success: true,
            data: members,
            count: members.length
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }   
});

// Add a new member
memberRouter.post('/', async (req, res) => {
    try{
        const { name } = req.body;
        const existingMember = await Member.findOne({ name });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                error: 'Member with this name already exists'
            });
        }
        const member = await Member.create({ name });
        return res.status(201).json({
            success: true,
            data: member
        });
    }catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
    }
});

// Delete a member.
memberRouter.delete('/:id', async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({
                success: false,
                error: 'No member found'
            });
        }
        await member.deleteOne({ _id: req.params.id });
        return res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }   
});

module.exports = memberRouter;

