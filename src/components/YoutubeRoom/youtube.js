import axios from 'axios';
const KEY = 'AIzaSyDxlPeZPnUX3Yc4E8cEfQAFksGCMcVD_48';

export default axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  params: {
    part: 'snippet,statistics',
    maxResults: 5,
    key: KEY,
  },
});
