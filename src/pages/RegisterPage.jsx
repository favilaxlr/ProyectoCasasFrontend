import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from '../schemas/registerSchema';
import { IoPersonAdd, IoLogIn, IoEyeSharp, IoEyeOffSharp, IoMailSharp, IoLockClosedSharp, IoPersonSharp, IoCallSharp, IoPhonePortraitSharp } from "react-icons/io5"
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getNotificationCitiesRequest } from '../api/notificationPreferences';
import { 
  FALLBACK_NOTIFICATION_CITIES, 
  DEFAULT_MAX_NOTIFICATION_CITIES,
  DEFAULT_MIN_NOTIFICATION_CITIES,
  DEFAULT_USER_CITY_UPDATE_COOLDOWN_DAYS
} from '../utils/notificationCities';

function RegisterPage() {
  const { signUp, isAuthenticated, errors: registerErrors } = useAuth();
  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsAccepted: false,
      smsConsent: false,
      notificationCities: []
    }
  });
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [passwordConfirmShown, setPasswordConfirmShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cityFetchError, setCityFetchError] = useState('');
  const [maxNotificationCities, setMaxNotificationCities] = useState(DEFAULT_MAX_NOTIFICATION_CITIES);
  const [minNotificationCities, setMinNotificationCities] = useState(DEFAULT_MIN_NOTIFICATION_CITIES);
  const [cityCooldownDays, setCityCooldownDays] = useState(DEFAULT_USER_CITY_UPDATE_COOLDOWN_DAYS);
  const selectedNotificationCities = watch('notificationCities') || [];
  const selectionLimitReached = selectedNotificationCities.length >= maxNotificationCities;

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  }

  const togglePasswordConfirmVisibility = () => {
    setPasswordConfirmShown(!passwordConfirmShown);
  }

  const handleCityToggle = (cityCode) => {
    const currentSelection = selectedNotificationCities;
    const isSelected = currentSelection.includes(cityCode);
    let updatedSelection = currentSelection;

    if (isSelected) {
      updatedSelection = currentSelection.filter((code) => code !== cityCode);
    } else {
      if (currentSelection.length >= maxNotificationCities) {
        return;
      }
      updatedSelection = [...currentSelection, cityCode];
    }

    setValue('notificationCities', updatedSelection, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (isAuthenticated)
      navigate("/properties");
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await getNotificationCitiesRequest();
        const apiCities = response.data?.cities;
        if (apiCities?.length) {
          setCityOptions(apiCities);
        } else {
          setCityOptions(FALLBACK_NOTIFICATION_CITIES);
        }
        setMaxNotificationCities(response.data?.maxSelection || DEFAULT_MAX_NOTIFICATION_CITIES);
        setMinNotificationCities(response.data?.minSelection || DEFAULT_MIN_NOTIFICATION_CITIES);
        setCityCooldownDays(response.data?.userUpdateCooldownDays || DEFAULT_USER_CITY_UPDATE_COOLDOWN_DAYS);
      } catch (error) {
        console.error('Error loading notification cities', error);
        setCityOptions(FALLBACK_NOTIFICATION_CITIES);
        setMaxNotificationCities(DEFAULT_MAX_NOTIFICATION_CITIES);
        setMinNotificationCities(DEFAULT_MIN_NOTIFICATION_CITIES);
        setCityCooldownDays(DEFAULT_USER_CITY_UPDATE_COOLDOWN_DAYS);
        setCityFetchError('Unable to load live notification cities. Using fallback list.');
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const result = await signUp(values);
      if (result.success) {
        // Redirect to verification page with email and phone
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
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-[var(--gold-accent)] rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <IoPersonAdd className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--charcoal)] mb-2">Join us!</h2>
          <p className="text-gray-600 text-base md:text-lg">Create your account at FR Family Investments</p>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-2xl p-6 md:p-8 space-y-6 transform hover:shadow-3xl transition-all duration-500 animate-slide-up">
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
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-transparent transition-all duration-300 group-hover:bg-gray-100 ${
                    errors.username ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Your username"
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

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoCallSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Phone
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
                      placeholder="Select country and number"
                    />
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.phone.message}</p>
              )}
              <div className="mt-3 text-xs text-blue-900 bg-blue-50 border border-blue-100 rounded-2xl p-3 leading-relaxed">
                By providing your phone number you acknowledge that FR Family Investments may send account-critical texts (like verification codes or fraud alerts). Marketing updates and appointment reminders are optional and require selecting the SMS consent checkbox near "Create Account." Message and data rates may apply, and message frequency varies. Reply STOP to cancel, HELP for help. View our{' '}
                <a href="https://frfamilyinvestments.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Privacy Policy</a>{' '}
                and{' '}
                <a href="https://frfamilyinvestments.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Terms of Service</a>. Your consent is never a condition of purchase or account creation.
              </div>
            </div>

            {/* Notification Cities Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoPhonePortraitSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Notification Cities
              </label>
              <input type="hidden" {...register('notificationCities')} />
              {citiesLoading ? (
                <p className="text-sm text-gray-500">Loading available cities...</p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Select between {minNotificationCities} and {maxNotificationCities} cities</span>
                    <span className="font-semibold">
                      {selectedNotificationCities.length}/{maxNotificationCities} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {cityOptions.map((city) => {
                      const isSelected = selectedNotificationCities.includes(city.code);
                      const isDisabled = !isSelected && selectionLimitReached;
                      return (
                        <button
                          key={city.code}
                          type="button"
                          onClick={() => handleCityToggle(city.code)}
                          disabled={isDisabled}
                          className={`w-full px-4 py-3 rounded-xl border-2 text-left text-sm transition-all duration-300 ${
                            isSelected
                              ? 'bg-[var(--gold-accent)]/10 border-[var(--gold-accent)] text-[var(--charcoal)] shadow-md'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-[var(--gold-accent)]'
                          } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {city.label}
                        </button>
                      );
                    })}
                  </div>
                  {selectionLimitReached && (
                    <p className="text-xs text-gray-500">
                      You reached the limit. Deselect a city to pick a different market.
                    </p>
                  )}
                </>
              )}
              {cityFetchError && (
                <p className="text-sm text-red-500">{cityFetchError}</p>
              )}
              <p className="text-xs text-gray-600">
                Choose up to {maxNotificationCities} U.S. markets now. You can adjust this list from your profile once every {cityCooldownDays} days.
                Need additional markets? Email <a className="font-semibold underline" href="mailto:support@frfamilyinvestments.com">support@frfamilyinvestments.com</a>.
              </p>
              {errors.notificationCities && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.notificationCities.message}</p>
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--charcoal)] flex items-center">
                <IoLockClosedSharp className="w-4 h-4 mr-2 text-[var(--gold-accent)]" />
                Confirm Password
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

            {/* SMS Consent Checkbox */}
            <div className="space-y-2">
              <label className="inline-flex items-start gap-2 text-sm text-[var(--charcoal)]">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-[var(--gold-accent)] border-gray-300 rounded focus:ring-[var(--gold-accent)]"
                  {...register('smsConsent')}
                />
                <span>
                  "I consent to join the FR Family Investments Notifications SMS program and receive automated texts from FR Family Investments about appointments, verification codes, and curated properties. Message and data rates may apply. Message frequency varies. Reply STOP to opt out, HELP for help. Consent is optional and not a condition of purchase or account creation."
                  <br />
                  <a href="https://frfamilyinvestments.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="https://frfamilyinvestments.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </span>
              </label>
              {errors.smsConsent && (
                <p className="text-red-500 text-sm mt-1 animate-fade-in">{errors.smsConsent.message}</p>
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
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <IoPersonAdd className="w-5 h-5 mr-2" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-100">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-xs text-blue-700 leading-relaxed">
                By registering with FR Family Investments, you agree to receive SMS notifications about new properties available in Dallas. These notifications are sent automatically to all registered users. Your consent is explicitly recorded as required by SMS compliance. Reply STOP to opt out, HELP for help.
              </p>
            </div>
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Link
              to='/login'
              className="inline-flex items-center px-6 py-3 border-2 border-[var(--gold-accent)] text-[var(--gold-accent)] font-semibold rounded-xl hover:bg-[var(--gold-accent)] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <IoLogIn className="w-5 h-5 mr-2" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage