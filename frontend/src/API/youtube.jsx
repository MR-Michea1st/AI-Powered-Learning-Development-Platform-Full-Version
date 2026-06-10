// src/api/youtube.js

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchCourseVideos = async (playlistId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`
    );
    const data = await response.json();
    // console.log(data);
    
    return data.items; // This is the array of videos
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return [];
  }
};

export const fetchPlaylistName = async (playlistId) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`
    );
    const data = await response.json();
    // console.log(data);
    
    return data.items[0].snippet.title;
  } catch (error) {
    console.error("Failed to fetch Playlist Name:", error);
    return [];
  }
};