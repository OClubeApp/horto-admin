import axios from 'axios';

const FIELD_LABELS: Record<string, string> = {
    name: 'nome',
    email: 'email',
    password: 'senha',
    newPassword: 'senha',
    branch: 'ramo de atuação',
    address: 'endereço',
    'address.cep': 'CEP'
};

// Mensagens do backend que vêm em inglês
const MESSAGES: Record<string, string> = {
    'Invalid address format.': 'Endereço inválido',
    'Missing JWT token': 'Sessão expirada. Faça login novamente.',
    'Invalid JWT token': 'Sessão expirada. Faça login novamente.'
};

// Extrai uma mensagem legível do erro retornado pelo backend.
// Formatos: AppError -> { message }, validação -> "Validation error: ... in field x", outros -> { error }
export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) return fallback;

    if (!error.response) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }

    const data = error.response.data as
        | { message?: string; error?: string }
        | undefined;
    const message = data?.message ?? data?.error;
    if (!message) return fallback;

    if (message.startsWith('Validation error:')) {
        const fields = Array.from(
            message.matchAll(/in field (\S+?)(?:,|$)/g),
            ([, field]) => FIELD_LABELS[field] ?? field
        );
        const unique = Array.from(new Set(fields));
        return unique.length
            ? `Dados inválidos: verifique ${unique.join(', ')}`
            : 'Dados inválidos';
    }

    return MESSAGES[message] ?? message;
}
