'use client';

import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px); // Adjust for header height
  background-color: #f0f2f5;
  padding: 20px;
`;

const ProfileCard = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const InfoItem = styled.p`
  font-size: 18px;
  margin-bottom: 10px;
  color: #555;

  strong {
    color: #333;
  }
`;

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Container>Loading profile...</Container>;
  }

  if (!session?.user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <Container>
      <ProfileCard>
        <Title>User Profile</Title>
        <InfoItem><strong>Name:</strong> {session.user.name || '未設定'}</InfoItem>
        <InfoItem><strong>Email:</strong> {session.user.email || '未設定'}</InfoItem>
        {/* Add more profile fields here */}
      </ProfileCard>
    </Container>
  );
};

export default ProfilePage;
