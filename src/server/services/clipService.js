const Clip = require('../models/Clip');
const MusicClip = require('../models/MusicClip');
const MovieClip = require('../models/MovieClip');

// 기본 쿼리 옵션
const defaultOptions = {
    page: 1,
    limit: 20,
    sort: { date: -1, start: 1 }
};

// 클립 검색
async function searchClips(query, options = {}) {
    const { page, limit, sort } = { ...defaultOptions, ...options };
    const skip = (page - 1) * limit;

    const searchQuery = {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
        ]
    };

    const [clips, total] = await Promise.all([
        Clip.find(searchQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Clip.countDocuments(searchQuery)
    ]);

    return {
        clips,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

// 날짜별 클립 조회
async function getClipsByDate(date, options = {}) {
    const { page, limit, sort } = { ...defaultOptions, ...options };
    const skip = (page - 1) * limit;

    const [clips, total] = await Promise.all([
        Clip.find({ date })
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Clip.countDocuments({ date })
    ]);

    return {
        clips,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

// 태그별 클립 조회
async function getClipsByTag(tag, options = {}) {
    const { page, limit, sort } = { ...defaultOptions, ...options };
    const skip = (page - 1) * limit;

    const [clips, total] = await Promise.all([
        Clip.find({ tags: tag })
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Clip.countDocuments({ tags: tag })
    ]);

    return {
        clips,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

// 타입별 클립 조회
async function getClipsByType(type, options = {}) {
    const { page, limit, sort } = { ...defaultOptions, ...options };
    const skip = (page - 1) * limit;

    const [clips, total] = await Promise.all([
        Clip.find({ type })
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Clip.countDocuments({ type })
    ]);

    return {
        clips,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

// 클립 상세 정보 조회
async function getClipDetails(clipId) {
    const clip = await Clip.findOne({ clipId });
    if (!clip) return null;

    let details = { ...clip.toObject() };

    // 음악 정보 조회
    if (clip.type === 'music') {
        const musicClip = await MusicClip.findOne({ clipId });
        if (musicClip) {
            details.music = musicClip.music;
        }
    }

    // 영화 정보 조회
    if (clip.type === 'movie') {
        const movieClip = await MovieClip.findOne({ clipId });
        if (movieClip) {
            details.movie = movieClip.movie;
        }
    }

    return details;
}

// 통계 정보 조회
async function getClipStats() {
    const stats = await Clip.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalDuration: { $sum: '$duration' }
            }
        }
    ]);

    const tagStats = await Clip.aggregate([
        { $unwind: '$tags' },
        {
            $group: {
                _id: '$tags',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return {
        byType: stats,
        byTag: tagStats
    };
}

module.exports = {
    searchClips,
    getClipsByDate,
    getClipsByTag,
    getClipsByType,
    getClipDetails,
    getClipStats
}; 