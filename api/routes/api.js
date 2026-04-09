const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// A generic success/error handler
const sendResp = (res, promise) => {
    promise
        .then(data => res.json({ success: true, data }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ success: false, error: err.message });
        });
};

// --- PROJECTS ---
router.get('/projects', (req, res) => sendResp(res, prisma.project.findMany()));
router.post('/projects', (req, res) => sendResp(res, prisma.project.create({ data: req.body })));
router.put('/projects/:id', (req, res) => sendResp(res, prisma.project.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/projects/:id', (req, res) => sendResp(res, prisma.project.delete({ where: { id: req.params.id } })));

// --- LEADS ---
router.get('/leads', (req, res) => sendResp(res, prisma.lead.findMany()));
router.post('/leads', (req, res) => sendResp(res, prisma.lead.create({ data: req.body })));
router.put('/leads/:id', (req, res) => sendResp(res, prisma.lead.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/leads/:id', (req, res) => sendResp(res, prisma.lead.delete({ where: { id: req.params.id } })));

// --- CLIENTS ---
router.get('/clients', (req, res) => sendResp(res, prisma.client.findMany()));
router.post('/clients', (req, res) => sendResp(res, prisma.client.create({ data: req.body })));
router.put('/clients/:id', (req, res) => sendResp(res, prisma.client.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/clients/:id', (req, res) => sendResp(res, prisma.client.delete({ where: { id: req.params.id } })));

// --- TASKS ---
router.get('/tasks', (req, res) => sendResp(res, prisma.task.findMany()));
router.post('/tasks', (req, res) => sendResp(res, prisma.task.create({ data: req.body })));
router.put('/tasks/:id', (req, res) => sendResp(res, prisma.task.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/tasks/:id', (req, res) => sendResp(res, prisma.task.delete({ where: { id: req.params.id } })));

// --- FOLDERS ---
router.get('/folders', (req, res) => sendResp(res, prisma.folder.findMany()));
router.post('/folders', (req, res) => sendResp(res, prisma.folder.create({ data: req.body })));
router.put('/folders/:id', (req, res) => sendResp(res, prisma.folder.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/folders/:id', (req, res) => sendResp(res, prisma.folder.delete({ where: { id: req.params.id } })));

// --- ASSETS ---
router.get('/assets', (req, res) => sendResp(res, prisma.asset.findMany()));
router.post('/assets', (req, res) => sendResp(res, prisma.asset.create({ data: req.body })));
router.put('/assets/:id', (req, res) => sendResp(res, prisma.asset.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/assets/:id', (req, res) => sendResp(res, prisma.asset.delete({ where: { id: req.params.id } })));

// --- CHANNELS ---
router.get('/channels', (req, res) => sendResp(res, prisma.channel.findMany()));
router.post('/channels', (req, res) => sendResp(res, prisma.channel.create({ data: req.body })));
router.put('/channels/:id', (req, res) => sendResp(res, prisma.channel.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/channels/:id', (req, res) => sendResp(res, prisma.channel.delete({ where: { id: req.params.id } })));

// --- MESSAGES ---
router.get('/messages', (req, res) => sendResp(res, prisma.message.findMany()));
router.post('/messages', (req, res) => sendResp(res, prisma.message.create({ data: req.body })));
router.put('/messages/:id', (req, res) => sendResp(res, prisma.message.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/messages/:id', (req, res) => sendResp(res, prisma.message.delete({ where: { id: req.params.id } })));

// --- EMPLOYEES ---
router.get('/employees', (req, res) => sendResp(res, prisma.employee.findMany()));
router.post('/employees', (req, res) => sendResp(res, prisma.employee.create({ data: req.body })));
router.put('/employees/:id', (req, res) => sendResp(res, prisma.employee.update({ where: { id: req.params.id }, data: req.body })));
router.delete('/employees/:id', (req, res) => sendResp(res, prisma.employee.delete({ where: { id: req.params.id } })));

// --- USERS (PROFILE SYNC) ---
router.put('/users/profile', async (req, res) => {
    const { email, name, avatar } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });
    try {
        const user = await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: { name, avatar }
        });
        res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, preferences: user.preferences } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message || 'Failed to update profile' });
    }
});

// --- CLOUD UI PREFERENCES SYNC ---
router.put('/users/preferences', async (req, res) => {
    const { email, preferences } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });
    try {
        const user = await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: { preferences }
        });
        res.json({ success: true, data: { preferences: user.preferences } });
    } catch (e) {
        console.error("Preferences Sync Error:", e);
        res.status(500).json({ success: false, error: e.message || 'Failed to sync preferences' });
    }
});

// --- INTERNAL DB MIGRATION WEBHOOK ---
router.get('/internal/schema-push', (req, res) => {
    try {
        const { execSync } = require('child_process');
        const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8' });
        res.json({ success: true, logs: output });
    } catch(e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
