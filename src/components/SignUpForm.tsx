'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Button, Input, ErrorMessage } from '@/components/common/ModalElements';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  margin: 0 auto;
`;

const SuccessMessage = styled.p`
  color: green;
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
    <Form onSubmit={handleSubmit}>
      <h2>新規登録</h2>
      <Input
        type="text"
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        data-testid="username-input"
      />
      <Input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        data-testid="email-input"
      />
      <Input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        data-testid="password-input"
      />
      <Button className='primary' type="submit" data-testid="signup-button">登録</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Form>
  );
}
