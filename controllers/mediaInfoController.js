const { TwitterDL } = require("twitter-downloader");
const { instagramGetUrl } = require("instagram-url-direct");
const Tiktok = require("@tobyg74/tiktok-api-dl");
const getFbInfo = require('@xaviabot/fb-downloader');
const youtubeService = require('../services/youtube');

/**
 * Get media information from various platforms
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPlatformLinkInfo = async (req, res) => {
    const { url, platform } = req.body;

    // Validate required parameters
    if (!url || !platform) {
        return res.status(400).json({
            status: 'error',
            message: 'URL and platform are required',
        });
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid URL format',
        });
    }

    const ALLOWED_PLATFORMS = {
        TIKTOK: 'tiktok',
        TWITTER: 'twitter',
        INSTAGRAM: 'instagram',
        FACEBOOK: 'facebook',
        YOUTUBE: 'youtube'
    };

    // Check if platform is supported
    if (!Object.values(ALLOWED_PLATFORMS).includes(platform)) {
        return res.status(403).json({
            status: 'error',
            message: 'Unsupported platform',
            allowedPlatforms: Object.values(ALLOWED_PLATFORMS),
        });
    }

    let rawMediaInfo;

    // Fetch media info based on platform
    try {
        switch (platform) {
            case ALLOWED_PLATFORMS.TIKTOK:
                rawMediaInfo = await Tiktok.Downloader(url, { version: "v1" });
                break;
            case ALLOWED_PLATFORMS.TWITTER:
                rawMediaInfo = await TwitterDL(url);
                break;
            case ALLOWED_PLATFORMS.INSTAGRAM:
                rawMediaInfo = await instagramGetUrl(url);
                break;
            case ALLOWED_PLATFORMS.FACEBOOK:
                rawMediaInfo = await getFbInfo(url);
                break;
            case ALLOWED_PLATFORMS.YOUTUBE:
                rawMediaInfo = await youtubeService.getVideoInfo(url);
                break;
            default:
                throw new Error('Unsupported platform');
        }

        if (!rawMediaInfo) {
            throw new Error('Failed to fetch media info');
        }
    } catch (e) {
        console.error(`Error fetching ${platform} media:`, e);
        return res.status(500).json({
            status: 'error',
            message: `Failed to fetch media info from ${platform}`,
            error: e.message || 'Unknown error',
        });
    }


    // Process the media returned
    let processedMediaInfo;

    try {
        switch (platform) {
            case ALLOWED_PLATFORMS.TIKTOK:
                processedMediaInfo = processTiktokMedia(rawMediaInfo);
                break;
            case ALLOWED_PLATFORMS.TWITTER:
                processedMediaInfo = processTwitterMedia(rawMediaInfo);
                break;
            case ALLOWED_PLATFORMS.INSTAGRAM:
                processedMediaInfo = processInstagramMedia(rawMediaInfo);
                break;
            case ALLOWED_PLATFORMS.FACEBOOK:
                processedMediaInfo = processFacebookMedia(rawMediaInfo);
                break;
            case ALLOWED_PLATFORMS.YOUTUBE:
                processedMediaInfo = processYoutubeMedia(rawMediaInfo);
                break;
            default:
                throw new Error('Unsupported platform');
        }

        if (!processedMediaInfo) {
            throw new Error('Failed to process media info');
        }

        return res.status(200).json({
            status: 'success',
            platform,
            ...processedMediaInfo,
        });
    } catch (e) {
        console.error(`Error processing ${platform} media:`, e);
        return res.status(500).json({
            status: 'error',
            message: `Failed to process media info from ${platform}`,
            error: e.message || 'Unknown error',
        });
    }
}

/**
 * Process TikTok media information
 * @param {Object} rawMediaInfo - Raw media info from TikTok API
 * @returns {Object} Processed media info
 */
function processTiktokMedia(rawMediaInfo) {
    if (!rawMediaInfo?.result) return null;

    const { result } = rawMediaInfo;

    return {
        type: result.type,
        description: result.description,
        url: result.video?.playAddr?.[0],
        thumbnail: result.video?.cover?.[0],
        account_name: result.author?.nickname,
        account_username: result.author?.username,
        about_account: result.author?.signature,
        avatar: result.author?.avatarThumb?.[0],
        play_count: result.statistics?.playCount,
        share_count: result.statistics?.shareCount,
        download_count: result.statistics?.downloadCount,
        music: result.music ? {
            title: result.music.title,
            author: result.music.author,
            play_url: result.music.playUrl?.[0],
            thumbnail: result.music.coverThumb?.[0],
            originalSound: result.music.isOriginalSound,
        } : null,
        images: result.images,
    };
}

/**
 * Process Twitter media information
 * @param {Object} rawMediaInfo - Raw media info from Twitter API
 * @returns {Object} Processed media info
 */
function processTwitterMedia(rawMediaInfo) {
    if (!rawMediaInfo?.result) return null;

    const { result } = rawMediaInfo;
    const media = result.media?.[0];

    return {
        type: media?.type,
        thumbnail: media?.cover,
        url: media?.videos ? media.videos.at(-1)?.url : media?.image,
        account_name: result.author?.username,
        account_username: result.author?.username,
        about_account: result.author?.bio,
        avatar: result.author?.profileImageUrl,
        followers_count: result.author?.statistics?.followersCount,
        view_count: result.statistics?.viewCount,
        favorite_count: result.statistics?.favoriteCount,
        description: result.description,
    };
}

/**
 * Process Instagram media information
 * @param {Object} rawMediaInfo - Raw media info from Instagram API
 * @returns {Object} Processed media info
 */
function processInstagramMedia(rawMediaInfo) {
    if (!rawMediaInfo?.media_details?.[0]) return null;

    return {
        url: rawMediaInfo.media_details[0].url,
        avatar: null,
        thumbnail: rawMediaInfo.media_details[0].thumbnail,
        account_name: rawMediaInfo.post_info?.owner_fullname,
        account_username: rawMediaInfo.post_info?.owner_username,
        likes: rawMediaInfo.post_info?.likes,
        view_count: rawMediaInfo.media_details[0].video_view_count,
        description: rawMediaInfo.post_info?.caption,
    };
}

/**
 * Process Facebook media information
 * @param {Object} rawMediaInfo - Raw media info from Facebook API
 * @returns {Object} Processed media info
 */
function processFacebookMedia(rawMediaInfo) {
    if (!rawMediaInfo) return null;

    return {
        url: rawMediaInfo.sd,
        avatar: null,
        thumbnail: rawMediaInfo.thumbnail,
        description: rawMediaInfo.title,
        hd_url: rawMediaInfo.hd,
        post_url: rawMediaInfo.url,
    };
}

/**
 * Process YouTube media information
 * @param {Object} rawMediaInfo - Raw media info from YouTube service
 * @returns {Object} Processed media info
 */
function processYoutubeMedia(rawMediaInfo) {
    if (!rawMediaInfo) return null;

    return {
        type: 'video',
        url: rawMediaInfo.embedUrl,
        thumbnail: rawMediaInfo.thumbnailUrl,
        thumbnails: {
            high: rawMediaInfo.thumbnailUrlHQ,
            medium: rawMediaInfo.thumbnailUrlMQ,
            standard: rawMediaInfo.thumbnailUrlSD,
            default: rawMediaInfo.thumbnailUrl
        },
        videoId: rawMediaInfo.videoId,
        watchUrl: rawMediaInfo.watchUrl
    };
}

module.exports = {
    getPlatformLinkInfo,
}
