'use client';

import SignUpForm from '@/components/SignUpForm';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export default function SignUpPageClient() {
  return (
    <Container>
      <SignUpForm />
    </Container>
  );
}
