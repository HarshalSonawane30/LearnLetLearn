import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { FormInput, SubmitButton, ErrorMessage } from '../components/ui';
import { useForm } from '../utils/validation';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [toast, setToast] = useState(null);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(
    {
      name: '',
      email: '',
      password: '',
      skillsKnown: '',
      skillsToLearn: '',
    },
    async (formValues) => {
      try {
        await register({
          ...formValues,
          skillsKnown: formValues.skillsKnown.split(',').map((s) => s.trim()).filter(Boolean),
          skillsToLearn: formValues.skillsToLearn.split(',').map((s) => s.trim()).filter(Boolean),
        });
        navigate('/profile');
      } catch (err) {
        setToast({ type: 'error', message: err || 'Registration failed' });
      }
    },
    {
      name: { required: true, label: 'Full Name', minLength: 2 },
      email: { required: true, type: 'email', label: 'Email' },
      password: { required: true, type: 'password', label: 'Password' },
      skillsKnown: { required: false, label: 'Skills Known' },
      skillsToLearn: { required: false, label: 'Skills To Learn' },
    }
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>

        {toast && (
          <ErrorMessage
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Full Name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : ''}
            placeholder="John Doe"
            required
          />

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

          <FormInput
            label="Skills Known (comma separated)"
            type="text"
            name="skillsKnown"
            value={values.skillsKnown}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., React, JavaScript, Python"
          />

          <FormInput
            label="Skills To Learn (comma separated)"
            type="text"
            name="skillsToLearn"
            value={values.skillsToLearn}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., Node.js, MongoDB, Design"
          />

          <SubmitButton
            label="Register"
            isLoading={isSubmitting || isLoading}
            className="mt-6"
          />
        </form>

        <div className="mt-4 text-center text-gray-600">
          <span>Already have an account? </span>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
