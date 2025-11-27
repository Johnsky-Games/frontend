import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import FormContainer from '../components/FormContainer';
import Input from '../components/Input';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import useFormValidation from '../hooks/useFormValidation';

import ChangePasswordModal from '../components/ChangePasswordModal';

const LoginPage: React.FC = () => {
  const { values, errors, isValid, isFieldValid, isFieldFilled, handleChange, handleBlur } = useFormValidation(
    {
      email: '',
      password: '',
    },
    {
      email: [
        { required: true, message: 'Email is required' },
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
      ],
      password: [
        { required: true, message: 'Password is required' },
        { minLength: 6, message: 'Password must be at least 6 characters long' }
      ]
    }
  );

  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = React.useState(false);
  const [tempToken, setTempToken] = React.useState('');
  const [warningMessage, setWarningMessage] = React.useState<{ message: string; reason: string } | null>(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle error alerts using useEffect to avoid issues in try/catch
  React.useEffect(() => {
    const showErrorAlert = async () => {
      if (error) {
        // Determine the type of error based on the message content
        // Check if it's an unverified account error
        if (error.toLowerCase().includes('not verified') ||
          error.toLowerCase().includes('verify your email')) {
          // Close any existing SweetAlert to ensure clean state
          Swal.close();
          // Use SweetAlert2 for verification required - it's a critical issue that needs action
          await Swal.fire({
            icon: 'warning',
            title: 'Account Verification Required',
            html: `
              <div class="text-left">
                <p class="mb-3">Your account needs to be verified before you can log in.</p>
                <p class="font-semibold">What would you like to do?</p>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Resend Verification Email',
            cancelButtonText: 'I\'ll check my email',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
            allowOutsideClick: true,
            timer: 12000, // Auto-close after 12 seconds (more time for decision)
            timerProgressBar: true,
          }).then((result) => {
            if (result.isConfirmed) {
              // Navigate to resend verification page
              navigate('/resend-verification', { state: { email: values.email } });
            }
          });
        }
        // Check if it's invalid credentials
        else if (error.toLowerCase().includes('invalid') ||
          error.toLowerCase().includes('incorrect') ||
          error.toLowerCase().includes('password')) {
          // Close any existing SweetAlert to ensure clean state
          Swal.close();
          // Use SweetAlert2 for invalid credentials since it's a critical login issue
          await Swal.fire({
            icon: 'error',
            title: 'Invalid Credentials',
            text: 'The email or password you entered is incorrect. Please try again.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 8000, // Auto-close after 8 seconds
            timerProgressBar: true,
            allowOutsideClick: true,
          });
        }
        // Check if it's account inactive
        else if (error.toLowerCase().includes('inactive') ||
          error.toLowerCase().includes('suspended')) {
          // Close any existing SweetAlert to ensure clean state
          Swal.close();
          // Use SweetAlert2 for inactive account since it requires user action
          await Swal.fire({
            icon: 'error',
            title: 'Account Inactive',
            text: 'Your account is currently inactive. Please contact support.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 8000, // Auto-close after 8 seconds
            timerProgressBar: true,
            allowOutsideClick: true,
          });
        }
        // Check if it's rate limiting
        else if (error.toLowerCase().includes('too many') ||
          error.toLowerCase().includes('try again')) {
          // Close any existing SweetAlert to ensure clean state
          Swal.close();
          // Use SweetAlert2 for rate limiting since it requires user action
          await Swal.fire({
            icon: 'warning',
            title: 'Too Many Attempts',
            html: `
              <div class="text-left">
                <p>Please wait before trying again.</p>
                <p class="mt-2 text-sm text-gray-600">Note: If you haven't verified your email yet, please check your inbox first.</p>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 10000, // Auto-close after 10 seconds
            timerProgressBar: true,
            allowOutsideClick: true,
          });
        }
        // For other errors
        else {
          // Close any existing SweetAlert to ensure clean state
          Swal.close();
          await Swal.fire({
            icon: 'error',
            title: 'Authentication Failed',
            text: error || 'Login failed. Please check your credentials and try again.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 8000, // Auto-close after 8 seconds
            timerProgressBar: true,
            allowOutsideClick: true,
          });
        }

        // Clear the error state after showing the alert
        setError(null);
      }
    };

    showErrorAlert();
  }, [error, navigate, values.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      // Set validation error to trigger the useEffect alert handler
      let validationMessage = 'Please fix the following errors: ';
      const errorList = [];

      if (!isFieldValid('email') && isFieldFilled('email')) errorList.push('Invalid email format');
      if (!isFieldValid('password') && isFieldFilled('password')) errorList.push('Password must be at least 6 characters');
      if (!values.email) errorList.push('Email is required');
      if (!values.password) errorList.push('Password is required');

      validationMessage += errorList.join(', ');

      setError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      const response = await login(values.email, values.password);

      toast.success('Login successful!');

      if (response && response.code === 'PASSWORD_CHANGE_REQUIRED') {
        setTempToken(response.token);
        setShowChangePasswordModal(true);
        // Do not navigate
      } else if (response && response.password_warning) {
        setTempToken(response.token || '');
        setWarningMessage(response.password_warning);
        setShowChangePasswordModal(true);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.log('Login error details:', error);

      // Check for PASSWORD_CHANGE_REQUIRED
      if (error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
        setTempToken(error.response.data.token);
        setShowChangePasswordModal(true);
        setLoading(false);
        return;
      }

      // Extract error message from the caught error
      const errorMessage = error.message || 'An error occurred during login';
      // Set the error in state to be handled by useEffect
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormContainer
        title="Welcome Back"
        subtitle="Sign in to your account to continue"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="Enter your email"
            error={errors.email}
            isValid={isFieldValid('email') && isFieldFilled('email')}
            helperText={!errors.email && isFieldFilled('email') ? 'Valid email address' : 'Enter a valid email address'}
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Enter your password"
            error={errors.password}
            isValid={isFieldValid('password') && isFieldFilled('password')}
            helperText={!errors.password && isFieldFilled('password') ? 'Valid password' : 'Password must be at least 6 characters'}
          />

          {/* Verification reminder for new users */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">New Account?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>If you just registered, please check your email for a verification link.</p>
                  <p className="mt-1">
                    Didn't receive it?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/resend-verification', { state: { email: values.email } })}
                      className="font-medium text-blue-800 underline hover:text-blue-900"
                    >
                      Resend verification email
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Checkbox
              id="remember-me"
              label="Remember me"
              checked={rememberMe}
              onChange={setRememberMe}
            />

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="md"
              fullWidth
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>
      </FormContainer>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          // If it was a warning (not forced), we navigate to dashboard on close
          if (warningMessage) {
            navigate('/dashboard');
          }
        }}
        token={tempToken}
        title={warningMessage ? "Security Recommendation" : "Change Temporary Password"}
        message={warningMessage ? `${warningMessage.message} ${warningMessage.reason}` : "For security reasons, you must change your temporary password before continuing."}
        isDismissible={!!warningMessage} // Dismissible if it's just a warning
      />
    </>
  );
};

export default LoginPage;