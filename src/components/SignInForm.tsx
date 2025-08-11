'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';

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

const ErrorMessage = styled.p`
  color: #d32f2f;
  background-color: #ffcdd2;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #026aa7;
  }
`;

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('無効なユーザー名またはパスワードです。');
        } else {
          setError(result.error);
        }
      } else {
        setError('');
        // Do nothing here, useEffect will handle the redirect after session is updated
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('接続エラーが発生しました。しばらくしてから再度お試しください。');
    }

  };

  if (status === "loading") {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Container>
      <FormWrapper>
        <Title>ログイン</Title>
        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage data-testid="error-message">{error}</ErrorMessage>}
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label='メールアドレス'
            required
            data-testid="email-input"
          />
          <Input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label='パスワード'
            required
            data-testid="password-input"
          />
          <Button type="submit" data-testid="signin-button">ログイン</Button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          アカウントをお持ちでないですか？ <Link href="/auth/signup">新規登録</Link>
        </p>
      </FormWrapper>
    </Container>
  );
};

export default SignInForm;
