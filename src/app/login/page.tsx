'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Chrome, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function Login() {
  const router = useRouter()
  const { login, currentUser } = useAuth()
  const [socialLoading, setSocialLoading] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    // Redirect if already logged in
    if (currentUser) {
      const role = currentUser.role?.toLowerCase();
      const route = role === 'admin' ? '/admin' : 
                    role === 'teacher' ? '/teacher' : '/student';
      router.push(route);
    }
    setAnimateIn(true)
  }, [currentUser, router]);

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider)
    try {
      // Placeholder for social auth integration
      console.log(`Signing in with ${provider}`)
      // In production, integrate with OAuth providers
      setTimeout(() => {
        setSocialLoading('')
        setError('Social authentication coming soon')
      }, 1500)
    } catch (err) {
      setError(`${provider} authentication failed`)
      setSocialLoading('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Get the updated user to redirect properly
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const role = (user?.role || '').toLowerCase();
        const route = role === 'admin' ? '/admin' : 
                      role === 'teacher' ? '/teacher' : '/student';
        router.push(route);
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Header with Animation */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition">
            <h1 className="text-5xl font-serif font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                IGRS
              </span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to your learning dashboard</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Social Login */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400 text-center">Sign in with</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { Icon: Chrome, label: 'Google', provider: 'google', color: 'hover:text-blue-400' },
                  { Icon: Facebook, label: 'Facebook', provider: 'facebook', color: 'hover:text-blue-600' }
                ].map(social => (
                  <Button
                    key={social.provider}
                    type="button"
                    onClick={() => handleSocialAuth(social.provider as 'google' | 'facebook')}
                    disabled={socialLoading === social.provider}
                    variant="outline"
                    className="h-auto py-3"
                  >
                    <social.Icon 
                      size={18} 
                      className={`transition-transform ${socialLoading === social.provider ? 'animate-spin' : ''}`}
                    />
                    <span className="text-sm font-medium">{social.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">or email</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3 animate-in fade-in duration-300">
                <span className="text-lg mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="animate-in fade-in duration-500">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setError('')
                }}
                placeholder="you@example.com"
                className="mt-2"
              />
              {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && <span className="text-teal-400 text-sm mt-1 block">✓ Valid email</span>}
            </div>

            {/* Password Field */}
            <div className="animate-in fade-in duration-500 delay-75">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setError('')
                }}
                placeholder="••••••••"
                className="mt-2"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm animate-in fade-in duration-500 delay-150">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked === true })}
                />
                <Label htmlFor="remember" className="cursor-pointer">Remember me</Label>
              </div>
              <Link
                href="#"
                className="text-teal-400 hover:text-teal-300 transition font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-auto py-3 text-base font-semibold"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-400">New to IGRS?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-slate-400">Don't have an account? </span>
          <Link href="/register" className="text-teal-400 hover:text-teal-300 font-medium transition">
            Create one now
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>By signing in, you agree to our <Link href="#" className="text-teal-400 hover:text-teal-300">Terms</Link> & <Link href="#" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  )
}
