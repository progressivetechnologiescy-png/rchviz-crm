const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
        
        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, preferences: user.preferences } });
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
        
        let isMatch = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (password === user.password);
        }
        if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials' });
        if (user.status === 'suspended') return res.status(403).json({ success: false, error: 'Your account has been suspended.' });
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, preferences: user.preferences } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message || 'Internal Server Error' });
    }
});
// User Invite (Admin or System)
router.post('/invite', async (req, res) => {
    const { email, name, role } = req.body;
    try {
        if (!email || !name) {
            return res.status(400).json({ success: false, error: 'Email and name required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User with this email already exists' });
        }

        // Generate a random temporary password (it won't be used, just for db constraint)
        const tempPassword = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name,
                role: role || 'employee',
                password: hashedPassword,
                status: 'active',
                resetToken,
                resetTokenExpiry
            }
        });

        // Generate Initials natively to mirror Employee creation
        const parts = name.trim().split(' ');
        let initials = parts[0].substring(0, 1).toUpperCase();
        if (parts.length > 1) {
            initials += parts[parts.length - 1].substring(0, 1).toUpperCase();
        } else if (parts[0].length > 1) {
            initials += parts[0].substring(1, 2).toUpperCase();
        }

        // Also create the Employee mirror record immediately
        try {
            await prisma.employee.create({
                data: {
                    email: email.toLowerCase(),
                    name,
                    role: role || 'employee',
                    status: 'active',
                    avatar: null
                }
            });
        } catch(e) { console.error('Failed to create mirror employee', e); }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const setupLink = `${frontendUrl}/setup-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
        
        console.log(`[!] User Invited: ${user.email} | Setup Link: ${setupLink}`);

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER || 'progressive.technologies.cy@gmail.com',
                    pass: process.env.SMTP_PASS || 'uolfruzfwmuqgsjb'
                }
            });

            await transporter.sendMail({
                from: `"ArchViz CRM" <${process.env.SMTP_USER || 'progressive.technologies.cy@gmail.com'}>`,
                to: user.email,
                subject: 'Welcome to ArchViz CRM - Set your Password',
                html: `
                    <h2>Welcome to the ArchViz CRM!</h2>
                    <p>Hello ${user.name}, you have been invited to join the platform.</p>
                    <p>Please click the button below to set up your master password and activate your account:</p>
                    <a href="${setupLink}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:white;text-decoration:none;border-radius:5px;">Setup Password</a>
                    <p>If the button doesn't work, copy and paste this link into your browser: <br/>${setupLink}</p>
                `
            });
        } catch(mailErr) {
            console.error('Failed to send invite email (Setup link is logged above).', mailErr.message);
        }

        res.json({ success: true, message: 'User invited successfully.' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Internal server error during invite' });
    }
});

// Setup Password (Consume Token)
router.post('/setup-password', async (req, res) => {
    const { email, token, password } = req.body;
    try {
        if (!email || !token || !password) {
            return res.status(400).json({ success: false, error: 'Missing parameters' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return res.status(404).json({ success: false, error: 'Invalid reset link' });

        if (user.resetToken !== token || new Date() > user.resetTokenExpiry) {
            return res.status(400).json({ success: false, error: 'Token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: newHashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                status: 'active'
            }
        });

        // Return a fresh JWT immediately so the user is logged in
        const jwtToken = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ success: true, token: jwtToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, preferences: user.preferences } });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
