import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApiError } from '../hooks/useApiError';
import AuthLayout from '../components/templates/AuthLayout';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';

export default function LoginPage() {
  const { login, user } = useAuth();
  const { handleError } = useApiError();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      handleError(null, 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      handleError(err, 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD814] shadow-sm">
          <LogIn size={28} className="text-[#E47911]" />
        </div>
        <h1 className="text-3xl font-black text-[#0F1111] tracking-tight">Sign In</h1>
        <p className="text-gray-600 mt-2 text-sm">Sign in to your Aureza account</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        
        <FormField label="Password" name="password">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F1111] transition-colors p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </FormField>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          className="mt-2"
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-8 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#007185] font-bold hover:underline hover:text-[#C7511F] transition-colors">
          Create your account
        </Link>
      </p>
    </AuthLayout>
  );
}
