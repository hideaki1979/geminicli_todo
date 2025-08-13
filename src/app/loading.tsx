'use client';

import styled, { keyframes } from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  position: relative;
`;

const LoadingText = styled.p`
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
`;

const ProgressBarContainer = styled.div`
  width: 50%;
  max-width: 400px;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
`;

const progressAnimation = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #0079bf;
  border-radius: 5px;
  animation: ${progressAnimation} 1.5s infinite alternate; /* Changed to alternate for a pulsing effect */
`;

const Loading = () => {
  return (
    <LoadingContainer>
      <LoadingText>Loading...</LoadingText>
      <ProgressBarContainer>
        <ProgressBar />
      </ProgressBarContainer>
    </LoadingContainer>
  );
};

export default Loading;