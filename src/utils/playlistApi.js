import axios from 'axios';

export async function getPlaylists(userId) {
    const res = await axios.get(`/api/users/${userId}/playlists`);
    return res.data;
}

export async function createPlaylist(userId, name) {
    const res = await axios.post(`/api/users/${userId}/playlists`, { name });
    return res.data;
}

export async function addClipToPlaylist(userId, playlistId, clip) {
    const res = await axios.put(`/api/users/${userId}/playlists/${playlistId}`, {
        action: 'add',
        clip,
    });
    return res.data;
}

export async function removeClipFromPlaylist(userId, playlistId, clip) {
    const res = await axios.put(`/api/users/${userId}/playlists/${playlistId}`, {
        action: 'remove',
        clip,
    });
    return res.data;
}

export async function deletePlaylist(userId, playlistId) {
    const res = await axios.delete(`/api/users/${userId}/playlists/${playlistId}`);
    return res.data;
}

export async function renamePlaylist(userId, playlistId, newName) {
    const res = await axios.put(`/api/users/${userId}/playlists/${playlistId}`, {
        action: 'rename',
        name: newName,
        clip: { id: 'dummy' } // clip 필드는 백엔드 요구사항 때문에 더미로 전달
    });
    return res.data;
} 