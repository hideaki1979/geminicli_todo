'use client';

import styled, { css } from 'styled-components';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

const HeaderContainer = styled.header`
  background-color: #0079bf;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const LogoContainer = styled.h1`
  font-size: 24px;
  margin: 0;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserName = styled.span`
  font-weight: bold;
`;

const buttonStyles = css`
  background-color: #026aa7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: #005f99;
  }
`;

const AuthButton = styled.button`
  ${buttonStyles}
`;

const AuthLink = styled(Link)`
  ${buttonStyles}
`;

const Header = () => {
  const { data: session, status } = useSession();

  const userName = session?.user.name || 'ユーザー名不明'

  return (
    <HeaderContainer>
      <LogoContainer>
        <Link href="/">Trello Clone</Link>
      </LogoContainer>

      <AuthSection>
        {status === 'loading' ? (
          <span>Loading...</span>
        ) : session?.user ? (
          <>
            <Link href="/profile">
              <UserName>ようこそ、 {userName}さん</UserName>
            </Link>
            <AuthButton onClick={() => signOut({ callbackUrl: '/auth/signin' })}>SignOut</AuthButton>
          </>
        ) : (
          <AuthLink href="/auth/signin">SignIn</AuthLink>
        )}
      </AuthSection>
    </HeaderContainer>
  );
};

export default Header;
