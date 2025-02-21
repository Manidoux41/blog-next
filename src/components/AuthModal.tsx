'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
};

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      setEmail('');
      setPassword('');
      setName('');
      setError('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (isLogin) {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
    
        if (result?.error) {
          setError(result.error);
        } else if (result?.ok) {
          onClose();
          router.push('/admin');
          router.refresh();
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('An error occurred during login. Please try again.');
      }
    } else {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
    
        const result = await registerUser(formData);
    
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          const signInResult = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });
    
          if (signInResult?.error) {
            setError(signInResult.error);
          } else if (signInResult?.ok) {
            onClose();
            router.push('/admin');
            router.refresh();
          }
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('An error occurred during registration. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}