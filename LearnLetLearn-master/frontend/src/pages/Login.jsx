import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { FormInput, SubmitButton, ErrorMessage } from '../components/ui';
import { useForm } from '../utils/validation';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [toast, setToast] = useState(null);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '', password: '' },
    async (formValues) => {
      try {
        await login(formValues.email, formValues.password);
        navigate('/profile');
      } catch (err) {
        setToast({ type: 'error', message: err || 'Login failed' });
      }
    },
    {
      email: { required: true, type: 'email', label: 'Email' },
      password: { required: true, type: 'password', label: 'Password' },
    }
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>

        {toast && (
          <ErrorMessage
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
            placeholder="you@example.com"
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            placeholder="••••••••"
            required
          />

          <SubmitButton
            label="Login"
            isLoading={isSubmitting || isLoading}
            className="mt-6"
          />
        </form>

        <div className="mt-4 text-center text-gray-600">
          <span>Don't have an account? </span>
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
