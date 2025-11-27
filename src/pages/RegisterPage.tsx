import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import FormContainer from '../components/FormContainer';
import Input from '../components/Input';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import useFormValidation from '../hooks/useFormValidation';

const RegisterPage: React.FC = () => {
  const validationRules = {
    name: [
      { required: true, message: 'Name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters long' },
      { pattern: /^[a-zA-Z\s\-'\.]+$/, message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods' }
    ],
    email: [
      { required: true, message: 'Email is required' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
    ],
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters long' },
      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character' }
    ]
  };

  const { values, errors, isValid, isFieldValid, isFieldFilled, isFieldTouched, handleChange, handleBlur } = useFormValidation(
    {
      name: '',
      email: '',
      password: '',
      role: 'client' as 'client' | 'business_owner',
    },
    validationRules
  );

  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Handle error alerts using useEffect to avoid issues in try/catch
  React.useEffect(() => {
    const showErrorAlert = async () => {
      if (error) {
        // Close any existing SweetAlert to ensure clean state
        Swal.close();

        // Determine the type of error based on the message content
        if (error === 'TERMS_AGREEMENT_REQUIRED') {
          // Use SweetAlert2 for terms agreement required
          await Swal.fire({
            icon: 'warning',
            title: 'Terms Agreement Required',
            text: 'You must agree to the Terms and Conditions to register.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 8000, // Auto-close after 8 seconds
            timerProgressBar: true,
            allowOutsideClick: true,
          });
        } else if (error.startsWith('Form Validation Error:')) {
          // Use SweetAlert2 for form validation errors
          await Swal.fire({
            icon: 'error',
            title: 'Form Validation Error',
            html: `
              <div class="text-left">
                <p>Please fix the following errors:</p>
                <ul class="list-disc pl-5 mt-2">
                  ${error.includes('Name format is invalid') ? `<li>Name format is invalid (letters, spaces, hyphens, apostrophes, periods only)</li>` : ''}
                  ${error.includes('Name is required') ? `<li>Name is required</li>` : ''}
                  ${error.includes('Name must be at least 2 characters') ? `<li>Name must be at least 2 characters</li>` : ''}
                  ${error.includes('Invalid email format') ? `<li>Invalid email format</li>` : ''}
                  ${error.includes('Email is required') ? `<li>Email is required</li>` : ''}
                  ${error.includes('Password must contain lowercase') ? `<li>Password must contain lowercase, uppercase, number and special character</li>` : ''}
                  ${error.includes('Password is required') ? `<li>Password is required</li>` : ''}
                  ${error.includes('Password must be at least 8 characters') ? `<li>Password must be at least 8 characters</li>` : ''}
                </ul>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 8000, // Auto-close after 8 seconds
            timerProgressBar: true,
            allowOutsideClick: true,
          });
        } else {
          // Use SweetAlert2 for API errors or other general errors
          await Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error,
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
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submit triggered');
    console.log('Current values:', values);
    console.log('Current errors:', errors);
    console.log('Is form valid?', isValid);
    console.log('Are terms agreed?', agreedToTerms);

    // Check each field individually
    const nameError = errors.name;
    const emailError = errors.email;
    const passwordError = errors.password;

    console.log('Individual field errors - Name:', nameError, 'Email:', emailError, 'Password:', passwordError);
    console.log('Field values - Name:', `"${values.name}"`, 'Email:', `"${values.email}"`, 'Password:', `"${values.password}"`);
    console.log('Field lengths - Name:', values.name.length, 'Email:', values.email.length, 'Password:', values.password.length);

    // Detailed validation checks
    const nameValid = values.name.trim() !== '' && values.name.length >= 2 && /^[a-zA-Z\s\-'\.]+$/.test(values.name);
    const emailValid = values.email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
    const passwordValid = values.password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(values.password);

    console.log('Detailed validation - Name:', nameValid, 'Email:', emailValid, 'Password:', passwordValid);
    console.log('All required fields filled:', values.name.trim() !== '' && values.email.trim() !== '' && values.password.trim() !== '');

    if (!isValid) {
      // Set validation error to trigger the useEffect alert handler
      let validationMessage = 'Form Validation Error: ';
      const errorList = [];

      if (!isFieldValid('name') && isFieldFilled('name')) errorList.push('Name format is invalid (letters, spaces, hyphens, apostrophes, periods only)');
      if (!values.name) errorList.push('Name is required');
      if (values.name && values.name.length < 2) errorList.push('Name must be at least 2 characters');
      if (!isFieldValid('email') && isFieldFilled('email')) errorList.push('Invalid email format');
      if (!values.email) errorList.push('Email is required');
      if (!isFieldValid('password') && isFieldFilled('password')) errorList.push('Password must contain lowercase, uppercase, number and special character');
      if (!values.password) errorList.push('Password is required');
      if (values.password && values.password.length < 8) errorList.push('Password must be at least 8 characters');

      validationMessage += errorList.join(', ');

      setError(validationMessage);
      return;
    }

    if (!agreedToTerms) {
      setError('TERMS_AGREEMENT_REQUIRED');
      return;
    }

    console.log('Form is valid and terms are agreed - proceeding with registration');
    setLoading(true);

    try {
      console.log('Calling register function with:', {name: values.name, email: values.email, password: values.password, role: values.role});
      await register(values.name, values.email, values.password, values.role);
      console.log('Registration successful');
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration failed:', error);

      // Check if it's a specific API error
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Create Account"
      subtitle="Join our community to manage your beauty business"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="Enter your full name"
          error={errors.name}
          isValid={isFieldValid('name') && isFieldFilled('name')}
          helperText={!errors.name && isFieldFilled('name') ? 'Valid name format' : 'Enter at least 2 characters (letters, spaces, hyphens, apostrophes, periods only)'}
        />

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
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="Create a strong password"
          error={errors.password}
          isValid={isFieldValid('password') && isFieldFilled('password')}
          helperText={!errors.password && isFieldFilled('password') ? 'Valid password' : 'At least 8 chars with lowercase, uppercase, number, and special char'}
        />

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            id="role"
            name="role"
            value={values.role}
            onChange={(e) => handleChange('role', e.target.value as 'client' | 'business_owner')}
            className="input-animated block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-300"
          >
            <option value="client">Client - Book appointments</option>
            <option value="business_owner">Business Owner - Manage business</option>
          </select>
        </div>

        <div className="pt-2">
          <Checkbox
            id="terms"
            label={
              <>
                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
              </>
            }
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
          />
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
                Creating account...
              </>
            ) : (
              values.role === 'business_owner' ? 'Create Business Account' : 'Create Client Account'
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default RegisterPage;