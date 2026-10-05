/* eslint-disable no-console */
import React, { useState } from 'react';
import {
    Form,
    Input,
    DatePicker,
    Typography,
    Switch,
    message,
    Select,
    InputNumber, // Importe o InputNumber para campos numéricos
    Upload,
    Button
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import EventService from 'services/EventService';
import { IEventRequest } from 'interfaces/Events';
import moment from 'moment'; // Importe o moment para manipulação de datas
import CepInput from 'components/CepInput';
import * as S from './styles';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CreateEventPage = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [eventType, setEventType] = useState<string>('Sorteio'); // Estado para controlar o tipo de evento
    const [imageFile, setImageFile] = useState<File | null>(null);

    const beforeUpload = (file: File) => {
        setImageFile(file);
        return false; // Prevent automatic upload
    };

    const onFinish = async (
        values: Omit<IEventRequest, 'image'> & {
            eventDateRange: moment.Moment[];
        }
    ) => {
        try {
            setLoading(true);

            // Converte as datas do RangePicker para strings no formato ISO 8601
            const [eventStartDate, eventEndDate] = values.eventDateRange.map(
                (date) => date.toISOString()
            );

            // Remove o campo eventDateRange do objeto values
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { eventDateRange, ...restValues } = values;

            const eventData: IEventRequest = {
                ...restValues,
                eventStartDate,
                eventEndDate,
                active: values.active || true,
                image: imageFile // Adiciona o arquivo de imagem
            };

            await EventService.CreateEvent(eventData);
            message.success('Evento criado com sucesso!');
            router.push('/Events');
        } catch (error) {
            console.error('Erro ao criar o evento:', error);
            message.error('Erro ao criar o evento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <S.Container>
            <S.FormContainer>
                <S.Title>Criar Novo Evento</S.Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ active: true }}
                >
                    <S.Wrapper>
                        <Typography.Title level={5}>
                            Nome do Evento
                        </Typography.Title>
                        <Form.Item
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, insira o nome do evento'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Typography.Title level={5}>
                            Nome da Empresa
                        </Typography.Title>
                        <Form.Item
                            name="companyName"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, insira o nome da empresa'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Typography.Title level={5}>
                            Tipo de Evento
                        </Typography.Title>
                        <Form.Item
                            name="eventType"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, selecione o tipo de evento'
                                }
                            ]}
                        >
                            <Select
                                placeholder="Selecione o tipo de evento"
                                onChange={(value) => setEventType(value)} // Atualiza o estado ao mudar
                            >
                                <Option value="Presencial">Presencial</Option>
                                <Option value="Sorteio">Sorteio</Option>
                            </Select>
                        </Form.Item>

                        <Typography.Title level={5}>
                            Data do Evento
                        </Typography.Title>
                        <Form.Item
                            name="eventDateRange"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, selecione a data do evento'
                                }
                            ]}
                        >
                            <RangePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Form.Item>

                        <Typography.Title level={5}>
                            Recompensa
                        </Typography.Title>
                        <Form.Item
                            name="reward"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira a recompensa'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Typography.Title level={5}>Regras</Typography.Title>
                        <Form.Item
                            name="rules"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira as regras'
                                }
                            ]}
                        >
                            <TextArea rows={5} />
                        </Form.Item>

                        <Typography.Title level={5}>Link</Typography.Title>
                        <Form.Item
                            name="link"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, insira o link'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Typography.Title level={5}>
                            Imagem do Evento
                        </Typography.Title>
                        <Form.Item
                            name="image"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        'Por favor, adicione uma imagem para o evento'
                                }
                            ]}
                        >
                            <Upload
                                beforeUpload={beforeUpload}
                                maxCount={1}
                                accept="image/*"
                                listType="picture"
                            >
                                <Button icon={<UploadOutlined />}>
                                    Selecionar Imagem
                                </Button>
                            </Upload>
                        </Form.Item>

                        {/* Mostrar campos de endereço apenas se o tipo de evento for "Presencial" */}
                        {eventType === 'Presencial' && (
                            <>
                                <Typography.Title level={5}>
                                    Endereço
                                </Typography.Title>
                                <Form.Item
                                    name={['address', 'cep']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Por favor, insira o CEP'
                                        }
                                    ]}
                                >
                                    <CepInput />
                                </Form.Item>
                                <Form.Item
                                    name={['address', 'street']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Por favor, insira a rua'
                                        }
                                    ]}
                                >
                                    <Input placeholder="Rua" />
                                </Form.Item>
                                <Form.Item
                                    name={['address', 'numberHouse']}
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Por favor, insira o número'
                                        },
                                        {
                                            type: 'number',
                                            message:
                                                'O número deve ser um valor numérico'
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="Número"
                                        style={{ width: '100%' }} // Ocupa toda a largura disponível
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={['address', 'neighborhood']}
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Por favor, insira o bairro'
                                        }
                                    ]}
                                >
                                    <Input placeholder="Bairro" />
                                </Form.Item>
                                <Form.Item
                                    name={['address', 'city']}
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Por favor, insira a cidade'
                                        }
                                    ]}
                                >
                                    <Input placeholder="Cidade" />
                                </Form.Item>
                                <Form.Item
                                    name={['address', 'state']}
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Por favor, insira o estado'
                                        }
                                    ]}
                                >
                                    <Input placeholder="Estado" />
                                </Form.Item>
                            </>
                        )}

                        <Typography.Title level={5}>Ativo</Typography.Title>
                        <Form.Item name="active" valuePropName="checked">
                            <Switch defaultChecked /> {/* Inicia como true */}
                        </Form.Item>

                        <Form.Item>
                            <S.ConfirmButton
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                CONFIRMAR
                            </S.ConfirmButton>
                        </Form.Item>
                    </S.Wrapper>
                </Form>
            </S.FormContainer>
        </S.Container>
    );
};

export default CreateEventPage;
