/**
 * YouTube service for fetching video information
 * @module services/youtube
 */

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com URLs
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/')[2];
      } else if (urlObj.pathname.startsWith('/v/')) {
        return urlObj.pathname.split('/')[2];
      }
    }
    
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
}

/**
 * Get YouTube video information
 * @param {string} url - YouTube URL
 * @returns {Promise<Object|null>} Video information or null if error
 */
async function getVideoInfo(url) {
  try {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // For a complete implementation, you would use YouTube Data API
    // This is a placeholder that returns basic info
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      thumbnailUrlHQ: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailUrlMQ: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      thumbnailUrlSD: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    };
  } catch (error) {
    console.error('Error getting YouTube video info:', error);
    return null;
  }
}

module.exports = {
  extractVideoId,
  getVideoInfo
};