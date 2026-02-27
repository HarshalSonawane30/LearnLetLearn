import React from 'react';

// Loading Spinner Component
export const LoadingSpinner = ({ fullScreen = false }) => {
  const spinnerContent = (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-100/50 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Toast Notification Component
export const Toast = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded shadow-lg fixed bottom-4 right-4 max-w-sm`}
      role="alert"
    >
      {message}
    </div>
  );
};

// Error Message Component
export const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700 hover:text-red-900"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Success Message Component
export const SuccessMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
      <span className="block sm:inline">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-700 hover:text-green-900"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Form Input Component with Validation
export const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border rounded transition ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
      />
      {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
    </div>
  );
};

// Submit Button Component
export const SubmitButton = ({
  label = 'Submit',
  isLoading = false,
  disabled = false,
  className = '',
  variant = 'primary',
}) => {
  const baseStyles = 'w-full px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          Loading...
        </span>
      ) : (
        label
      )}
    </button>
  );
};

// Skeleton Loader for Cards
export const SkeletonCard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-gray-300 rounded"></div>
    </div>
  );
};

// Skeleton Loader for List
export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

