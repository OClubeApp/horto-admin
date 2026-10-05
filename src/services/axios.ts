import axios from 'axios';
import { parseCookies } from 'nookies';

export function getApi() {
    const api = axios.create({
        baseURL: 'https://clube-do-horto.polijrinternal.com'
    });

    // Lê o token a cada requisição: no import o cookie ainda pode não existir (antes do login)
    api.interceptors.request.use((config) => {
        const { '@app:token': token } = parseCookies();
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            };
        }
        return config;
    });

    return api;
}
