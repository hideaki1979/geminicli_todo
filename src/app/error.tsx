'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f0f2f5;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #d32f2f; /* エラーを示す赤色 */
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;

  &:hover {
    background-color: #026aa7;
  }
`;

const StyledLink = styled(Link)`
  padding: 10px 20px;
  background-color: #6b778c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;

  &:hover {
    background-color: #5a687a;
  }
`;

interface ErrorProps {
  error: Error;
  reset: () => void;
}

const GlobalErrorPage = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    // エラー情報をロギングサービスに送信するなどの処理をここに記述
    console.error(error);
  }, [error]);

  return (
    <Container>
      <Title>エラーが発生しました</Title>
      <Message>ご迷惑をおかけしております。問題の解決に向けて対応中です。</Message>
      <ButtonContainer>
        <Button onClick={() => reset()}>再試行</Button>
        <StyledLink href="/">トップページに戻る</StyledLink>
      </ButtonContainer>
    </Container>
  );
};

export default GlobalErrorPage;
