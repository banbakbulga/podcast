const fs = require('fs').promises;
const path = require('path');
const connectDB = require('../config/database');
const Clip = require('../models/Clip');
const MusicClip = require('../models/MusicClip');
const MovieClip = require('../models/MovieClip');
const { searchMovie } = require('../services/movieService');

async function importClips() {
    try {
        await connectDB();

        // 데이터 디렉토리에서 모든 JSON 파일 읽기
        const dataDir = path.join(__dirname, '../../../public/data');
        const files = await fs.readdir(dataDir);

        for (const file of files) {
            if (file.endsWith('.json')) {
                const date = file.replace('.json', '');
                const filePath = path.join(dataDir, file);
                const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

                for (const clip of data) {
                    // 기본 클립 정보 저장
                    const clipId = `${date}-${clip.start}-${clip.end}`;
                    const clipDoc = new Clip({
                        clipId,
                        date,
                        displayDate: formatDate(date),
                        start: clip.start,
                        end: clip.end,
                        duration: clip.end - clip.start,
                        title: clip.title || `Clip from ${formatDate(date)}`,
                        description: clip.description,
                        tags: clip.tags || [],
                        type: determineClipType(clip)
                    });

                    await clipDoc.save();

                    // 음악 클립인 경우
                    if (clip.music && clip.music.length > 0) {
                        const musicClip = new MusicClip({
                            clipId,
                            music: clip.music
                        });
                        await musicClip.save();
                    }

                    // 영화 클립인 경우
                    if (clip.tags && clip.tags.includes('영화')) {
                        const movieInfo = await searchMovie(clip.title);
                        if (movieInfo) {
                            const movieClip = new MovieClip({
                                clipId,
                                movie: movieInfo
                            });
                            await movieClip.save();
                        }
                    }
                }
            }
        }

        console.log('Import completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
}

function formatDate(dateStr) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
}

function determineClipType(clip) {
    if (clip.music && clip.music.length > 0) return 'music';
    if (clip.tags) {
        if (clip.tags.includes('영화')) return 'movie';
        if (clip.tags.includes('광고')) return 'ad';
        if (clip.tags.includes('사연')) return 'story';
    }
    return 'music'; // 기본값
}

importClips(); 