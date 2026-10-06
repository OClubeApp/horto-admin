import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Input, DatePicker, Select, message, Switch } from 'antd';
import { ICoupon, ICouponRequest } from 'interfaces/Coupons';
import CouponServices from 'services/CouponServices';
import PlanService from 'services/PlansService';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { IPlan } from 'interfaces/Plans';
import useAuth from 'hooks/useAuth';
import * as S from './styles';

dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);

const { Option } = Select;

const CreateCoupon = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<ICoupon | null>(null);
    const [plans, setPlans] = useState<IPlan[]>([]);

    const { companyId, couponId } = router.query;
    // Empresas só visualizam o cupom; criação/edição é do administrador
    const isCompany = useAuth().userType === 'company';

    const getTitle = () => {
        if (isCompany) return 'Visualização de Cupom';
        return couponId ? 'Editar Cupom' : 'Criar Cupom';
    };

    // Buscar planos
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await PlanService.GetAll();
                setPlans(data);
            } catch {
                message.error('Erro ao carregar planos.');
            }
        };
        fetchPlans();
    }, []);

    // Buscar cupom para edição
    useEffect(() => {
        if (couponId) {
            const fetchCoupon = async () => {
                try {
                    setLoading(true);
                    const coupon = await CouponServices.getCouponById(
                        couponId as string
                    );

                    const acceptedPlanIds =
                        coupon.acceptedPlans?.map((p) => p.id) || [];

                    const formattedCoupon = {
                        ...coupon,
                        expirationDate: coupon.expirationDate || '',
                        acceptedPlanIds // agora apenas IDs
                    };

                    setInitialValues(formattedCoupon);
                    form.setFieldsValue({
                        ...formattedCoupon,
                        expirationDate: coupon.expirationDate
                            ? dayjs(coupon.expirationDate)
                            : null
                    });
                } catch {
                    message.error('Erro ao carregar cupom.');
                } finally {
                    setLoading(false);
                }
            };
            fetchCoupon();
        }
    }, [couponId, form]);

    const handleSubmit = async (values: ICouponRequest) => {
        try {
            setLoading(true);

            const payload: ICouponRequest = {
                ...values,
                acceptedPlanIds: values.acceptedPlanIds || [],
                companyId: companyId as string
            };

            if (couponId) {
                await CouponServices.update({
                    data: payload,
                    couponId: couponId as string
                });
                message.success('Cupom atualizado com sucesso!');
            } else {
                await CouponServices.create(payload);
                message.success('Cupom criado com sucesso!');
            }

            router.push('/Companies');
        } catch {
            message.error('Erro ao salvar cupom.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <S.PageContainer>
            <h1>{getTitle()}</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialValues || undefined}
                disabled={isCompany}
            >
                <Form.Item
                    label="Nome"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, insira o nome do cupom!'
                        }
                    ]}
                >
                    <Input placeholder="Nome do cupom" />
                </Form.Item>

                <Form.Item
                    label="Tipo de Cupom"
                    name="couponType"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, selecione o tipo de cupom!'
                        }
                    ]}
                >
                    <Select placeholder="Selecione o tipo">
                        <Option value="BASIC">BASIC</Option>
                        <Option value="PREMIUM">PREMIUM</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Planos Aceitos"
                    name="acceptedPlanIds"
                    rules={[
                        {
                            required: true,
                            message: 'Selecione ao menos um plano!'
                        }
                    ]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Selecione os planos"
                        optionFilterProp="children"
                    >
                        {plans.map((plan) => (
                            <Option key={plan.id} value={plan.id}>
                                {plan.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Data de Expiração"
                    name="expirationDate"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, selecione a data de expiração!'
                        }
                    ]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Recompensa"
                    name="reward"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, insira a recompensa!'
                        }
                    ]}
                >
                    <Input placeholder="Recompensa" />
                </Form.Item>

                <Form.Item
                    label="Pagamento"
                    name="payment"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, insira o pagamento!'
                        }
                    ]}
                >
                    <Input placeholder="Pagamento" />
                </Form.Item>

                <Form.Item
                    label="Regras"
                    name="rules"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, insira as regras!'
                        }
                    ]}
                >
                    <Input.TextArea placeholder="Regras" />
                </Form.Item>

                <Form.Item
                    label="Ativo"
                    name="active"
                    valuePropName="checked"
                    rules={[
                        {
                            required: true,
                            message: 'Por favor, defina o status do cupom!'
                        }
                    ]}
                >
                    <Switch
                        checkedChildren="Ativo"
                        unCheckedChildren="Inativo"
                    />
                </Form.Item>

                {!isCompany && (
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {couponId ? 'Atualizar Cupom' : 'Criar Cupom'}
                        </Button>
                    </Form.Item>
                )}
            </Form>
        </S.PageContainer>
    );
};

export default CreateCoupon;
