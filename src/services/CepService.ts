export interface CepAddress {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

interface ViaCepResponse {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean | string;
}

export const formatCep = (value: string) =>
    value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/^(\d{5})(\d)/, '$1-$2');

export default class CepService {
    // Retorna null quando o CEP não existe
    static async getAddress(cep: string): Promise<CepAddress | null> {
        const response = await fetch(
            `https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`
        );
        if (!response.ok) return null;

        const data: ViaCepResponse = await response.json();
        if (data.erro) return null;

        // CEPs gerais de cidade vêm sem rua/bairro: omite campos vazios para não apagar o que já foi digitado
        const address: CepAddress = {
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
        };
        return Object.fromEntries(
            Object.entries(address).filter(([, value]) => value)
        );
    }
}
