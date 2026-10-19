import styled from 'styled-components';

export const Container = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
`;

export const FormContainer = styled.div`
    background-color: #fff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const FormSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &:not(:last-child) {
        padding-right: 20px;
        border-right: 1px solid #cacaca;
    }
`;

export const PlanSection = styled.div`
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #cacaca;
`;

export const ImageUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
`;

export const ImageUploadBox = styled.div`
    width: 150px;
    height: 150px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
        border-color: #1890ff;
    }
`;
