import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from '../schemas/registerSchema';
import { IoPersonAdd, IoLogIn, IoEyeSharp, IoEyeOffSharp, IoMailSharp, IoLockClosedSharp, IoPersonSharp, IoCallSharp, IoPhonePortraitSharp } from "react-icons/io5"
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function RegisterPage() {
  const { signUp, isAuthenticated, errors: registerErrors } = useAuth();
  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: zodResolver(registerSchema)
  });
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [passwordConfirmShown, setPasswordConfirmShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  }

  const togglePasswordConfirmVisibility = () => {
    setPasswordConfirmShown(!passwordConfirmShown);
  }

  useEffect(() => {
    if (isAuthenticated)
      navigate("/properties");
  }, [isAuthenticated]);

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const result = await signUp(values);
      if (result.success) {
        // Redirigir a la página de verificación con el email y teléfono
        navigate('/verify', { state: { email: result.email, phone: values.phone } });
      } else if (result.needsVerification) {
        // Si el email ya está registrado pero no verificado, redirigir a verificación
        navigate('/verify', { state: { email: result.email, phone: values.phone } });
      }
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm md:max-w-md lg:max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-[var(--gold-accent)] to-yellow-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <IoPersonAdd className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--charcoal)] mb-2">¡Únete a nosotros!</h2>
          <p className="text-gray-600 text-base md:text-lg">Crea tu cuenta en FR Family Investments</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 transform hover:shadow-3xl transition-all duration-500 animate-slide-up">
          {/* Error Messages */}
          {registerErrors.length > 0 && (
            <div className="space-y-2 animate-shake">
              {registerErrors.map((error, i) => (
                <div key={i} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="text-red-700 text-sm font-medium">{error}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoPersonSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Nombre de Usuario
              </label>
              <div className="relative group">
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                    errors.username ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Tu nombre de usuario"
                  {...register("username")}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <IoPersonSharp className={`w-5 h-5 transition-colors duration-300 ${
                    errors.username ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[var(--gold-accent)]'
                  }`} />
                </div>
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoMailSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Correo Electrónico
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="tu@email.com"
                  {...register("email")}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <IoMailSharp className={`w-5 h-5 transition-colors duration-300 ${
                    errors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[var(--gold-accent)]'
                  }`} />
                </div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoCallSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Teléfono
              </label>
              <div className="phone-input-wrapper">
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="US"
                      value={value || ''}
                      onChange={onChange}
                      className={`phone-input-custom ${
                        errors.phone ? 'phone-input-error' : ''
                      }`}
                      placeholder="Selecciona país y número"
                    />
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoLockClosedSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Contraseña
              </label>
              <div className="relative group">
                <input
                  type={passwordShown ? "text" : "password"}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 pr-12 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                  onClick={togglePasswordVisibility}
                >
                  {passwordShown ? (
                    <IoEyeSharp className="w-5 h-5 text-gray-400 hover:text-[var(--gold-accent)]" />
                  ) : (
                    <IoEyeOffSharp className="w-5 h-5 text-gray-400 hover:text-[var(--gold-accent)]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoLockClosedSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Confirmar Contraseña
              </label>
              <div className="relative group">
                <input
                  type={passwordConfirmShown ? "text" : "password"}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 pr-12 ${
                    errors.confirm ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                  {...register("confirm")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                  onClick={togglePasswordConfirmVisibility}
                >
                  {passwordConfirmShown ? (
                    <IoEyeSharp className="w-5 h-5 text-gray-400 hover:text-[var(--gold-accent)]" />
                  ) : (
                    <IoEyeOffSharp className="w-5 h-5 text-gray-400 hover:text-[var(--gold-accent)]" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.confirm.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--gold-accent)] to-yellow-600 text-white font-bold py-4 px-6 rounded-xl hover:from-yellow-600 hover:to-[var(--gold-accent)] focus:outline-none focus:ring-4 focus:ring-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <IoPersonAdd className="w-5 h-5 mr-2" />
                  Crear Cuenta
                </div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-100">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-xs text-blue-700 flex items-start">
                <IoPhonePortraitSharp className="mr-2 mt-0.5 flex-shrink-0" />
                Al registrarse en FR Family Investments, acepta recibir notificaciones por SMS sobre nuevas propiedades disponibles en Dallas. Estas notificaciones se envían automáticamente a todos los usuarios registrados.
              </p>
            </div>
            <p className="text-gray-600 mb-4">¿Ya tienes una cuenta?</p>
            <Link
              to='/login'
              className="inline-flex items-center px-6 py-3 border-2 border-[var(--gold-accent)] text-[var(--gold-accent)] font-semibold rounded-xl hover:bg-[var(--gold-accent)] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <IoLogIn className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage