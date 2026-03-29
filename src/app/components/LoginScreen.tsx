import { useState } from 'react';
import { Mail, Lock, Shield, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface LoginScreenProps {
  userType: 'student' | 'admin';
  onLogin: (email: string, userType: 'student' | 'admin', userId: number, departmentId?: number) => void;
}

export function LoginScreen({ userType, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await api.login({ email, password });

      if (result.status === 'success ✅') {
        const user = result.user;

        if (userType === 'admin' && user.role !== 'admin') {
          toast.error('This account is not an admin account');
          return;
        }
        if (userType === 'student' && user.role !== 'student') {
          toast.error('This account is not a student account');
          return;
        }

        toast.success('Login successful!');
        onLogin(email, userType, user.user_id, user.department_id);
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-center mb-6">
          {userType === 'student' ? (
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          {userType === 'student' ? 'Student Login' : 'Admin Login'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Enter your credentials to continue
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder={userType === 'student' ? 'ts0614@srmist.edu.in' : 'admin@srmist.edu.in'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </div>
    </div>
  );
}