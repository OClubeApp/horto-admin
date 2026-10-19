import React, { useEffect, useState } from 'react';
import { Form, Select, DatePicker, Flex, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import PlanService from 'services/PlansService';
import { IPlan } from 'interfaces/Plans';

export interface PlanFieldsValues {
    planId?: string;
    planExpirationDate?: Dayjs;
}

// Valores iniciais dos campos a partir da entidade (empresa ou usuário)
export const toPlanFieldsValues = (entity: {
    planId: string | null;
    planExpirationDate: string | null;
}): PlanFieldsValues => ({
    planId: entity.planId ?? undefined,
    planExpirationDate: entity.planExpirationDate
        ? dayjs(entity.planExpirationDate)
        : undefined
});

// Validade vai até o fim do dia escolhido; sem plano, sem validade
export const toPlanExpirationIso = (values: PlanFieldsValues) =>
    values.planId && values.planExpirationDate
        ? values.planExpirationDate.endOf('day').toISOString()
        : null;

interface PlanFieldsProps {
    scope: IPlan['subscriptionScope'];
}

// Campos de plano + validade; precisa estar dentro de um <Form> do antd
const PlanFields: React.FC<PlanFieldsProps> = ({ scope }) => {
    const form = Form.useFormInstance();
    const [plans, setPlans] = useState<IPlan[]>([]);

    useEffect(() => {
        PlanService.GetAll()
            .then((allPlans) =>
                setPlans(
                    allPlans.filter((plan) => plan.subscriptionScope === scope)
                )
            )
            .catch(() => message.error('Erro ao carregar planos'));
    }, [scope]);

    // Ao trocar o plano, sugere a validade a partir da duração do plano
    const handlePlanChange = (planId?: string) => {
        const plan = plans.find((p) => p.id === planId);
        form.setFieldsValue({
            planExpirationDate: plan
                ? dayjs().add(plan.duration, 'day')
                : undefined
        });
    };

    return (
        <Flex gap={40}>
            <Form.Item label="Plano" name="planId" style={{ flex: 1 }}>
                <Select
                    allowClear
                    placeholder="Sem plano ativo"
                    onChange={handlePlanChange}
                    options={plans.map((plan) => ({
                        value: plan.id,
                        label: plan.name
                    }))}
                />
            </Form.Item>

            <Form.Item
                label="Validade do Plano"
                name="planExpirationDate"
                style={{ flex: 1 }}
                dependencies={['planId']}
                rules={[
                    ({ getFieldValue }) => ({
                        required: !!getFieldValue('planId'),
                        message: 'Por favor, selecione a validade do plano'
                    })
                ]}
            >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
        </Flex>
    );
};

export default PlanFields;
