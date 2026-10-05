import { AxiosResponse } from 'axios';

import { AuthResponse } from 'interfaces/Auth';
import { User } from 'interfaces/Users';

import api from './api';

interface ILoginRequest {
    email: string;
    password: string;
}

export default class UserService {
    static async login(data: ILoginRequest): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await api.post(
            '/auth/login',
            data
        );

        return response.data;
    }

    static async GetAll(): Promise<User[]> {
        const response: AxiosResponse<User[]> = await api.get('/users/getAll');

        return response.data;
    }

    static async GetUserById(userId: string): Promise<User> {
        const response: AxiosResponse<User> = await api.get(
            `/users/getById/${userId}`
        );

        return response.data;
    }
}
