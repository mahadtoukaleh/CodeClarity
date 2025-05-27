"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Code, Users, Clock, Star, BookOpen, Calculator, Globe, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  plan: z.string().min(1, "Please select a plan"),
  message: z.string().min(10, "Please provide more details about your situation"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time slot"),
})

type FormData = z.infer<typeof formSchema>

// Time slots based on day of week
const getTimeSlots = (date: Date) => {
  const day = date.getDay()
  const isWeekend = day === 0 || day === 6 // 0 is Sunday, 6 is Saturday

  if (isWeekend) {
    return [
      "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00"
    ]
  } else {
    return [
      "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
    ]
  }
}

export default function CodeClarityLanding() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isBootcampModalOpen, setIsBootcampModalOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      plan: "",
      message: "",
      time: "",
    }
  })

  const bootcampFormSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    ageGroup: z.string().min(1, "Please select an age group"),
    parentName: z.string().min(2, "Parent/Guardian name must be at least 2 characters"),
    parentEmail: z.string().email("Please enter a valid email address"),
    parentPhone: z.string().min(10, "Please enter a valid phone number"),
  })

  const {
    register: registerBootcamp,
    handleSubmit: handleBootcampSubmit,
    control: controlBootcamp,
    formState: { errors: bootcampErrors },
    reset: resetBootcamp,
  } = useForm<z.infer<typeof bootcampFormSchema>>({
    resolver: zodResolver(bootcampFormSchema),
  })

  // Watch the date field to update available time slots
  const selectedDateValue = watch("date")

  useEffect(() => {
    if (selectedDateValue) {
      const slots = getTimeSlots(selectedDateValue)
      setAvailableTimeSlots(slots)
      // Reset time if current selection is not in new slots
      if (!slots.includes(watch("time"))) {
        setValue("time", "")
      }
    }
  }, [selectedDateValue, setValue, watch])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = new Date('2024-06-15T23:59:59')
      const difference = deadline.getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong')
      }

      toast({
        title: "Booking Request Sent!",
        description: "We'll get back to you within 24 hours to schedule your free consultation.",
      })
      
      reset()
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onBootcampSubmit = async (data: z.infer<typeof bootcampFormSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bootcamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong')
      }

      toast({
        title: "Registration Submitted!",
        description: "We'll send you a confirmation email with next steps shortly.",
      })
      
      resetBootcamp()
      setIsBootcampModalOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBookCall = () => {
    const bookingForm = document.getElementById("booking-form")
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleViewPricing = () => {
    const pricingSection = document.getElementById("pricing")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScrollToBootcamp = () => {
    const bootcampSection = document.getElementById("summer-bootcamp")
    if (bootcampSection) {
      bootcampSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleScrollToTop}
            >
              <Code className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CodeClarity</span>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button 
                onClick={handleScrollToBootcamp}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-full px-6 border-2 border-amber-300"
              >
                Summer Coding Bootcamp
              </Button>
              <Button 
                onClick={handleBookCall}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
              >
                Book Free Call
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-blue-100">
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => {
                    handleScrollToBootcamp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-full border-2 border-amber-300"
                >
                  Summer Coding Bootcamp
                </Button>
                <Button 
                  onClick={() => {
                    handleBookCall();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  Book Free Call
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="max-w-6xl mx-auto text-center relative">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100 animate-fade-in">
            From Confused to Confident — Learn Code the Right Way
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
            Learn to Code
            <span className="text-blue-600 block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">Without the Confusion</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            1-on-1 tutoring in Python, Java, math, and web development. Designed for students who want to
            actually get it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Button 
              onClick={handleBookCall}
              size="lg" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Book a Free 15-Minute Call
            </Button>
            <Button
              onClick={handleViewPricing}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-8 py-4 text-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              View Pricing
            </Button>
          </div>
          <div className="mt-6 animate-fade-in">
            <Button
              onClick={handleScrollToBootcamp}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-full px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-amber-300"
            >
              Summer 2025 Coding Bootcamp
            </Button>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500 animate-fade-in">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-full sm:w-auto">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Online & In-Person</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-full sm:w-auto">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Flexible Scheduling</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm w-full sm:w-auto">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Custom Notes Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Summer Bootcamp Promo */}
      <section id="summer-bootcamp" className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-base px-4 py-1">
                    Summer 2025 Registration Open
                  </Badge>
                  <h2 className="text-4xl font-bold text-gray-900">
                    Summer Coding Bootcamp
                  </h2>
                  <p className="text-xl text-gray-600">
                    Join our live 8-week coding adventure starting July 5th. Taught by a 4th Year Software Engineering student from Carleton University.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">Session Times</p>
                      <p className="text-gray-600">Kids (9-13): Saturdays at 11AM</p>
                      <p className="text-gray-600">Young Developers (14+): Saturdays at 3PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">What's Included</p>
                      <p className="text-gray-600">Live Zoom sessions with a university-level instructor, session replays, beginner-friendly curriculum</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 mb-6 border-2 border-amber-200">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Early Bird Registration
                      </Badge>
                      <span className="text-amber-800 font-semibold">Until June 15th</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Kids (9-13)</p>
                        <p className="text-2xl font-bold text-amber-600">$90 CAD</p>
                        <p className="text-sm text-gray-500">Saturdays at 11AM</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Young Developers (14+)</p>
                        <p className="text-2xl font-bold text-amber-600">$130 CAD</p>
                        <p className="text-sm text-gray-500">Saturdays at 3PM</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsBootcampModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full md:w-auto"
                  >
                    Reserve Your Spot Now
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white rounded-2xl"></div>
                <div className="relative h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <Code className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900">8 Weeks of Coding Fun</h3>
                    <ul className="space-y-4 text-left">
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-lg">Live interactive sessions</span>
                      </li>
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-lg">Session recordings included</span>
                      </li>
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-lg">Small group learning</span>
                      </li>
                      <li className="flex items-center text-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-lg">Fun projects & challenges</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master the fundamentals with clear, step-by-step guidance tailored to your learning style
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Python Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Basics, loops, functions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Object-oriented programming</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Data structures & algorithms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Real-world projects</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Java Fundamentals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Beginner to intermediate</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>University assignments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Problem-solving techniques</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Exam preparation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Web Development</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>HTML, CSS, JavaScript</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Build real websites</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Responsive design</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Modern frameworks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Math Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Functions & calculus</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Logic & algorithms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Problem-solving strategies</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>High school & uni level</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why CodeClarity */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why CodeClarity?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn from a Professional Software Engineer with a passion for teaching.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">University-Level Expertise</h3>
              <p className="text-gray-600">
                Currently pursuing Software Engineering at Carleton University, bringing real-world academic experience to every session.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized for Your Level</h3>
              <p className="text-gray-600">
                Whether you're a complete beginner or need help with advanced concepts, we meet you where you are.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Step-by-Step Breakdowns</h3>
              <p className="text-gray-600">
                No lecture-style dumps. We break down complex concepts into digestible, understandable pieces.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Focus on Real Understanding</h3>
              <p className="text-gray-600">
                We help with your actual assignments and exams, ensuring you truly grasp the material.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Scheduling</h3>
              <p className="text-gray-600">Online or in-person sessions that fit your busy student schedule.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Notes & Follow-ups</h3>
              <p className="text-gray-600">
                Get personalized notes and resources after every session to reinforce your learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">Simple, Transparent Pricing</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible options designed to fit your schedule and goals. All plans include our core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-blue-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="text-center pb-8 relative">
                <CardTitle className="text-2xl mb-2">Starter Plan</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  $120<span className="text-lg text-gray-500">/month</span>
                </div>
                <CardDescription>Perfect for staying on track and building confidence week by week</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-[400px]">
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>4 sessions per month (1/week)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>60-minute 1-on-1 sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Personalized progress tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Priority scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Homework & assignment support</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button 
                    onClick={handleBookCall}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Select This Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="text-center pb-8 relative">
                <CardTitle className="text-2xl mb-2">Focused Plan</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  $220<span className="text-lg text-gray-500">/month</span>
                </div>
                <CardDescription>Designed to catch up quickly or get ahead — fast</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-[400px]">
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>8 sessions per month (2/week)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>60-minute 1-on-1 sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Deep dive into assignments & test prep</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Priority scheduling + rescheduling flexibility</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Study strategy + accountability</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button 
                    onClick={handleBookCall}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Select This Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="text-center pb-8 relative">
                <CardTitle className="text-2xl mb-2">Quarterly Plan</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  $330<span className="text-lg text-gray-500"> (3-month bundle)</span>
                </div>
                <CardDescription>Commit once, stay consistent, and save</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-[400px]">
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>12 sessions total (1/week for 3 months)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>One-time payment (save $30)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Includes 1 bonus emergency session</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Locked-in schedule for 3 months</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Full access to support in between sessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Includes a personalized progress report</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Button 
                    onClick={handleBookCall}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Select This Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-white rounded-2xl p-8 shadow-sm border border-blue-100">
              <h3 className="text-xl font-semibold mb-4">All Plans Include</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-600">Flexible Scheduling</span>
                </div>
                <div className="flex flex-col items-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-600">Custom Study Materials</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-600">Expert Tutors</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">Not sure which plan is right for you?</p>
            <Button 
              onClick={handleBookCall}
              variant="outline" 
              className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full px-8"
            >
              Book a Free Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking-form" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600">Book your free 15-minute consultation call</p>
          </div>
          <Card className="border-blue-100 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Book Your Free Call</CardTitle>
              <CardDescription className="text-center">
                Let's discuss your goals and how we can help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Input
                      {...register("firstName")}
                      placeholder="First Name"
                      className={errors.firstName ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...register("lastName")}
                      placeholder="Last Name"
                      className={errors.lastName ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Controller
                      control={control}
                      name="subject"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className={errors.subject ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="web">Web Development</SelectItem>
                            <SelectItem value="math">Math</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name="plan"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className={errors.plan ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter Plan ($120/month)</SelectItem>
                            <SelectItem value="focused">Focused Plan ($220/month)</SelectItem>
                            <SelectItem value="quarterly">Quarterly Plan ($330/3-months)</SelectItem>
                            <SelectItem value="not-sure">Not Sure - Need Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.plan && (
                      <p className="mt-1 text-sm text-red-500">{errors.plan.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                                errors.date && "border-red-500"
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date)
                                setSelectedDate(date)
                              }}
                              disabled={(date) => {
                                // Disable past dates
                                return date < new Date(new Date().setHours(0, 0, 0, 0))
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name="time"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting || !selectedDateValue}
                        >
                          <SelectTrigger className={errors.time ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Textarea
                    {...register("message")}
                    placeholder="Tell us about your goals and what you'd like to learn..."
                    className={`min-h-[120px] ${errors.message ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <p className="mb-2">Available hours:</p>
                  <ul className="list-disc list-inside">
                    <li>Weekdays (Mon-Fri): 3:00 PM - 9:00 PM</li>
                    <li>Weekends (Sat-Sun): 7:00 AM - 6:00 PM</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Book Your Free Consultation"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">We're here to help you succeed. Reach out anytime!</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-blue-600">hello@codeclarityacademy.com</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="font-semibold mb-2">Follow Us</h3>
              <p className="text-blue-600">@codeclarityacademy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Code className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">CodeClarity</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p className="mb-2">From Confused to Confident — Learn Code the Right Way</p>
              <p>&copy; 2024 CodeClarity Tutoring. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Add Toaster at the end of the component */}
      <Toaster />

      {/* Add the bootcamp registration modal */}
      <Dialog open={isBootcampModalOpen} onOpenChange={setIsBootcampModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Summer Coding Bootcamp Registration</DialogTitle>
            <DialogDescription className="text-center">
              Join our 8-week coding adventure starting July 5th, 2025
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBootcampSubmit(onBootcampSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Student's First Name</Label>
                <Input
                  id="firstName"
                  {...registerBootcamp("firstName")}
                  className={bootcampErrors.firstName ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {bootcampErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{bootcampErrors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Student's Last Name</Label>
                <Input
                  id="lastName"
                  {...registerBootcamp("lastName")}
                  className={bootcampErrors.lastName ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {bootcampErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{bootcampErrors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Student's Email</Label>
              <Input
                id="email"
                type="email"
                {...registerBootcamp("email")}
                className={bootcampErrors.email ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {bootcampErrors.email && (
                <p className="mt-1 text-sm text-red-500">{bootcampErrors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ageGroup">Age Group</Label>
              <Controller
                control={controlBootcamp}
                name="ageGroup"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={bootcampErrors.ageGroup ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kids">Kids (9-13) - Saturdays at 11AM</SelectItem>
                      <SelectItem value="teens">Junior Developers (14+) - Saturdays at 3PM</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {bootcampErrors.ageGroup && (
                <p className="mt-1 text-sm text-red-500">{bootcampErrors.ageGroup.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="parentName">Parent/Guardian Name</Label>
                  <Input
                    id="parentName"
                    {...registerBootcamp("parentName")}
                    className={bootcampErrors.parentName ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {bootcampErrors.parentName && (
                    <p className="mt-1 text-sm text-red-500">{bootcampErrors.parentName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    {...registerBootcamp("parentEmail")}
                    className={bootcampErrors.parentEmail ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {bootcampErrors.parentEmail && (
                    <p className="mt-1 text-sm text-red-500">{bootcampErrors.parentEmail.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  {...registerBootcamp("parentPhone")}
                  className={bootcampErrors.parentPhone ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {bootcampErrors.parentPhone && (
                  <p className="mt-1 text-sm text-red-500">{bootcampErrors.parentPhone.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
