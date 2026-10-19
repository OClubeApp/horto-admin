import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from 'interfaces/Users';
import { Spin, Table, Form, Button, message } from 'antd';
import useAuth from 'hooks/useAuth';
import UserService from 'services/UserService';
import UserInfoTable from 'components/UserInfoTable';
import PlanFields, {
    PlanFieldsValues,
    toPlanFieldsValues,
    toPlanExpirationIso
} from 'components/PlanFields';
import { getApiErrorMessage } from 'utils/apiError';
import * as S from './styles';
import { getColumns } from './index-helper';

const ShowUsersPage = () => {
    const router = useRouter();
    const { userId } = router.query;
    const { userType } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingPlan, setSavingPlan] = useState(false);
    const isAdmin = userType === 'adm';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (userId) {
                    const userData = await UserService.GetUserById(
                        userId as string
                    );
                    setUser(userData);
                }
            } catch (err) {
                console.error('Erro ao buscar usuário:', err);
                setError('Não foi possível carregar os dados do usuário');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    if (loading) {
        return (
            <S.PageContainer>
                <Spin size="large" tip="Carregando..." />
            </S.PageContainer>
        );
    }

    if (error) {
        return <S.PageContainer>{error}</S.PageContainer>;
    }

    if (!user) {
        return <S.PageContainer>Usuário não encontrado</S.PageContainer>;
    }

    const hasUsedCoupons = user.usedCoupons.length > 0;

    const handlePlanSubmit = async (values: PlanFieldsValues) => {
        setSavingPlan(true);
        try {
            const updatedUser = await UserService.UpdateUserPlan(
                user.id,
                values.planId ?? null,
                toPlanExpirationIso(values)
            );
            setUser(updatedUser);
            message.success('Plano atualizado com sucesso!');
        } catch (err) {
            message.error(
                getApiErrorMessage(err, 'Ocorreu um erro ao atualizar o plano')
            );
        } finally {
            setSavingPlan(false);
        }
    };

    return (
        <S.PageContainer>
            <S.HeaderContainer>
                <h2>Informações do Cliente</h2>
            </S.HeaderContainer>

            <S.SectionContainer>
                <h3>Dados Pessoais</h3>
                <UserInfoTable user={user} userType={userType || 'company'} />
            </S.SectionContainer>

            {isAdmin && (
                <S.SectionContainer>
                    <h3>Plano</h3>
                    <Form
                        layout="vertical"
                        initialValues={toPlanFieldsValues(user)}
                        onFinish={handlePlanSubmit}
                    >
                        <PlanFields scope="individual" />
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={savingPlan}
                        >
                            Salvar Plano
                        </Button>
                    </Form>
                </S.SectionContainer>
            )}

            <S.SectionContainer>
                <h3>Cupons Utilizados</h3>
                {hasUsedCoupons ? (
                    <Table
                        columns={getColumns()}
                        dataSource={user.usedCoupons}
                        rowKey="id"
                        scroll={{ x: true }}
                    />
                ) : (
                    <S.NoCouponsMessage>
                        Nenhum cupom utilizado
                    </S.NoCouponsMessage>
                )}
            </S.SectionContainer>
        </S.PageContainer>
    );
};

export default ShowUsersPage;
