import React, { useState } from 'react';
import { Form, Input, Spin, message } from 'antd';
import CepService, { formatCep } from 'services/CepService';

interface CepInputProps {
    value?: string;
    onChange?: (value: string) => void;
}

// Campo de CEP para Form.Item name={['address', 'cep']}: ao completar o CEP, preenche os demais campos de address
const CepInput: React.FC<CepInputProps> = ({ value, onChange }) => {
    const form = Form.useFormInstance();
    const [loading, setLoading] = useState(false);

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const cep = formatCep(event.target.value);
        onChange?.(cep);
        if (cep.length !== 9) return;

        setLoading(true);
        try {
            const address = await CepService.getAddress(cep);
            // Ignora a resposta se o CEP mudou durante a busca
            if (form.getFieldValue(['address', 'cep']) !== cep) return;
            if (!address) {
                message.warning('CEP não encontrado');
                return;
            }
            form.setFieldsValue({ address });
        } catch {
            message.error('Não foi possível buscar o CEP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Input
            value={value}
            onChange={handleChange}
            placeholder="00000-000"
            inputMode="numeric"
            maxLength={9}
            // suffix sempre presente: trocar entre elemento e nada remonta o input e tira o foco
            suffix={<Spin size="small" spinning={loading} />}
        />
    );
};

export default CepInput;
