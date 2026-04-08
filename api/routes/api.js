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

module.exports = router;
