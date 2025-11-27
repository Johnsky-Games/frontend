import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import FormContainer from '../components/FormContainer';
import Input from '../components/Input';
import Button from '../components/Button';
import useFormValidation from '../hooks/useFormValidation';
import api from '../services/ApiService';

const ResendVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if email was passed from login page
  const initialEmail = location.state?.email || '';

  const { values, errors, isValid, isFieldValid, isFieldFilled, handleChange, handleBlur } = useFormValidation(
    {
      email: initialEmail,
    },
    {
      email: [
        { required: true, message: 'Email is required' },
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
      ]
    }
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Handle error alerts using useEffect to avoid issues in try/catch
  React.useEffect(() => {
    const showErrorAlert = async () => {
      if (error) {
        // Close any existing SweetAlert to ensure clean state
        Swal.close();

        // Show error alert
        await Swal.fire({
          icon: 'error',
          title: 'Resend Verification Failed',
          text: error,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6',
          timer: 8000, // Auto-close after 8 seconds
          timerProgressBar: true,
          allowOutsideClick: true,
        });

        // Clear the error state after showing the alert
        setError(null);
      }
    };

    showErrorAlert();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/resend-verification', {
        email: values.email
      });

      toast.success(response.data.message);

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to send verification email. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Resend Verification Email"
      subtitle="Enter your email to receive a new verification link"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Enter your email"
          error={errors.email}
          isValid={isFieldValid('email') && isFieldFilled('email')}
          helperText={!errors.email && isFieldFilled('email') ? 'Valid email address' : 'Enter a valid email address'}
        />

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
                Sending...
              </>
            ) : (
              'Send Verification Email'
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default ResendVerificationPage;