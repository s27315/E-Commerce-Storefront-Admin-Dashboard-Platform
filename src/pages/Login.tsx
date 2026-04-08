import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name required').refine((v) => v.trim().length > 0, 'Cannot be empty'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      const role = await login(data.email, data.password);
      toast.success('Logged in successfully');
      navigate(role === 'ADMIN' ? '/admin' : '/');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      await register(data.name, data.email, data.password);
      toast.success('Account created! Please login.');
      setIsRegister(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>

        {!isRegister ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate>
            <div className="field">
              <label>Email</label>
              <input className={`input${loginForm.formState.errors.email ? ' input-error' : ''}`} type="email" {...loginForm.register('email')} />
              {loginForm.formState.errors.email && <span className="error">{loginForm.formState.errors.email.message}</span>}
            </div>
            <div className="field">
              <label>Password</label>
              <input className={`input${loginForm.formState.errors.password ? ' input-error' : ''}`} type="password" {...loginForm.register('password')} />
              {loginForm.formState.errors.password && <span className="error">{loginForm.formState.errors.password.message}</span>}
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loginForm.formState.isSubmitting}>
              {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} noValidate>
            <div className="field">
              <label>Full Name</label>
              <input className={`input${registerForm.formState.errors.name ? ' input-error' : ''}`} {...registerForm.register('name')} />
              {registerForm.formState.errors.name && <span className="error">{registerForm.formState.errors.name.message}</span>}
            </div>
            <div className="field">
              <label>Email</label>
              <input className={`input${registerForm.formState.errors.email ? ' input-error' : ''}`} type="email" {...registerForm.register('email')} />
              {registerForm.formState.errors.email && <span className="error">{registerForm.formState.errors.email.message}</span>}
            </div>
            <div className="field">
              <label>Password</label>
              <input className={`input${registerForm.formState.errors.password ? ' input-error' : ''}`} type="password" {...registerForm.register('password')} />
              {registerForm.formState.errors.password && <span className="error">{registerForm.formState.errors.password.message}</span>}
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={registerForm.formState.isSubmitting}>
              {registerForm.formState.isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="auth-toggle">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="btn-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
