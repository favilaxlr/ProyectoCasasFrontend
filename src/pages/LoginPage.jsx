import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/loginSchema';
import { IoPersonAdd, IoLogIn, IoEyeSharp, IoEyeOffSharp, IoMailSharp, IoLockClosedSharp } from 'react-icons/io5'

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const { signIn, isAuthenticated, errors: loginErrors, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  }
  
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isAuthenticated && isAdmin)
      navigate('/admin/properties');
    else
      navigate('/properties');
  }, [isAuthenticated, isAdmin]);

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const result = await signIn(values);
      if (result && result.needsVerification) {
        // Redirigir a la página de verificación
        navigate('/verify', { state: { email: result.email } });
      }
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-[var(--gold-accent)] rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <IoLogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-[var(--charcoal)] mb-2">Welcome</h2>
          <p className="text-gray-600 text-lg">Sign in to FR Family Investments</p>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-2xl p-8 space-y-6 transform hover:shadow-3xl transition-all duration-500 animate-slide-up">
          {/* Error Messages */}
          {loginErrors.length > 0 && (
            <div className="space-y-2 animate-shake">
              {loginErrors.map((error, i) => (
                <div key={i} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="text-red-700 text-sm font-medium">{error}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoMailSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="your@email.com"
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

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoLockClosedSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Password
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--gold-accent)] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#165474] focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <IoLogIn className="w-5 h-5 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-gray-600 mb-4">Don't have an account?</p>
            <Link
              to='/register'
              className="inline-flex items-center px-6 py-3 border-2 border-[var(--gold-accent)] text-[var(--gold-accent)] font-semibold rounded-xl hover:bg-[var(--gold-accent)] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <IoPersonAdd className="w-5 h-5 mr-2" />
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage