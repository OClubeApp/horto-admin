import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Flex,
    message
} from 'antd';
import { useRouter } from 'next/router';
import CompanyService from 'services/CompanyService';
import { ICompanyRequest } from 'interfaces/Companies';
import ImagePicker from 'components/ImagePiker';
import StateSelect from 'components/StateSelect';
import * as S from './styles';

const { Text } = Typography;

const EditCompanyPage = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const { companyId } = router.query;
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialImage, setInitialImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompanyData = async () => {
            if (companyId) {
                setLoading(true);
                try {
                    const company = await CompanyService.GetCompanyById(
                        companyId as string
                    );

                    // Preenche o formulário com os dados da empresa
                    if (company) {
                        form.setFieldsValue({
                            name: company.name,
                            email: company.email,
                            branch: company.branch,
                            address: {
                                street: company.address.street,
                                numberHouse: company.address.numberHouse,
                                neighborhood: company.address.neighborhood,
                                city: company.address.city,
                                state: company.address.state,
                                cep: company.address.cep
                            }
                        });
                    }

                    // Armazena a imagem inicial se existir
                    if (company?.linkImage) {
                        setInitialImage(company.linkImage);
                    }
                } catch (error) {
                    console.error('Erro ao carregar empresa:', error);
                    message.error('Erro ao carregar dados da empresa');
                    router.push('/Companies');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCompanyData();
    }, [companyId, form, router]);

    const onFinish = async (values: ICompanyRequest) => {
        setLoading(true);
        try {
            const companyData: ICompanyRequest = {
                name: values.name,
                email: values.email,
                // Só envia a senha se foi alterada
                password: values.password,
                branch: values.branch,
                address: {
                    street: values.address.street,
                    numberHouse: Number(values.address.numberHouse),
                    neighborhood: values.address.neighborhood,
                    city: values.address.city,
                    state: values.address.state,
                    cep: values.address.cep
                },
                // Envia a nova imagem se foi selecionada, senão mantém a original
                image: selectedImage || null
            };

            await CompanyService.UpdateCompany(
                companyId as string,
                companyData
            );
            message.success('Empresa atualizada com sucesso!');
            router.push('/Companies');
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error);
            message.error('Ocorreu um erro ao atualizar a empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (file: File) => {
        setSelectedImage(file);
    };

    return (
        <S.Container>
            <Typography.Title level={2} style={{ marginBottom: 24 }}>
                Editar Empresa
            </Typography.Title>

            <S.FormContainer>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Flex gap={40} style={{ width: '100%' }}>
                        {/* Coluna 1 - Dados da Empresa */}
                        <S.FormSection>
                            <Typography.Title level={4}>
                                Dados da Empresa
                            </Typography.Title>

                            <Form.Item
                                label="Nome da Empresa"
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Por favor, insira o nome da empresa'
                                    }
                                ]}
                            >
                                <Input placeholder="Digite o nome da empresa" />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira o email'
                                    },
                                    { type: 'email', message: 'Email inválido' }
                                ]}
                            >
                                <Input placeholder="email@empresa.com" />
                            </Form.Item>

                            <Form.Item
                                label="Nova Senha (opcional)"
                                name="password"
                            >
                                <Input.Password placeholder="Digite uma nova senha" />
                            </Form.Item>

                            <Form.Item
                                label="Ramo de Atuação"
                                name="branch"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Por favor, insira o ramo de atuação'
                                    }
                                ]}
                            >
                                <Input placeholder="Ex: Tecnologia, Alimentício, etc." />
                            </Form.Item>

                            <Form.Item label="Logo da Empresa">
                                <ImagePicker
                                    onImageSelect={handleImageSelect}
                                    initialImage={initialImage}
                                />
                                <Text type="secondary">
                                    Tamanho recomendado: 300x300px
                                </Text>
                            </Form.Item>
                        </S.FormSection>

                        {/* Coluna 2 - Endereço */}
                        <S.FormSection>
                            <Typography.Title level={4}>
                                Endereço
                            </Typography.Title>

                            <Form.Item
                                label="Rua"
                                name={['address', 'street']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira a rua'
                                    }
                                ]}
                            >
                                <Input placeholder="Nome da rua" />
                            </Form.Item>

                            <Form.Item
                                label="Número"
                                name={['address', 'numberHouse']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira o número'
                                    }
                                ]}
                            >
                                <Input type="number" placeholder="Número" />
                            </Form.Item>

                            <Form.Item
                                label="Bairro"
                                name={['address', 'neighborhood']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira o bairro'
                                    }
                                ]}
                            >
                                <Input placeholder="Nome do bairro" />
                            </Form.Item>

                            <Form.Item
                                label="Cidade"
                                name={['address', 'city']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira a cidade'
                                    }
                                ]}
                            >
                                <Input placeholder="Nome da cidade" />
                            </Form.Item>

                            <Form.Item
                                label="Estado"
                                name={['address', 'state']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, selecione o estado'
                                    }
                                ]}
                            >
                                <StateSelect />
                            </Form.Item>

                            <Form.Item
                                label="CEP"
                                name={['address', 'cep']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor, insira o CEP'
                                    },
                                    {
                                        pattern: /^\d{5}-\d{3}$/,
                                        message:
                                            'CEP deve estar no formato 00000-000'
                                    }
                                ]}
                            >
                                <Input placeholder="00000-000" maxLength={9} />
                            </Form.Item>
                        </S.FormSection>
                    </Flex>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            style={{ width: 200 }}
                        >
                            Atualizar Empresa
                        </Button>
                    </Form.Item>
                </Form>
            </S.FormContainer>
        </S.Container>
    );
};

export default EditCompanyPage;
