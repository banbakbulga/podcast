const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
    clipId: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: String,
        required: true
    },
    displayDate: {
        type: String,
        required: true
    },
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    tags: [String],
    type: {
        type: String,
        enum: ['music', 'movie', 'ad', 'story'],
        required: true
    }
}, {
    timestamps: true
});

// 인덱스 생성
clipSchema.index({ clipId: 1 }); // 기본 인덱스
clipSchema.index({ date: 1, start: 1 }); // 날짜와 시작 시간으로 정렬
clipSchema.index({ type: 1 }); // 타입으로 필터링
clipSchema.index({ tags: 1 }); // 태그로 필터링
clipSchema.index({ title: 'text', description: 'text' }); // 텍스트 검색

module.exports = mongoose.model('Clip', clipSchema); 