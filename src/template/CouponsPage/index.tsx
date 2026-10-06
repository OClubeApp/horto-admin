import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useRouter } from 'next/router';
import { ICoupon } from 'interfaces/Coupons';
import { Company } from 'interfaces/Companies';
import CouponCard from 'components/CouponCard';
import CouponModal from 'components/Modals/CouponModal';
import CouponServices from 'services/CouponServices';
import CompanyService from 'services/CompanyService';
import useAuth from 'hooks/useAuth';
import { customFormatDate } from 'utils/dateUtil';
import * as S from './styles';

const CouponsPage = () => {
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null); // Estado para o cupom selecionado
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade do modal

    const { companyId } = router.query;
    const { userType } = useAuth();
    // Empresas só visualizam os próprios cupons; criação/edição é do administrador
    const isCompany = userType === 'company';

    useEffect(() => {
        if (companyId) {
            const fetchCompany = async () => {
                try {
                    setLoading(true);
                    const companyData = await CompanyService.GetCompanyById(
                        companyId as string
                    );
                    setCompany(companyData || null);
                } catch (error) {
                    console.error('Erro ao carregar empresa:', error);
                    message.error('Erro ao carregar dados da empresa.');
                } finally {
                    setLoading(false);
                }
            };
            fetchCompany();
        }
    }, [companyId]);

    const navigateToCouponCreate = (couponId?: string) => {
        const query: { companyId?: string; couponId?: string } = {};

        if (company) {
            query.companyId = company.id;
        }
        if (couponId) {
            query.couponId = couponId;
        }

        router.push({
            pathname: 'CreateCoupon',
            query
        });
    };

    const handleDelete = async (couponId: string) => {
        try {
            await CouponServices.delete(couponId);
            message.success('Cupom deletado com sucesso!');
            if (companyId) {
                const companyData = await CompanyService.GetCompanyById(
                    companyId as string
                );

                setCompany(companyData || null);
            }
        } catch (error) {
            console.error('Erro ao deletar cupom:', error);
            message.error('Falha ao deletar cupom. Tente novamente.');
        }
    };

    // Função para lidar com o clique no card
    const handleCardClick = (coupon: ICoupon) => {
        setSelectedCoupon(coupon);
        setModalVisible(true);
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!company) {
        return <div>Empresa não encontrada.</div>;
    }

    return (
        <S.PageContainer>
            <S.HeaderContainer>
                <h2>
                    {isCompany
                        ? 'Visualização de cupons'
                        : `Cupons ativos: ${company.name}`}
                </h2>
                {!isCompany && (
                    <S.PlusIconWrapper>
                        <PlusOutlined
                            onClick={() => navigateToCouponCreate()}
                        />
                    </S.PlusIconWrapper>
                )}
            </S.HeaderContainer>
            {company.plan?.name ? (
                <h3>
                    Plano Atual: {company.plan.name} - Vencimento em:{' '}
                    {customFormatDate(company.planExpirationDate)}
                </h3>
            ) : (
                <h3>Nenhum plano ativo.</h3>
            )}
            <S.CardsContainer>
                {company.coupons.map((coupon: ICoupon) => (
                    <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        onEdit={() => navigateToCouponCreate(coupon.id)}
                        onDelete={() => handleDelete(coupon.id)}
                        onClick={handleCardClick} // Adiciona a prop onClick
                    />
                ))}
            </S.CardsContainer>

            {/* Modal de detalhes do cupom */}
            <CouponModal
                coupon={selectedCoupon}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </S.PageContainer>
    );
};

export default CouponsPage;
