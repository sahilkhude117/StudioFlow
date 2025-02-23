import axios from "axios";

import appConfig from 'config/app.js';
import * as URLS from 'config/urls.js';
import { getItem, removeItem } from 'helpers/storage.js';

const api = axios.create({
    ...axios.defaults,
    baseURL: appConfig.restApiUrl,
    headers: {
      Authorization: getItem('token'),
    },
});

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            removeItem('token');

            if (window.location.pathname !== URLS.LOGIN) {
                window.location.href = URLS.LOGIN
            }
        }

        throw error;
    },
);

export default api;