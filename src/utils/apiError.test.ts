import { AxiosError } from 'axios';
import { getApiErrorMessage } from './apiError';

const apiError = (data?: unknown) => {
    const error = new AxiosError('Request failed');
    if (data !== undefined) {
        error.response = { data } as AxiosError['response'];
    }
    return error;
};

describe('getApiErrorMessage', () => {
    it('retorna a mensagem do backend', () => {
        expect(
            getApiErrorMessage(
                apiError({
                    message: 'Já existe uma empresa cadastrada com esse email'
                }),
                'fallback'
            )
        ).toBe('Já existe uma empresa cadastrada com esse email');
    });

    it('resume erros de validação pelos campos', () => {
        const message =
            'Validation error: Invalid value in field password, Password must contain at least one number in field password, O campo email deve ser um email válido in field email';
        expect(getApiErrorMessage(apiError({ message }), 'fallback')).toBe(
            'Dados inválidos: verifique senha, email'
        );
    });

    it('traduz mensagens conhecidas e usa fallback no resto', () => {
        expect(
            getApiErrorMessage(
                apiError({ error: 'Invalid address format.' }),
                'x'
            )
        ).toBe('Endereço inválido');
        expect(getApiErrorMessage(apiError({}), 'fallback')).toBe('fallback');
        expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe(
            'fallback'
        );
        expect(getApiErrorMessage(apiError(), 'fallback')).toMatch(
            /conectar ao servidor/
        );
    });
});
