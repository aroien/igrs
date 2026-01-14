'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/lib/styles-compiled.css'
import './payment.css'

interface Course {
  id: string
  title: string
  price: string
  category: string
  level: string
  thumbnail?: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [cart, setCart] = useState<Course[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [focused, setFocused] = useState<'number' | 'name' | 'expiry' | 'cvc' | '' | undefined>('')
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    email: currentUser?.email || ''
  })

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login')
      return
    }

    loadData()
  }, [currentUser, router])

  const loadData = () => {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]')
    setAllCourses(courses)

    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const cartCourses = courses.filter((c: Course) => savedCart.includes(c.id))
    setCart(cartCourses)

    if (currentUser) {
      setPaymentData(prev => ({
        ...prev,
        email: currentUser.email
      }))
    }
  }

  const removeFromCart = (courseId: string) => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    const updatedCart = savedCart.filter((id: string) => id !== courseId)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    setCart(cart.filter(c => c.id !== courseId))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, course) => {
      const price = course.price === 'Free' ? 0 : parseFloat(course.price.toString())
      return total + price
    }, 0)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    // Validate payment data
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.holderName) {
      alert('Please fill in all payment details')
      return
    }

    setLoading(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create transaction record for admin portal
      const paymentsData = JSON.parse(localStorage.getItem('payments') || '[]')
      const totalAmount = getTotalPrice()
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const transaction = {
        id: paymentsData.length + 1,
        transactionId,
        userName: currentUser?.name || 'Unknown User',
        userEmail: currentUser?.email || '',
        userId: currentUser?.id,
        coursesEnrolled: cart.map(c => c.title).join(', '),
        courseCount: cart.length,
        amount: totalAmount,
        paymentMethod: paymentMethod,
        cardLast4: paymentData.cardNumber.slice(-4),
        date: new Date().toISOString(),
        status: 'completed',
        paymentDetails: {
          holderName: paymentData.holderName,
          email: paymentData.email
        }
      }
      
      paymentsData.push(transaction)
      localStorage.setItem('payments', JSON.stringify(paymentsData))

      // Enroll in all courses
      const enrollmentsData = JSON.parse(localStorage.getItem('enrollments') || '[]')

      cart.forEach(course => {
        const existingEnrollment = enrollmentsData.find(
          (e: any) => e.userId === currentUser?.id && e.courseId === course.id
        )

        if (!existingEnrollment) {
          const newEnrollment = {
            id: Date.now().toString() + Math.random(),
            userId: currentUser?.id,
            courseId: course.id,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            completedLessons: [],
            lastAccessedAt: new Date().toISOString(),
            transactionId: transactionId
          }
          enrollmentsData.push(newEnrollment)
        }
      })

      localStorage.setItem('enrollments', JSON.stringify(enrollmentsData))

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]))

      // Show success message
      alert('✓ Payment successful! You are now enrolled in the courses.')

      // Redirect to student dashboard
      router.push('/student')
    } catch (err) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/90 backdrop-blur-xl shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/student" className="text-teal-400 hover:text-teal-300 transition flex items-center gap-2">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              IGRS LMS - Payment
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🛒</div>
                  <p className="text-slate-400 text-sm">Your cart is empty</p>
                  <Link
                    href="/student"
                    className="block mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(course => (
                    <div key={course.id} className="flex items-start justify-between gap-3 pb-4 border-b border-slate-700">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-white line-clamp-2">{course.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{course.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-teal-400">
                          {course.price === 'Free' ? 'Free' : `৳${course.price}`}
                        </span>
                        <button
                          onClick={() => removeFromCart(course.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-white font-medium">৳{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Discount</span>
                      <span className="text-green-400 font-medium">৳0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-700">
                      <span className="text-white">Total</span>
                      <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                        ৳{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            {cart.length > 0 ? (
              <form onSubmit={handlePayment} className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Payment Information</h2>

                {/* Payment Method Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-lg border-2 transition ${
                        paymentMethod === 'card'
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-sm font-medium text-white">💳 Credit Card</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mobile')}
                      className={`p-3 rounded-lg border-2 transition ${
                        paymentMethod === 'mobile'
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-sm font-medium text-white">📱 Mobile Money</div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-6">
                    {/* Credit Card Display */}
                    <div className="flex justify-center p-6 bg-gradient-to-b from-slate-700/50 to-slate-800/50 rounded-lg border border-slate-600">
                      <Cards
                        number={paymentData.cardNumber.replace(/\s/g, '')}
                        expiry={paymentData.expiryDate}
                        cvc={paymentData.cvv}
                        name={paymentData.holderName}
                        focused={focused}
                      />
                    </div>

                    {/* Card Input Fields */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="holderName"
                        value={paymentData.holderName}
                        onChange={(e) => setPaymentData({ ...paymentData, holderName: e.target.value })}
                        onFocus={() => setFocused('name')}
                        className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, '')
                          if (value.length > 16) value = value.slice(0, 16)
                          const formattedValue = value.replace(/(.{4})/g, '$1 ').trim()
                          setPaymentData({ ...paymentData, cardNumber: formattedValue })
                        }}
                        onFocus={() => setFocused('number')}
                        className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-widest"
                        placeholder="4532 1234 5678 9010"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4)
                            }
                            setPaymentData({ ...paymentData, expiryDate: value })
                          }}
                          onFocus={() => setFocused('expiry')}
                          className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-widest"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length > 4) value = value.slice(0, 4)
                            setPaymentData({ ...paymentData, cvv: value })
                          }}
                          onFocus={() => setFocused('cvc')}
                          className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-widest"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Money Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="+88 017 XXXX XXXX"
                        required
                      />
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-400">A confirmation code will be sent to your mobile number</p>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <label className="flex items-center gap-2 mb-6">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-600 accent-teal-500"
                    />
                    <span className="text-sm text-slate-300">I agree to the terms and conditions</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        💳 Pay ৳{getTotalPrice().toFixed(2)}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/student')}
                    className="w-full mt-3 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-lg border border-slate-700 p-8 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
                <p className="text-slate-400 mb-6">Add courses to your cart to proceed with payment</p>
                <Link
                  href="/student"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
