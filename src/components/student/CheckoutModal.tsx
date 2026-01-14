'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, CreditCard, Building2, Wallet, Check } from 'lucide-react'
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/lib/styles-compiled.css'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Course {
  id: string
  title: string
  price: string
  thumbnail?: string
  category: string
  level: string
}

interface CheckoutModalProps {
  course: Course
  onClose: () => void
  onSuccess: (courseId: string) => void
  currentUser: { id: string; name: string; email: string }
}

export function CheckoutModal({ course, onClose, onSuccess, currentUser }: CheckoutModalProps) {
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<'number' | 'name' | 'expiry' | 'cvc' | ''>('')
  const [error, setError] = useState('')
  const [transactionId] = useState(() => `TXN-${Date.now()}`)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  })

  const price = course.price === 'Free' ? 0 : parseFloat(course.price.replace(/[^0-9.]/g, ''))
  const tax = price * 0.1 // 10% tax
  const total = price + tax

  // Card validation functions
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '')
    return /^\d{13,19}$/.test(cleaned) && luhnCheck(cleaned)
  }

  const luhnCheck = (num: string): boolean => {
    let sum = 0
    let isEven = false
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i], 10)
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }

  const validateExpiry = (expiry: string): boolean => {
    const [month, year] = expiry.split('/')
    if (!month || !year) return false
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)
    if (m < 1 || m > 12) return false
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    return y > currentYear || (y === currentYear && m >= currentMonth)
  }

  const validateCVC = (cvc: string): boolean => {
    return /^\d{3,4}$/.test(cvc)
  }

  const validateCardInfo = (): boolean => {
    if (!validateCardNumber(cardData.number)) {
      return false
    }
    if (!validateExpiry(cardData.expiry)) {
      return false
    }
    if (!validateCVC(cardData.cvc)) {
      return false
    }
    if (!cardData.name.trim()) {
      return false
    }
    return true
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (paymentMethod === 'card' && !validateCardInfo()) {
      setError('Please enter valid card information')
      return
    }

    setLoading(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create payment record
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    const txnId = `TXN-${Date.now()}`
    
    payments.push({
      id: txnId,
      userId: currentUser.id,
      courseId: course.id,
      amount: total,
      method: paymentMethod,
      status: 'completed',
      transactionId: txnId,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('payments', JSON.stringify(payments))

    // Create enrollment via API
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          courseId: course.id
        })
      })
      
      if (!response.ok) {
        throw new Error('Enrollment failed')
      }
    } catch (error) {
      console.error('API enrollment failed, falling back to localStorage:', error)
      // Fallback to localStorage
      const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]')
      enrollments.push({
        id: Date.now().toString(),
        userId: currentUser.id,
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        lastAccessedAt: new Date().toISOString()
      })
      localStorage.setItem('enrollments', JSON.stringify(enrollments))
    }

    setLoading(false)
    setStep('success')
    
    setTimeout(() => {
      onSuccess(course.id)
    }, 2000)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'review' && 'Review Your Order'}
            {step === 'payment' && 'Payment Details'}
            {step === 'success' && 'Enrollment Successful!'}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-300 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {step === 'review' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Course Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Course Details</h3>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="font-bold text-white mb-2">{course.title}</h4>
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-teal-400">{course.price}</div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Course Price</span>
                    <span className="font-semibold">${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (10%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3 flex justify-between text-white text-lg font-bold">
                    <span>Total</span>
                    <span className="text-teal-400">${total.toFixed(2)}</span>
                  </div>
                  
                  <Button
                    onClick={() => setStep('payment')}
                    className="w-full mt-4 h-auto py-3"
                  >
                    Proceed to Payment
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex gap-2 text-blue-400 text-sm">
                    <Check className="w-5 h-5 shrink-0" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex gap-2 text-blue-400 text-sm mt-2">
                    <Check className="w-5 h-5 shrink-0" />
                    <span>Lifetime access to course materials</span>
                  </div>
                  <div className="flex gap-2 text-blue-400 text-sm mt-2">
                    <Check className="w-5 h-5 shrink-0" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePayment} className="grid md:grid-cols-2 gap-6">
              {/* Payment Method Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                <div className="space-y-3 mb-6">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'paypal' | 'bank')}
                      className="w-5 h-5"
                    />
                    <CreditCard className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-medium">Credit/Debit Card</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'paypal' | 'bank')}
                      className="w-5 h-5"
                    />
                    <Wallet className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-medium">PayPal</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                    paymentMethod === 'bank'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'paypal' | 'bank')}
                      className="w-5 h-5"
                    />
                    <Building2 className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-medium">Bank Transfer</span>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Cards
                        number={cardData.number}
                        name={cardData.name}
                        expiry={cardData.expiry}
                        cvc={cardData.cvc}
                        focused={focused}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
                          setCardData({ ...cardData, number: val })
                        }}
                        onFocus={() => setFocused('number')}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-2 bg-slate-800 border-2 rounded-lg text-white focus:outline-none transition ${
                          cardData.number && !validateCardNumber(cardData.number)
                            ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                            : cardData.number && validateCardNumber(cardData.number)
                            ? 'border-green-500 focus:ring-2 focus:ring-green-400'
                            : 'border-slate-600 focus:ring-2 focus:ring-teal-500'
                        }`}
                        required
                      />
                      {cardData.number && !validateCardNumber(cardData.number) && (
                        <p className="text-xs text-red-400 mt-1">Invalid card number</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        placeholder="John Doe"
                        className={`w-full px-4 py-2 bg-slate-800 border-2 rounded-lg text-white focus:outline-none transition ${
                          cardData.name && cardData.name.trim()
                            ? 'border-green-500 focus:ring-2 focus:ring-green-400'
                            : 'border-slate-600 focus:ring-2 focus:ring-teal-500'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '')
                            if (val.length >= 2) {
                              val = val.slice(0, 2) + '/' + val.slice(2, 4)
                            }
                            setCardData({ ...cardData, expiry: val })
                          }}
                          onFocus={() => setFocused('expiry')}
                          maxLength={5}
                          placeholder="MM/YY"
                          className={`w-full px-4 py-2 bg-slate-800 border-2 rounded-lg text-white focus:outline-none transition ${
                            cardData.expiry && !validateExpiry(cardData.expiry)
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                              : cardData.expiry && validateExpiry(cardData.expiry)
                              ? 'border-green-500 focus:ring-2 focus:ring-green-400'
                              : 'border-slate-600 focus:ring-2 focus:ring-teal-500'
                          }`}
                          required
                        />
                        {cardData.expiry && !validateExpiry(cardData.expiry) && (
                          <p className="text-xs text-red-400 mt-1">Invalid or expired</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                        <input
                          type="text"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                          onFocus={() => setFocused('cvc')}
                          maxLength={4}
                          placeholder="123"
                          className={`w-full px-4 py-2 bg-slate-800 border-2 rounded-lg text-white focus:outline-none transition ${
                            cardData.cvc && !validateCVC(cardData.cvc)
                              ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                              : cardData.cvc && validateCVC(cardData.cvc)
                              ? 'border-green-500 focus:ring-2 focus:ring-green-400'
                              : 'border-slate-600 focus:ring-2 focus:ring-teal-500'
                          }`}
                          required
                        />
                        {cardData.cvc && !validateCVC(cardData.cvc) && (
                          <p className="text-xs text-red-400 mt-1">Invalid CVV</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 text-center">
                    <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <p className="text-slate-300 mb-4">You will be redirected to PayPal to complete your payment</p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <Building2 className="w-12 h-12 mb-4 text-blue-400" />
                    <h4 className="font-semibold text-white mb-3">Bank Transfer Details</h4>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div><span className="font-medium">Bank:</span> IGRS Bank</div>
                      <div><span className="font-medium">Account:</span> 1234567890</div>
                      <div><span className="font-medium">Reference:</span> {currentUser.id}-{course.id}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3 mb-6">
                  <div className="flex gap-3">
                    {course.thumbnail && (
                      <Image src={course.thumbnail} alt={course.title} width={80} height={80} className="w-20 h-20 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{course.title}</h4>
                      <div className="text-xs text-slate-400 mt-1">{course.category} • {course.level}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-3 space-y-2">
                    <div className="flex justify-between text-slate-300 text-sm">
                      <span>Subtotal</span>
                      <span>${price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-slate-700">
                      <span>Total</span>
                      <span className="text-teal-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || (paymentMethod === 'card' && !validateCardInfo())}
                  className={`w-full h-auto py-3 font-semibold text-base transition ${
                    paymentMethod === 'card' && !validateCardInfo()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `Complete Payment - $${total.toFixed(2)}`
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => setStep('review')}
                  variant="outline"
                  className="w-full mt-3 h-auto py-3"
                >
                  Back to Review
                </Button>

                <div className="mt-4 text-center text-xs text-slate-400">
                  <p>🔒 Secure payment with 256-bit SSL encryption</p>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Payment Successful!</h3>
              <p className="text-slate-300 mb-6">
                You have successfully enrolled in <span className="font-semibold text-white">{course.title}</span>
              </p>
              <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-auto border border-slate-700">
                <div className="text-sm text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-white">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-semibold text-teal-400">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize text-white">{paymentMethod}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-6">
                Redirecting to your courses...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
