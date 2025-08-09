import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:4000', // backend URL
});

export default axiosClient;
