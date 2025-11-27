import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import api from '../services/ApiService';
import FormContainer from '../components/FormContainer';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setMessage('Invalid verification link. Token is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);

        // Check if this is a successful verification
        if (response.data.code === 'VERIFICATION_SUCCESS') {
          setMessage(response.data.message);

          // Show success alert
          await Swal.fire({
            icon: 'success',
            title: 'Email Verified Successfully',
            text: response.data.message,
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#10B981',
            allowOutsideClick: true,
          }).then(() => {
            // Redirect to login after the alert is confirmed
            navigate('/login');
          });
        } else {
          // Handle other success responses
          setMessage(response.data.message || 'Email verification processed.');

          await Swal.fire({
            icon: 'info',
            title: 'Verification Processed',
            text: response.data.message || 'Your email verification request was processed.',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#3B82F6',
            allowOutsideClick: true,
          }).then(() => {
            navigate('/login');
          });
        }
      } catch (error: any) {
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || errorData?.error || 'Email verification failed. Please try again.';

        // Determine if it's an expired/invalid token vs other errors
        let isTokenError = false;
        let isTokenAlreadyUsed = false;

        if (errorData?.code) {
          isTokenError = ['TOKEN_INVALID_OR_USED', 'MISSING_TOKEN'].includes(errorData.code);
          // If the token was already used (email is verified), this is a special case
          isTokenAlreadyUsed = errorData.code === 'TOKEN_INVALID_OR_USED' &&
                              (errorMsg.toLowerCase().includes('already verified') ||
                               errorMsg.toLowerCase().includes('verified, you can'));
        } else if (error.response?.data?.error) {
          isTokenError = (
            error.response.data.error.toLowerCase().includes('invalid') ||
            error.response.data.error.toLowerCase().includes('expired') ||
            error.response.data.error.toLowerCase().includes('token')
          );
          isTokenAlreadyUsed = error.response.data.error.toLowerCase().includes('already verified');
        }

        // Different handling based on the error type
        if (isTokenAlreadyUsed) {
          // The user likely already verified their email, so they can go to login
          await Swal.fire({
            icon: 'info',
            title: 'Email Already Verified',
            html: `
              <div class="text-left">
                <p>Your email address is already verified.</p>
                <p class="mt-2">You can proceed to login to your account.</p>
              </div>
            `,
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#10B981',
            allowOutsideClick: true,
          }).then(() => {
            navigate('/login');
          });
        } else if (isTokenError) {
          // Show more specific error for token-related issues
          await Swal.fire({
            icon: 'warning',
            title: 'Verification Link Expired or Invalid',
            html: `
              <div class="text-left">
                <p>${errorMsg}</p>
                <p class="mt-2">What would you like to do?</p>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Go to Login',
            cancelButtonText: 'Resend Verification',
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#3B82F6',
            allowOutsideClick: true,
          }).then((result) => {
            if (result.isConfirmed) {
              // Go to login page
              navigate('/login');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // Go to resend verification page
              navigate('/resend-verification');
            }
          });
        } else {
          // Show general error for other issues
          await Swal.fire({
            icon: 'error',
            title: 'Email Verification Failed',
            text: errorMsg,
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#EF4444',
            allowOutsideClick: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <FormContainer
      title="Email Verification"
      subtitle=""
    >
      <div className="text-center py-8">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        ) : (
          <div>
            <div className={`p-4 rounded-lg mb-4 ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p>{message}</p>
            </div>
            
            {message.includes('successfully') && (
              <p className="text-gray-600 mt-2">
                Redirecting to login page...
              </p>
            )}
          </div>
        )}
      </div>
    </FormContainer>
  );
};

export default VerifyEmailPage;