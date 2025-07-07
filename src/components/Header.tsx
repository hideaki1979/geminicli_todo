'use client';

import styled from 'styled-components';
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

const Logo = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserName = styled.span`
  font-weight: bold;
`;

const AuthButton = styled.button`
  background-color: #026aa7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background-color: #005f99;
  }
`;

const Header = () => {
  const { data: session } = useSession();

  return (
    <HeaderContainer>
      <Link href="/">
        <Logo>Trello Clone</Logo>
      </Link>
      <AuthSection>
        {session?.user ? (
          <>
            <Link href="/profile">
              <UserName>Welcome, {session.user.name}</UserName>
            </Link>
            <AuthButton onClick={() => signOut({ callbackUrl: '/auth/signin' })}>Sign Out</AuthButton>
          </>
        ) : (
          <Link href="/auth/signin">
            <AuthButton>Sign In</AuthButton>
          </Link>
        )}
      </AuthSection>
    </HeaderContainer>
  );
};

export default Header;
