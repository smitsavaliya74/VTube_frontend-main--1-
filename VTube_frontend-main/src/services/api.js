import axios from 'axios';

const baseURL = import.meta.env.MODE === 'production' 
  ? 'https://project-yt-lu42.onrender.com/api/v1' 
  : 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // Crucial for sending/receiving cookies (accessToken, refreshToken)
});

// Request interceptor to catch any global request changes if needed

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh logic automatically

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If error is 401 (Unauthorized) and we haven't retried yet, and it's NOT a login request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/login') &&
      !originalRequest.url.includes('/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token using the cookie that is sent automatically
        await axios.post(`${baseURL}/users/refresh-token`, {}, { withCredentials: true });
        // If successful, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user is completely logged out
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const videoApi = {
  getVideos: async (page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc') => {
    let url = `/videos/all?page=${page}&limit=${limit}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    if (sortBy) url += `&sortBy=${sortBy}`;
    if (sortType) url += `&sortType=${sortType}`;
    const response = await api.get(url);
    return response.data;
  },
  getVideoById: async (videoId) => {
    const response = await api.get(`/videos/get/${videoId}`);
    return response.data;
  },
  uploadVideo: async (formData, onUploadProgress) => {
    const response = await api.post('/videos/publish', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
    return response.data;
  },
  updateVideo: async (videoId, title, description) => {
    const response = await api.patch(`/videos/update/${videoId}`, { title, description });
    return response.data;
  },
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/delete/${videoId}`);
    return response.data;
  }
};

export const interactionApi = {
  getVideoLikes: async (videoId) => {
    const response = await api.get(`/likes/totallikesofvideo/${videoId}`);
    return response.data;
  },
  toggleVideoLike: async (videoId) => {
    const response = await api.post(`/likes/togglevideolike/${videoId}`);
    return response.data;
  },
  getLikedVideos: async () => {
    const response = await api.get(`/likes/videos`);
    return response.data;
  },
  getVideoComments: async (videoId, page = 1, limit = 50) => {
    const response = await api.get(`/comments/getcomments/${videoId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  addComment: async (videoId, content) => {
    const response = await api.post(`/comments/addcomment/${videoId}`, { content });
    return response.data;
  },
  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/updatecomment/${commentId}`, { content });
    return response.data;
  },
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/deletecomment/${commentId}`);
    return response.data;
  },
  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/likes/togglecommentlike/${commentId}`);
    return response.data;
  },
  toggleVideoDislike: async (videoId) => {
    const response = await api.post(`/likes/togglevideodislike/${videoId}`);
    return response.data;
  },
  getVideoDislikeStatus: async (videoId) => {
    const response = await api.get(`/likes/dislikestatus/${videoId}`);
    return response.data;
  }
};

export const userApi = {
  getChannelProfile: async (username) => {
    const response = await api.get(`/users/getchannelprofile/${username}`);
    return response.data;
  },
  getWatchHistory: async () => {
    const response = await api.get(`/users/getwatchhistory`);
    return response.data;
  },
  addVideoToHistory: async (videoId) => {
    const response = await api.patch(`/users/add-history/${videoId}`);
    return response.data;
  },
  getChannelVideos: async (userId, page = 1, limit = 10) => {
    const response = await api.get(`/dashboard/channelvideos/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  getChannelStats: async (userId) => {
    const response = await api.get(`/dashboard/channelstats/${userId}`);
    return response.data;
  },
  updateAccountDetails: async (fullName, email) => {
    const response = await api.patch('/users/update-account', { fullName, email });
    return response.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/users/change-password', { oldPassword, newPassword });
    return response.data;
  },
  updateAvatar: async (formData) => {
    const response = await api.patch('/users/update-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },
  resendVerificationOtp: async (email) => {
    const response = await api.post('/users/resend-verification-otp', { email });
    return response.data;
  },
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/users/reset-password', { email, otp, newPassword });
    return response.data;
  },
  updateCoverImage: async (formData) => {
    const response = await api.patch('/users/update-cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const tweetApi = {
  getUserTweets: async (userId, page = 1, limit = 10) => {
    const response = await api.get(`/tweets/getusertweets/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  createTweet: async (content) => {
    const response = await api.post(`/tweets/createtweet`, { content });
    return response.data;
  },
  updateTweet: async (tweetId, content) => {
    const response = await api.put(`/tweets/updatetweet/${tweetId}`, { content });
    return response.data;
  },
  deleteTweet: async (tweetId) => {
    const response = await api.delete(`/tweets/deletetweet/${tweetId}`);
    return response.data;
  },
  toggleTweetLike: async (tweetId) => {
    const response = await api.post(`/likes/toggletweetlike/${tweetId}`);
    return response.data;
  }
};

export const playlistApi = {
  createPlaylist: async (name, description) => {
    const response = await api.post('/playlists/createplaylist', { name, description });
    return response.data;
  },
  getUserPlaylists: async (userId, page = 1, limit = 10) => {
    const timestamp = new Date().getTime();
    const response = await api.get(`/playlists/getuserplaylists/${userId}?page=${page}&limit=${limit}&t=${timestamp}`);
    return response.data;
  },
  getPlaylistById: async (playlistId) => {
    const response = await api.get(`/playlists/getplaylistbyid/${playlistId}`);
    return response.data;
  },
  addVideoToPlaylist: async (playlistId, videoId) => {
    const response = await api.post(`/playlists/${playlistId}/addvideo/${videoId}`);
    return response.data;
  },
  removeVideoFromPlaylist: async (playlistId, videoId) => {
    const response = await api.delete(`/playlists/${playlistId}/removevideo/${videoId}`);
    return response.data;
  },
  deletePlaylist: async (playlistId) => {
    const response = await api.delete(`/playlists/deleteplaylist/${playlistId}`);
    return response.data;
  },
  updatePlaylist: async (playlistId, name, description) => {
    const response = await api.patch(`/playlists/updateplaylist/${playlistId}`, { name, description });
    return response.data;
  }
};

export const subscriptionApi = {
  toggleSubscription: async (channelId) => {
    const response = await api.post(`/subscriptions/toggle/${channelId}`);
    return response.data;
  },
  getChannelSubscribers: async (channelId, page = 1, limit = 50) => {
    const response = await api.get(`/subscriptions/getchannelsubscribers/${channelId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  getSubscribedChannels: async (subscriberId, page = 1, limit = 50) => {
    const response = await api.get(`/subscriptions/getsubscribedchannels/${subscriberId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  getSubscribedChannelsVideos: async (page = 1, limit = 10) => {
    const response = await api.get(`/subscriptions/videos?page=${page}&limit=${limit}`);
    return response.data;
  }
};

export default api;

