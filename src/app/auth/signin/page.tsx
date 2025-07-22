import type { Metadata } from "next";
import SignInForm from '@/components/SignInForm';

export const metadata: Metadata = {
  title: 'サインイン',
};

const SignInPage = () => {
  return <SignInForm />;
};

export default SignInPage;