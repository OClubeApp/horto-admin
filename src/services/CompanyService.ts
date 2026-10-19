import { AxiosResponse } from 'axios';
import { Company, ICompanyRequest } from 'interfaces/Companies';
import { User } from 'interfaces/Users';
import api from './api';

export default class CompanyService {
    static async GetAll(): Promise<Company[]> {
        const response: AxiosResponse<Company[]> = await api.get(
            '/companies/getAll'
        );

        return response.data;
    }

    static async GetCompanyById(companyId: string): Promise<Company> {
        const response: AxiosResponse<Company> = await api.get(
            `/companies/getById/${companyId}`
        );
        return response.data;
    }

    static async CreateCompany(data: ICompanyRequest): Promise<Company> {
        // Cria um novo FormData para enviar os dados
        const formData = new FormData();

        // Adiciona os campos simples
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('branch', data.branch);

        // Adiciona a imagem se existir
        if (data.image) {
            formData.append('image', data.image);
        }

        // Adiciona os dados de endereço como JSON stringify
        formData.append('address', JSON.stringify(data.address));

        // Configura o cabeçalho para multipart/form-data
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const response: AxiosResponse<Company> = await api.post(
            '/companies/create',
            formData,
            config
        );
        return response.data;
    }

    static async UpdateCompany(
        companyId: string,
        data: ICompanyRequest
    ): Promise<Company> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);

        // Apenas adiciona a senha se foi fornecida (para updates opcionais)
        if (data.password) {
            formData.append('password', data.password);
        }
        formData.append('branch', data.branch);
        // Adiciona a imagem apenas se foi fornecida
        if (data.image) {
            formData.append('image', data.image);
        }

        // Adiciona os dados de endereço
        formData.append('address', JSON.stringify(data.address));

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const response: AxiosResponse<Company> = await api.patch(
            `/companies/update/${companyId}`,
            formData,
            config
        );
        return response.data;
    }

    // Apenas administradores. planId null remove o plano da empresa
    static async UpdateCompanyPlan(
        companyId: string,
        planId: string | null,
        planExpirationDate: string | null
    ): Promise<Company> {
        const response: AxiosResponse<Company> = await api.patch(
            `/companies/updatePlan/${companyId}`,
            { planId, planExpirationDate }
        );
        return response.data;
    }

    static async deleteCompany(id: string) {
        const response = await api.delete(`/companies/delete/${id}`);
        return response.data;
    }

    static async GetUserByCompanyId(CompanyId: string): Promise<User[]> {
        const response: AxiosResponse<User[]> = await api.get(
            `/companies/users-with-coupons/${CompanyId}`
        );

        return response.data;
    }
}
