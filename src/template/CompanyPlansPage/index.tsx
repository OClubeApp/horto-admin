'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import useAuth from 'hooks/useAuth';
import PlanService from 'services/PlansService';
import { IPlan, ISubscribeRequest } from 'interfaces/Plans';
import CompanyPlanCard from 'components/CompanyPlansCards';
import { Company } from 'interfaces/Companies';
import { customFormatDate } from 'utils/dateUtil';
import * as S from './styles';

const PlansPage: React.FC = () => {
    const { user } = useAuth();
    const company = user && 'plan' in user ? (user as Company) : null;
    const [plans, setPlans] = useState<IPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

    const isPlanActive =
        company?.plan &&
        company.planExpirationDate &&
        new Date(company.planExpirationDate) > new Date();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = (await PlanService.GetAll()).filter((plan) => {
                    return plan.subscriptionScope === 'enterprise';
                });
                setPlans(data);
            } catch (err) {
                console.error('Failed to fetch plans:', err);
                setError(
                    'Não foi possível carregar os planos. Tente novamente mais tarde.'
                );
                message.error('Não foi possível carregar os planos.'); // Mensagem de erro do Ant Design
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSubscribe = async (planId: string) => {
        if (!user || !user.id || !user.email) {
            message.warning('Por favor, faça login para adquirir um plano.');
            return;
        }

        try {
            const subscribeData: ISubscribeRequest = {
                entityType: 'company',
                entityId: user.id,
                email: user.email,
                planId,
                back_url: `${window.location.origin}/plans`
            };

            const response = await PlanService.SubscribeToPlan(subscribeData);
            if (response?.checkoutUrl) {
                window.open(response.checkoutUrl, '_blank');
            } else {
                message.error('URL de checkout inválida.');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            message.error('Não foi possível iniciar a assinatura.');
        }
    };

    const handleCancel = async () => {
        if (!company || !company.plan) return;
        setCancelLoading(true);
        setCancelError(null);
        try {
            // Fetch preapprovalId from backend
            const res = await fetch(
                `/api/payments/company-subscription/${company.id}`
            );
            const data = await res.json();
            if (!data.preapprovalId)
                throw new Error('preapprovalId não encontrado');
            await fetch('/api/payments/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preapprovalId: data.preapprovalId
                })
            });
            message.success('Assinatura cancelada com sucesso!');
            // Optionally, refresh company info here
        } catch (err) {
            setCancelError('Erro ao cancelar assinatura.');
        } finally {
            setCancelLoading(false);
        }
    };

    if (loading) {
        return (
            <S.Container>
                <Spin size="large" tip="Carregando planos..." />
            </S.Container>
        );
    }

    if (error) {
        return (
            <S.Container>
                <Alert
                    message="Erro"
                    description={error}
                    type="error"
                    showIcon
                />
            </S.Container>
        );
    }

    if (isPlanActive && company.plan) {
        return (
            <S.Container>
                <S.Title>Seu Plano Atual</S.Title>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '32px',
                        fontSize: '18px'
                    }}
                >
                    <p>
                        <strong>Nome:</strong> {company.plan.name}
                    </p>
                    <p>
                        <strong>Preço:</strong> R$ {company.plan.price}
                    </p>
                    <p>
                        <strong>Expira em:</strong>{' '}
                        {customFormatDate(company.planExpirationDate)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    style={{
                        padding: '8px',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'yellow',
                        backgroundColor: 'blue'
                    }}
                >
                    {cancelLoading ? 'Cancelando...' : 'Cancelar Assinatura'}
                </button>

                <a
                    href="https://www.mercadopago.com.br/subscriptions"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        marginTop: '24px',
                        textDecoration: 'underline'
                    }}
                >
                    Cancelamento de renovação automática (deve ser feito no
                    Mercado Pago)
                </a>
                {cancelError && <Alert type="error" message={cancelError} />}
            </S.Container>
        );
    }

    return (
        <S.Container>
            <S.Title>Escolha seu plano</S.Title>
            <S.CardsContainer>
                {plans.map((plan) => (
                    <CompanyPlanCard
                        key={plan.id}
                        plan={plan}
                        onSubscribe={handleSubscribe}
                    />
                ))}
            </S.CardsContainer>
        </S.Container>
    );
};

export default PlansPage;
