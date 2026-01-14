'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Chrome, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumbers: boolean
  }
}

export default function Register() {
  const router = useRouter()
  const { register, currentUser } = useAuth()
  const [socialLoading, setSocialLoading] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (currentUser) {
      router.push('/student');
    }
    setAnimateIn(true)
  }, [currentUser, router]);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    return phoneRegex.test(phone)
  }

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider)
    try {
      // Placeholder for social auth integration
      console.log(`Signing up with ${provider}`)
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

  const passwordStrength = useMemo((): PasswordStrength => {
    const password = formData.password
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password)
    }

    const metRequirements = Object.values(requirements).filter(Boolean).length
    
    let score = 0
    let label = 'Weak'
    let color = 'text-red-400'

    if (metRequirements <= 1) {
      score = 1
      label = 'Weak'
      color = 'text-red-400'
    } else if (metRequirements === 2) {
      score = 2
      label = 'Fair'
      color = 'text-yellow-400'
    } else if (metRequirements === 3) {
      score = 3
      label = 'Good'
      color = 'text-blue-400'
    } else {
      score = 4
      label = 'Strong'
      color = 'text-green-400'
    }

    return { score, label, color, requirements }
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please use uppercase, lowercase, and numbers')
      return
    }

    setLoading(true)

    try {
      const success = await register(formData.name, formData.email, formData.password, 'student');
      
      if (success) {
        router.push('/student');
      } else {
        setError('Email already exists');
      }
    } catch (err: any) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Header with Animation */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition">
            <h1 className="text-5xl font-serif font-bold tracking-tight">
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                IGRS
              </span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Start Learning Today</h2>
          <p className="text-slate-400">Join thousands of students mastering geospatial science</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Social Login */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400 text-center">Sign up with</p>
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

              {/* Name Field */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setError('')
                  }}
                  placeholder="John Doe"
                  className="mt-2"
                />
                {formData.name && <span className="text-teal-400 text-sm mt-1 block">✓ Name entered</span>}
              </div>

              {/* Email Field */}
              <div>
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
                <p className="text-xs text-slate-400 mt-1.5">We'll never share your email</p>
              </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  setError('')
                }}
                placeholder="+1 (555) 123-4567"
                className="mt-2"
              />
              {formData.phone && validatePhone(formData.phone) && <span className="text-teal-400 text-sm mt-1 block">✓ Valid phone</span>}
            </div>
              {/* Password Field */}
              <div>
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Password strength:</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        passwordStrength.score === 1 ? 'bg-red-500/20 text-red-400' :
                        passwordStrength.score === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        passwordStrength.score === 3 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    
                    {/* Strength Bar */}
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          passwordStrength.score === 1 ? 'w-1/4 bg-red-500' :
                          passwordStrength.score === 2 ? 'w-1/2 bg-yellow-500' :
                          passwordStrength.score === 3 ? 'w-3/4 bg-blue-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordStrength.requirements.minLength ? 'text-green-400' : 'text-slate-500'}`}>
                        <span className="text-sm">{passwordStrength.requirements.minLength ? '✓' : '○'}</span>
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordStrength.requirements.hasUppercase ? 'text-green-400' : 'text-slate-500'}`}>
                        <span className="text-sm">{passwordStrength.requirements.hasUppercase ? '✓' : '○'}</span>
                        <span>Uppercase</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordStrength.requirements.hasLowercase ? 'text-green-400' : 'text-slate-500'}`}>
                        <span className="text-sm">{passwordStrength.requirements.hasLowercase ? '✓' : '○'}</span>
                        <span>Lowercase</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${passwordStrength.requirements.hasNumbers ? 'text-green-400' : 'text-slate-500'}`}>
                        <span className="text-sm">{passwordStrength.requirements.hasNumbers ? '✓' : '○'}</span>
                        <span>Numbers</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    setError('')
                  }}
                  placeholder="••••••••"
                  className="mt-2"
                />
                  {formData.password && formData.confirmPassword && (
                    <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                      {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
              </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3 animate-in fade-in duration-300">
                <span className="text-lg mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-auto py-3 text-base font-semibold"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Creating account...
                </>
              ) : (
                'Create Student Account'
              )}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account? <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>By signing up, you agree to our <Link href="#" className="text-teal-400 hover:text-teal-300">Terms</Link> & <Link href="#" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  )
}
