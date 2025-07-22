'use client';

import styled from 'styled-components';

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

export const Button = styled.button`
  padding: 8px 16px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;

  &.primary {
    background-color: #0079bf;
    color: white;
    &:hover {
      background-color: #026aa7;
    }
  }

  &.secondary {
    background-color: #f4f5f7;
    color: #172b4d;
    &:hover {
      background-color: #e1e4e8;
    }
  }

  &.danger {
    background-color: #eb5a46;
    color: white;
    &:hover {
      background-color: #c44738;
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 2px solid #dfe1e6;
  border-radius: 3px;
  box-sizing: border-box;
  &:focus {
    border-color: #4c9aff;
    outline: none;
  }
`;

export const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  margin-top: -4px;
  margin-bottom: 8px;
`;
