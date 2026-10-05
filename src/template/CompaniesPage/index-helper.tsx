/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Space, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Company } from 'interfaces/Companies';
import { customFormatDateTime } from 'utils/dateUtil';

export const getColumns = (
    handleEdit: (company: Company) => void,
    handleDelete: (companyId: string) => void,
    handleCoupons: (company: Company) => void
) => [
    {
        title: 'Cupons',
        dataIndex: 'Id',
        key: 'Id',
        render: (_text: string, record: Company) => (
            <a onClick={() => handleCoupons(record)} key={record.id}>
                Ver Cupons
            </a>
        )
    },
    {
        title: 'Nome',
        dataIndex: 'name',
        key: 'name',
        render: (_text: string, record: Company) => (
            <span key={record.id}>{record.name}</span>
        )
    },
    {
        title: 'Plano',
        dataIndex: ['plan', 'name'],
        key: 'plan',
        render: (text: string) => <span>{text || 'Sem plano ativo'}</span>
    },
    {
        title: 'Ramo de atuação',
        dataIndex: 'branch',
        key: 'branch',
        render: (text: string) => <span>{text}</span>
    },
    {
        title: 'Validade do Plano',
        dataIndex: 'planExpirationDate',
        key: 'planExpirationDate',
        render: (text: string | null) => (
            <span>{customFormatDateTime(text)}</span>
        )
    },
    {
        title: 'Ação',
        key: 'action',
        render: (record: Company) => (
            <Space size="middle">
                <EditOutlined
                    style={{
                        color: '#CC8D3E',
                        fontSize: '16px'
                    }}
                    onClick={() => handleEdit(record)}
                />

                <Popconfirm
                    title="Tem certeza que deseja excluir este usuário?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Sim"
                    cancelText="Cancelar"
                >
                    <DeleteOutlined
                        style={{ color: '#CC8D3E', fontSize: '16px' }}
                    />
                </Popconfirm>
            </Space>
        )
    }
];
