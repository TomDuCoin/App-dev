import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.SERVER_API_URL
});

const token = window.localStorage.getItem('token')?.replaceAll('"', '');
instance.defaults.headers.common = {'Authorization': (token ? `Basic ${token}` : '')}
export default instance;