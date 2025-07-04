import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { MOCK_CREDENTIALS } from '../../constants/permissions';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login(formData);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const quickLogin = (role: keyof typeof MOCK_CREDENTIALS) => {
    const credentials = MOCK_CREDENTIALS[role];
    setFormData(credentials);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Demo Credentials */}
      <div className="border-t border-gray-800 pt-6">
        <p className="text-sm text-gray-400 text-center mb-4">Quick Login (Demo)</p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          {Object.entries(MOCK_CREDENTIALS).map(([role, credentials]) => (
            <Button
              key={role}
              variant="outline"
              size="sm"
              onClick={() => quickLogin(role as keyof typeof MOCK_CREDENTIALS)}
              className="justify-start text-left bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium capitalize">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-gray-500">
                  {credentials.email}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Additional Links */}
      <div className="text-center space-y-2">
        <Button variant="link" className="text-gray-400 hover:text-white text-sm p-0 h-auto">
          Forgot your password?
        </Button>
        <div className="text-xs text-gray-500">
          Need help? Contact <span className="text-blue-400">support@paysync.com</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
