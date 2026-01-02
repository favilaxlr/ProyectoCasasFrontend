import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router";
import { IoShieldCheckmarkSharp, IoMailSharp, IoPhonePortraitSharp, IoCheckmarkCircle, IoTimeSharp } from "react-icons/io5";
import { verifyCodeRequest, resendCodeRequest } from '../api/auth';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function VerificationPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const userEmail = location.state?.email || '';
  const userPhone = location.state?.phone || '';
  
  // Función para censurar el teléfono mostrando solo los últimos 4 dígitos
  const maskPhone = (phone) => {
    if (!phone || phone.length < 4) return '****';
    const lastFour = phone.slice(-4);
    const masked = '*'.repeat(phone.length - 4);
    return masked + lastFour;
  };

  // Timer para el cooldown
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const response = await verifyCodeRequest({
        email: userEmail,
        code: values.code
      });
      
      console.log('✅ Respuesta de verificación:', response.data);
      
      // El backend ahora devuelve los datos del usuario con token
      if (response.data) {
        authenticateUser(response.data);
        
        toast.success('Verification successful! Welcome', {
          icon: <IoCheckmarkCircle className="text-green-500" />
        });
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          navigate('/properties', { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error en verificación:', error);
      const errorMessage = error.response?.data?.message?.[0] || 'Error verifying the code';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  });

  const handleResendCode = async () => {
    if (!userEmail) {
      toast.error('User email not found');
      return;
    }
    
    if (cooldownTime > 0) {
      toast.warning(`Wait ${cooldownTime} seconds before resending`);
      return;
    }
    
    setIsResending(true);
    try {
      await resendCodeRequest({ email: userEmail });
      toast.success('Code resent successfully. Check your email and SMS');
      setCooldownTime(60); // 60 segundos de cooldown
    } catch (error) {
      const errorMessage = error.response?.data?.message?.[0] || 'Error resending the code';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <IoShieldCheckmarkSharp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-[var(--charcoal)] mb-2">Verify your account</h2>
          <p className="text-gray-600 text-lg mb-4">
            We have sent a 6-digit code to:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center text-[var(--gold-accent)] font-semibold">
              <IoMailSharp className="w-5 h-5 mr-2" />
              <span>{userEmail}</span>
            </div>
            {userPhone && (
              <div className="flex items-center justify-center text-[var(--gold-accent)] font-semibold">
                <IoPhonePortraitSharp className="w-5 h-5 mr-2" />
                <span>{maskPhone(userPhone)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-gray-500 text-sm">The code is valid for 10 minutes</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <p className="text-yellow-800 text-xs flex items-start">
                <IoMailSharp className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Note:</strong> If you don't find the email in your inbox, check your <strong>SPAM</strong> or <strong>Junk</strong> folder.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform hover:shadow-3xl transition-all duration-500 animate-slide-up">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Verification Code Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center justify-center">
                Verification Code
              </label>
              <div className="relative group">
                <input
                  type="text"
                  maxLength="6"
                  className={`w-full px-4 py-4 text-center text-2xl font-bold tracking-widest bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                    errors.code ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="000000"
                  {...register("code", {
                    required: "The code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "The code must be 6 digits"
                    }
                  })}
                />
              </div>
              {errors.code && (
                <p className="text-red-500 text-sm mt-1 text-center animate-fade-in">{errors.code.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <IoShieldCheckmarkSharp className="w-5 h-5 mr-2" />
                  Verify Account
                </div>
              )}
            </button>
          </form>

          {/* Resend Code Section */}
          <div className="text-center space-y-3 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || cooldownTime > 0}
              className={`font-semibold text-sm transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center mx-auto ${
                cooldownTime > 0 
                  ? 'text-gray-400' 
                  : 'text-[var(--gold-accent)] hover:text-yellow-600'
              }`}
            >
              {isResending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--gold-accent)] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Reenviando...
                </>
              ) : cooldownTime > 0 ? (
                <>
                  <IoTimeSharp className="w-4 h-4 mr-2" />
                  Wait {cooldownTime}s to resend
                </>
              ) : (
                'Resend code'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-[var(--charcoal)] text-sm transition-colors duration-300"
            >
              Back to sign in
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IoShieldCheckmarkSharp className="w-6 h-6 text-blue-500 mt-1" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Why verify?
              </h3>
              <p className="text-xs text-blue-700">
                Account verification helps us maintain platform security 
                and ensures you receive important notifications about new properties available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
