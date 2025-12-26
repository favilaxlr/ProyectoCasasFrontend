import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, useLocation } from "react-router";
import { IoShieldCheckmarkSharp, IoMailSharp, IoPhonePortraitSharp, IoCheckmarkCircle } from "react-icons/io5";
import { verifyCodeRequest, resendCodeRequest } from '../api/auth';
import { toast } from 'react-toastify';

function VerificationPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const userEmail = location.state?.email || '';

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const response = await verifyCodeRequest({
        email: userEmail,
        code: values.code
      });
      
      toast.success('¡Verificación exitosa! Ya puedes iniciar sesión', {
        icon: <IoCheckmarkCircle className="text-green-500" />
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message?.[0] || 'Error al verificar el código';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  });

  const handleResendCode = async () => {
    if (!userEmail) {
      toast.error('No se encontró el email del usuario');
      return;
    }
    
    setIsResending(true);
    try {
      await resendCodeRequest({ email: userEmail });
      toast.success('Código reenviado exitosamente. Revisa tu email y SMS');
    } catch (error) {
      const errorMessage = error.response?.data?.message?.[0] || 'Error al reenviar el código';
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
          <h2 className="text-4xl font-bold text-[var(--charcoal)] mb-2">Verifica tu cuenta</h2>
          <p className="text-gray-600 text-lg mb-4">
            Hemos enviado un código de 6 dígitos a:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center text-[var(--gold-accent)] font-semibold">
              <IoMailSharp className="w-5 h-5 mr-2" />
              <span>{userEmail}</span>
            </div>
            <div className="flex items-center justify-center text-[var(--gold-accent)] font-semibold">
              <IoPhonePortraitSharp className="w-5 h-5 mr-2" />
              <span>Tu número de teléfono</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">El código es válido por 10 minutos</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 transform hover:shadow-3xl transition-all duration-500 animate-slide-up">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Verification Code Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center justify-center">
                Código de Verificación
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
                    required: "El código es requerido",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "El código debe ser de 6 dígitos"
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
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <IoShieldCheckmarkSharp className="w-5 h-5 mr-2" />
                  Verificar Cuenta
                </div>
              )}
            </button>
          </form>

          {/* Resend Code Section */}
          <div className="text-center space-y-3 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">¿No recibiste el código?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-[var(--gold-accent)] hover:text-yellow-600 font-semibold text-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-[var(--charcoal)] text-sm transition-colors duration-300"
            >
              Volver al inicio de sesión
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
                ¿Por qué verificar?
              </h3>
              <p className="text-xs text-blue-700">
                La verificación de tu cuenta nos ayuda a mantener la seguridad de nuestra plataforma 
                y asegura que recibas notificaciones importantes sobre nuevas propiedades disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
