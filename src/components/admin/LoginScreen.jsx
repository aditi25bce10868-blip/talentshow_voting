import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState('raunak25bce10529@vitbhopal.ac.in');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const [mode,     setMode]     = useState('login'); // 'login' | 'register'

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const targetEmail = email.trim() || 'raunak25bce10529@vitbhopal.ac.in';

    if (mode === 'register') {
      try {
        await createUserWithEmailAndPassword(auth, targetEmail, password);
        onLogin();
        return;
      } catch (regErr) {
        console.error('Registration Error:', regErr.code, regErr.message);
        if (regErr.code === 'auth/email-already-in-use') {
          // Email already exists, try signing in with it
          try {
            await signInWithEmailAndPassword(auth, targetEmail, password);
            onLogin();
            return;
          } catch (signInErr) {
            setError('This email is already registered, but the password was incorrect. If you forgot the password, reset it in Firebase Console.');
          }
        } else if (regErr.code === 'auth/operation-not-allowed') {
          setError('Email/Password provider is not enabled in Firebase. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.');
        } else if (regErr.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else {
          setError(`Registration error (${regErr.code}): ${regErr.message}`);
        }
        setBusy(false);
        return;
      }
    }

    // Default 'login' mode
    try {
      await signInWithEmailAndPassword(auth, targetEmail, password);
      onLogin();
    } catch (err) {
      console.error('Firebase Auth Error:', err.code, err.message);

      // If user not found, automatically attempt creation with the provided credentials
      if (err.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, targetEmail, password);
          onLogin();
          return;
        } catch (createErr) {
          if (createErr.code === 'auth/operation-not-allowed') {
            setError('Email/Password sign-in is disabled in your Firebase project. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.');
          } else {
            setError(`User '${targetEmail}' not found. Click "Register Admin" tab to create this admin user.`);
          }
          setBusy(false);
          return;
        }
      }

      let msg = 'Incorrect email or password. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect password for this user. If you haven\'t created this account yet, click the "Register Admin" tab above.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in your Firebase project. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email format.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access temporarily disabled due to many failed login attempts. Try again in a few minutes or reset password in Firebase Console.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please check your internet connection.';
      } else if (err.code) {
        msg = `Login failed (${err.code}): ${err.message}`;
      }

      setError(msg);
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black relative overflow-hidden">
      {/* Glow / ember background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-16 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 w-full max-w-sm border border-orange-500/30 relative z-10 space-y-6"
      >
        <div className="text-center">
          <span className="text-5xl inline-block mb-2">🔐</span>
          <h1 className="text-2xl font-black gradient-text">Admin Panel</h1>
          <p className="text-white/40 text-xs mt-1">
            {mode === 'login' ? 'Enter your admin credentials' : 'Register new admin account'}
          </p>
        </div>

        {/* Tab switcher: Login vs Register */}
        <div className="flex rounded-xl bg-black/50 p-1 border border-orange-500/20">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-orange-500 text-black shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-orange-500 text-black shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Register Admin
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vitbhopal.ac.in"
              required
              className="input"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
              minLength={6}
              className="input"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center font-semibold bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full py-3"
          >
            {busy
              ? 'Please wait…'
              : mode === 'login'
              ? 'Login →'
              : 'Create & Sign In →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
