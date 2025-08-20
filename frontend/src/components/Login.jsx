import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore'; // Ensure this import is correct
import { motion } from 'framer-motion';
import GoogleSignInButton from '../components/GoogleSignIn/GoogleSignInButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Set loading to true when submitting
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      setAuth(true, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false); // Reset loading state after request completes
    }
  };

  // Framer Motion variants for animations
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const inputVariants = {
    focus: { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)' },
    initial: { borderColor: '#d1d5db', boxShadow: 'none' },
  };

  const errorVariants = {
    initial: { opacity: 0, height: 0, marginBottom: 0 },
    animate: { opacity: 1, height: 'auto', marginBottom: '1rem', transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.4, ease: 'easeIn' } },
  };

  const buttonHover = {
    scale: 1.03,
    y: -2,
    boxShadow: '0px 8px 15px rgba(59, 130, 246, 0.3)',
  };

  const buttonTap = {
    scale: 0.98,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <motion.div
        className="w-full max-w-sm px-6 py-8 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl border border-white/30 space-y-8"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <motion.h2
            className="text-4xl font-extrabold text-gray-900 leading-tight"
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.6 } } }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            className="mt-2 text-lg text-gray-600"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.6 } } }}
          >
            Sign in to your account
          </motion.p>
        </div>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm"
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            key={error}
          >
            <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-6a1 1 0 100-2h.001v3a1 1 0 002 0v-3a1 1 0 00-2 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <motion.input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-300 ease-in-out
                           border-gray-300 placeholder-gray-500 text-gray-900
                           focus:border-blue-500"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                variants={inputVariants}
                whileFocus="focus"
                initial="initial"
                disabled={loading} // Disable input during loading
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <motion.input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-300 ease-in-out
                           border-gray-300 placeholder-gray-500 text-gray-900
                           focus:border-blue-500"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                variants={inputVariants}
                whileFocus="focus"
                initial="initial"
                disabled={loading} // Disable input during loading
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg font-medium text-white
                       bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                       shadow-md hover:shadow-lg transition duration-300 ease-in-out
                       disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={buttonHover}
            whileTap={buttonTap}
            disabled={loading} // Disable button during loading
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>



               {/* Google Sign-In Option */}
        <div className="text-center space-y-2">
          <p className="text-gray-600">Or sign in with</p>
          <GoogleSignInButton
            onSuccess={(user) => {
              setAuth(true, user); // Sync with auth store
              navigate('/dashboard'); // Redirect on success
            }}
            onError={(errorMsg) => setError(errorMsg)} // Handle errors
          />
        </div>



        {/* Navigation to Signup */}
        <div className="text-center">
          <motion.button
            onClick={() => navigate('/signup')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading} // Disable signup link during loading
          >
            Don't have an account? Sign Up
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;