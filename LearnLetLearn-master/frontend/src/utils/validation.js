import React from 'react';

// Form Validation Utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];

    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${rule.label} is required`;
    } else if (rule.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
    } else if (rule.type === 'password' && value && !validatePassword(value)) {
      errors[field] = 'Password must be at least 6 characters';
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label} must be at least ${rule.minLength} characters`;
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label} must not exceed ${rule.maxLength} characters`;
    } else if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${rule.label} is invalid`;
    }
  });

  return errors;
};

// Custom hook for form handling
export const useForm = (initialValues, onSubmit, validationRules = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate single field
    if (validationRules[name]) {
      const fieldErrors = validateForm({ [name]: values[name] }, { [name]: validationRules[name] });
      if (fieldErrors[name]) {
        setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = validateForm(values, validationRules);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setFieldValue: (name, value) => setValues((prev) => ({ ...prev, [name]: value })),
    setFieldError: (name, error) => setErrors((prev) => ({ ...prev, [name]: error })),
    resetForm,
  };
};
