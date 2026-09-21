import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApiError } from '../hooks/useApiError';
import AuthLayout from '../components/templates/AuthLayout';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';

export default function SignupPage() {
  const { register, user } = useAuth();
  const { handleError } = useApiError();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      handleError(null, 'Please fill all fields');
      return;
    }
    if (password.length < 6) {
      handleError(null, 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err) {
      handleError(err, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD814] shadow-sm">
          <UserPlus size={28} className="text-[#E47911]" />
        </div>
        <h1 className="text-3xl font-black text-[#0F1111] tracking-tight">Create Account</h1>
        <p className="text-gray-600 mt-2 text-sm">Join Aureza and start shopping</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        
        <FormField label="Password" name="password">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
          Create your Aureza account
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-8 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-[#007185] font-bold hover:underline hover:text-[#C7511F] transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
