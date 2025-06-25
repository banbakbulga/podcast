const express = require('express');
const router = express.Router();
const clipService = require('../services/clipService');

// 모든 클립 가져오기
router.get('/', async (req, res) => {
    try {
        const { type, tag, date } = req.query;
        let query = {};

        if (type) query.type = type;
        if (tag) query.tags = tag;
        if (date) query.date = date;

        const clips = await clipService.getAllClips(query);
        res.json(clips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 클립 검색
router.get('/search', async (req, res) => {
    try {
        const { q: query, page, limit, sort } = req.query;
        const result = await clipService.searchClips(query, { page, limit, sort });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 날짜별 클립 조회
router.get('/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { page, limit, sort } = req.query;
        const result = await clipService.getClipsByDate(date, { page, limit, sort });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 태그별 클립 조회
router.get('/tag/:tag', async (req, res) => {
    try {
        const { tag } = req.params;
        const { page, limit, sort } = req.query;
        const result = await clipService.getClipsByTag(tag, { page, limit, sort });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 타입별 클립 조회
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { page, limit, sort } = req.query;
        const result = await clipService.getClipsByType(type, { page, limit, sort });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 클립 상세 정보 조회
router.get('/:clipId', async (req, res) => {
    try {
        const clip = await clipService.getClipDetails(req.params.clipId);
        if (!clip) {
            return res.status(404).json({ error: 'Clip not found' });
        }
        res.json(clip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 통계 정보 조회
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await clipService.getClipStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 