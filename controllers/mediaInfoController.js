const { TwitterDL } = require("twitter-downloader");
const {instagramGetUrl} = require("instagram-url-direct")
const Tiktok = require("@tobyg74/tiktok-api-dl")
const getFbInfo = require('@xaviabot/fb-downloader')

const getPlatformLinkInfo = async (req, res) => {
    const {url, platform} = req.body;

    let rawMediaInfo;

    const allowedPlatforms = ['tiktok', 'twitter',
    'instagram', "facebook"];

    if (!allowedPlatforms.includes(platform)) {
        return res.status(403).json({
            status: 'error',
            message: 'Unsupported platform',
        });
    }

    // Fetch media info based on platform
    try {
        platform === allowedPlatforms[0] ? // Tiktok
            rawMediaInfo = await Tiktok.Downloader(url, {
                version: "v1"
            })
            : platform === allowedPlatforms[1] ? // Twitter
                rawMediaInfo = await TwitterDL(url)
                : platform === allowedPlatforms[2] ? // Instagram
                    rawMediaInfo = await instagramGetUrl(url)
                    : platform === allowedPlatforms[3] ?
                        rawMediaInfo = await getFbInfo(url) :
                        rawMediaInfo = null;
    } catch (e) {
        console.error('Error occurred:', e); // Log full error for debugging
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch media info',
            error: e.message || 'Unknown error',
        });
    }


    // Process the media returned
    let processedMediaInfo;
    platform === allowedPlatforms[0] ? // Tiktok
        processedMediaInfo = {
            type: rawMediaInfo?.result.type,
            description: rawMediaInfo?.result.description,
            url: rawMediaInfo?.result.video.playAddr[0],
            thumbnail: rawMediaInfo?.result.video.cover[0],
            account_name: rawMediaInfo?.result.author.nickname,
            account_username: rawMediaInfo?.result.author.username,
            about_account: rawMediaInfo?.result.author.signature,
            avatar: rawMediaInfo?.result.author.avatarThumb[0],
            play_count: rawMediaInfo?.result.statistics.playCount,
            share_count: rawMediaInfo?.result.statistics.shareCount,
            download_count: rawMediaInfo?.result.statistics.downloadCount,
            music: {
                title: rawMediaInfo?.result.music.title,
                author: rawMediaInfo?.result.music.author,
                play_url: rawMediaInfo?.result.music.playUrl[0],
                thumbnail: rawMediaInfo?.result.music.coverThumb[0],
                originalSound: rawMediaInfo?.result.music.isOriginalSound,
            },
            images: rawMediaInfo?.result.images,
        }
        : platform === allowedPlatforms[1] ? // Twitter
            processedMediaInfo = {
                type: rawMediaInfo?.result.media[0].type,
                thumbnail: rawMediaInfo?.result.media[0].cover,
                url: rawMediaInfo?.result.media[0]?.videos ?
                    rawMediaInfo?.result.media[0]?.videos.at(-1).url
                    : rawMediaInfo?.result.media[0]?.image,
                account_name: rawMediaInfo?.result.author.username,
                account_username: rawMediaInfo?.result.author.username,
                about_account: rawMediaInfo?.result.author.bio,
                avatar: rawMediaInfo?.result.author.profileImageUrl,
                followers_count: rawMediaInfo?.result.author.statistics.followersCount,
                view_count: rawMediaInfo?.result.statistics.viewCount,
                favorite_count: rawMediaInfo?.result.statistics.favoriteCount,
                description: rawMediaInfo?.result.description,
            }
            : platform === allowedPlatforms[2] ? // Instagram
                processedMediaInfo = {
                    url: rawMediaInfo?.media_details[0].url,
                    avatar: null,
                    thumbnail: rawMediaInfo?.media_details[0].thumbnail,
                    account_name: rawMediaInfo?.post_info.owner_fullname,
                    account_username: rawMediaInfo?.post_info.owner_username,
                    likes: rawMediaInfo?.post_info.likes,
                    view_count: rawMediaInfo?.media_details[0].video_view_count,
                    description: rawMediaInfo?.post_info.caption,
                }
                : platform === allowedPlatforms[3] ?
                    processedMediaInfo = {
                        url: rawMediaInfo?.sd,
                        avatar: null,
                        thumbnail: rawMediaInfo?.thumbnail,
                        description: rawMediaInfo?.title,
                        hd_url: rawMediaInfo?.hd,
                        post_url: rawMediaInfo?.url,
                    }
                :
                processedMediaInfo = null;

    res.status(200).json({
        status: 'success',
        platform,
        ...processedMediaInfo,
    })

}

module.exports = {
    getPlatformLinkInfo,
}