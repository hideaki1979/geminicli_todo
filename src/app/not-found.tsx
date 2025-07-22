'use client';

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
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #172b4d;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.25rem;
  color: #6b778c;
  margin-bottom: 2rem;
`;

const StyledLink = styled(Link)`
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

const NotFoundPage = () => {
  return (
    <Container>
      <Title>404 - Page Not Found</Title>
      <Message>お探しのページは見つかりませんでした。</Message>
      <StyledLink href="/">トップページに戻る</StyledLink>
    </Container>
  );
};

export default NotFoundPage;
