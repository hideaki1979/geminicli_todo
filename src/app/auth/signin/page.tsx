import type { Metadata } from "next";
import SignInForm from '@/components/SignInForm';
import { Suspense } from 'react'; // Import Suspense

export const metadata: Metadata = {
  title: 'サインイン',
};

const SignInPage = () => {
  return (
    <Suspense fallback={null}> {/* Wrap SignInForm with Suspense */}
      <SignInForm />
    </Suspense>
  );
};

export default SignInPage;