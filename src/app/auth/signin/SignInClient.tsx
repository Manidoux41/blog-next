'use client';

import AuthModal from "@/components/AuthModal";
import { useRouter } from 'next/navigation';

export default function SignInClient() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthModal isOpen={true} onClose={handleClose} initialMode="login" />
    </div>
  );
}