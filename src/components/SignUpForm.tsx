'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link'; // Import Link
import { Button, Input, ErrorMessage } from '@/components/common/ModalElements';

// Styled Components from SignInForm.tsx
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const FormWrapper = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const StyledInput = styled(Input)`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const StyledButton = styled(Button).attrs({ className: 'primary' })`
  width: 100%;
  padding: 10px;
  font-size: 16px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.p`
  color: green;
`;

const NavigationText = styled.p`
  margin-top: 24px;
  font-size: 14px;
`;

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      // 登録成功後、ログインページにリダイレクト
      router.push('/auth/signin');
    } else {
      setError(data.message || '登録に失敗しました。');
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>新規登録</Title>
        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage data-testid="error-message">{error}</ErrorMessage>}
          <StyledInput
            id='name'
            name='name'
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="username-input"
          />
          <StyledInput
            id='email'
            name='email'
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="email-input"
          />
          <StyledInput
            id='password'
            name='password'
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="password-input"
          />
          <StyledButton type="submit" data-testid="signup-button">登録</StyledButton>
          {success && <SuccessMessage data-testid="success-message">{success}</SuccessMessage>}
        </form>
        <NavigationText>
          アカウントをお持ちですか？ <Link href="/auth/signin">ログイン</Link>
        </NavigationText>
      </FormWrapper>
    </Container>
  );
}
