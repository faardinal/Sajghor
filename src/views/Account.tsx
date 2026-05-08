import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, LogOut, ArrowRight, Eye } from 'lucide-react';

export default function Account() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { cart } = useCart();

  // Role-based routing effect
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Not logged in - show login/signup page
        return;
      }
      
      const role = user?.user_metadata?.role;
      if (role === 'admin') {
        navigate('/admin');
        return;
      }
      
      // Normal user - show dashboard (already on /account)
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/account');
    } catch (err) {
      setError('Error signing out');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        if (isSignUp) {
          setError('Check your email to confirm your account');
        } else {
          // Navigation will be handled by useEffect based on role
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-32 px-12 max-w-7xl mx-auto flex items-center justify-center"
      >
        <div className="text-charcoal/60 font-light">Loading...</div>
      </motion.div>
    );
  }

  // Not logged in - show login/signup form
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen pt-32 px-12 max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-serif italic text-charcoal mb-12">Atelier Account</h2>
        <div className="max-w-md mx-auto py-24">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-olive">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gold/30 py-2 focus:border-gold outline-none text-charcoal font-light"
                placeholder="heritage@boutique.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-olive">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gold/30 py-2 focus:border-gold outline-none text-charcoal font-light"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-boutique mt-8 disabled:opacity-50"
            >
              {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
            
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-[10px] uppercase tracking-widest text-olive hover:text-gold transition-colors duration-300"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Logged in user dashboard
  const cartPreview = cart.slice(0, 3);
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-32 px-12 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-serif italic text-charcoal mb-3">
          Welcome, {userName}
        </h1>
        <p className="text-[13px] uppercase tracking-[0.3em] text-olive font-light">
          Atelier Member
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-ivory/30 border border-gold/20 rounded-lg p-8"
        >
          <h3 className="text-lg font-serif text-charcoal mb-6">Account Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-olive mb-1">Email</p>
              <p className="text-charcoal font-light">{user?.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-olive mb-1">Member ID</p>
              <p className="text-charcoal/40 font-light text-xs">{user?.id?.slice(0, 8)}...</p>
            </div>
          </div>
        </motion.div>

        {/* Cart Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-ivory/30 border border-gold/20 rounded-lg p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif text-charcoal">Current Cart</h3>
            {cart.length > 0 && (
              <span className="text-[10px] uppercase tracking-widest text-olive">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          
          {cartPreview.length > 0 ? (
            <div className="space-y-4">
              {cartPreview.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-charcoal font-light">{item.name}</p>
                    <p className="text-xs text-charcoal/50">Qty: {item.quantity} × ${item.price}</p>
                  </div>
                </div>
              ))}
              
              {cart.length > 3 && (
                <p className="text-xs text-olive text-center">
                  +{cart.length - 3} more items
                </p>
              )}
            </div>
          ) : (
            <p className="text-charcoal/40 text-sm">Your cart is empty</p>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-16 max-w-2xl mx-auto"
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 px-6 py-3 border border-gold/30 text-charcoal hover:text-gold hover:border-gold transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4" />
            View Cart
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 border border-gold/30 text-charcoal hover:text-gold hover:border-gold transition-all duration-300"
          >
            <ArrowRight className="w-4 h-4" />
            Continue Shopping
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 border border-gold/30 text-charcoal hover:text-gold hover:border-gold transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Optional: Recently Viewed Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-24 text-center"
      >
        <h3 className="text-sm font-serif text-charcoal/60 mb-4">Recently Viewed Pieces</h3>
        <p className="text-xs text-olive/40">Your browsing history will appear here</p>
      </motion.div>
    </motion.div>
  );
}
