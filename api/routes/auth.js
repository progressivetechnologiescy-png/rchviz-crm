const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_antigravity_dev_only';

// Register User
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }
        
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existingUser) return res.status(400).json({ success: false, error: 'User with this email already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(), 
                name, 
                password: hashedPassword, 
                avatar: req.body.avatar || null,
                role: role || 'employee'
            }
        });
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return res.status(404).json({ success: false, error: 'Account not found' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
