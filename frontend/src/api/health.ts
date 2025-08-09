import axiosClient from './axiosClient';

export const getHealth = async () => {
    const res = await axiosClient.get('/health');
    return res.data.status;
};
