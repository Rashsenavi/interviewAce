import React from 'react';
import Link from 'next/link';
import { Code, Building2, Factory, Radio, Target, DollarSign, CheckCircle2, TrendingUp, BookOpen, Languages, BarChart3, Video, Star, Check } from 'lucide-react';

export default function InterviewAceLanding() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold">
                IA
              </div>
              <span className="text-xl font-bold text-gray-900">InterviewAce</span>
            </div>
            
            <div className="hidden md:flex gap-8">
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#industries" className="text-gray-700 hover:text-blue-600">Industries</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <Link href="/job-seeker/interviewers" className="text-gray-700 hover:text-blue-600">Browse Interviewers</Link>
            </div>
            
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-medium text-lg min-w-[120px]">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-blue-400 bg-opacity-30 rounded-full px-8 py-3 text-base mb-6">
                <span className="text-xl">🇱🇰</span>
                <span className="text-white font-medium">Made for Sri Lankan Job Seekers</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Ace Your Next Interview with Real Industry Professionals
              </h1>
              <p className="text-lg mb-8 text-blue-50 leading-relaxed">
                Practice with verified experts from WSO2, Dialog, Commercial Bank, and more. Affordable, culturally relevant interview preparation for Sri Lankan job seekers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="bg-orange-500 text-white px-10 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors min-w-[200px] text-center">
                  Find an Interviewer
                </Link>
                <Link href="/register-interviewer" className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 border border-white transition-colors min-w-[200px] text-center">
                  Become an Interviewer
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 relative">
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold rotate-12">
                  New Sessions Daily!
                </div>
                <div className="bg-gray-900 rounded-lg aspect-video mb-4 flex items-center justify-center">
                  <Video className="w-16 h-16 text-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white bg-opacity-30 backdrop-blur rounded-lg p-4">
                    <div className="text-sm text-black">Success Rate</div>
                    <div className="text-3xl font-bold text-blue-700">87%</div>
                  </div>
                  <div className="bg-white bg-opacity-30 backdrop-blur rounded-lg p-4">
                    <div className="text-sm text-black">Avg. Improvement</div>
                    <div className="text-3xl font-bold text-green-400">+45%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mt-16 text-center">
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-blue-100">Students Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold">200+</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold">4.8/5</div>
              <div className="text-blue-100">Verified Professionals</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Get interview-ready in three simple steps. Start practicing today and land your dream job.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">1</div>
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Browse and Book</h3>
              <p className="text-gray-600">
                Find verified professionals from your target industry.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">2</div>
              <div className="bg-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Practice Interview</h3>
              <p className="text-gray-600">
                Join video sessions at your convenience.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">3</div>
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Feedback</h3>
              <p className="text-gray-600">
                Receive detailed guidance to improve your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Industries Covered</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Prepare for interviews across top industries.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">IT and Software</h3>
              <p className="text-blue-600 font-semibold">350+ Questions</p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-500 transition-colors cursor-pointer">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Banking and Finance</h3>
              <p className="text-blue-600 font-semibold">250+ Questions</p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-orange-500 transition-colors cursor-pointer">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <Factory className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Manufacturing</h3>
              <p className="text-blue-600 font-semibold">180+ Questions</p>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition-colors cursor-pointer">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <Radio className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Telecommunications</h3>
              <p className="text-blue-600 font-semibold">200+ Questions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose InterviewAce?</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Built specifically for Sri Lankan job seekers.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Industry-Specific Preparation</h3>
              <p className="text-gray-600">
                Practice with questions tailored to your target company.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Affordable LKR Pricing</h3>
              <p className="text-gray-600">
                Sessions starting from LKR 2,500.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Local Professionals</h3>
              <p className="text-gray-600">
                Every interviewer is manually verified.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Languages className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Multi-Language Support</h3>
              <p className="text-gray-600">
                Practice in your preferred language.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Progress Tracking</h3>
              <p className="text-gray-600">
                See your improvement over time.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Question Banks</h3>
              <p className="text-gray-600">
                Access 1000+ practice questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Success Stories</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Real students, real results.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                Got my dream job at WSO2 after 3 practice sessions!
              </p>
              <div className="flex items-center">
                <div className="bg-blue-200 w-12 h-12 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold">Kasun Perera</div>
                  <div className="text-sm text-gray-600">University of Moratuwa</div>
                  <div className="text-sm text-blue-600">Software Engineer at WSO2</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                The banking sector interviews felt so authentic.
              </p>
              <div className="flex items-center">
                <div className="bg-green-200 w-12 h-12 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold">Thilini Fernando</div>
                  <div className="text-sm text-gray-600">University of Colombo</div>
                  <div className="text-sm text-blue-600">Management Trainee</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                InterviewAce gave me the confidence I needed.
              </p>
              <div className="flex items-center">
                <div className="bg-purple-200 w-12 h-12 rounded-full mr-4"></div>
                <div>
                  <div className="font-bold">Ravindu Silva</div>
                  <div className="text-sm text-gray-600">University of Peradeniya</div>
                  <div className="text-sm text-blue-600">Network Engineer</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">87%</div>
              <div className="text-gray-600">Job Placement Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">2,500+</div>
              <div className="text-gray-600">Sessions Completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Single Session</h3>
              <p className="text-gray-600 mb-6">Perfect for quick preparation</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">LKR 2,500</span>
                <div className="text-gray-600 mt-2">30 minutes</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">1 mock interview session</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Industry-specific questions</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basic feedback report</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 text-center">
                Get Started
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional Pack</h3>
              <p className="text-gray-600 mb-6">Comprehensive prep</p>
              <div className="mb-6">
                <div className="text-gray-400 line-through">LKR 15,000</div>
                <span className="text-5xl font-bold">LKR 12,000</span>
                <div className="text-gray-600 mt-2">5 sessions</div>
                <div className="text-green-600 font-semibold mt-1">Save LKR 3,000</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">5 mock interview sessions</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Multiple industries coverage</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Detailed feedback reports</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 text-center">
                Get Started
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Career Accelerator</h3>
              <p className="text-gray-600 mb-6">Complete transformation</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">LKR 20,000</span>
                <div className="text-gray-600 mt-2">10 sessions</div>
                <div className="text-green-600 font-semibold mt-1">Save LKR 10,000</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">10 comprehensive sessions</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All industries access</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Advanced feedback</span>
                </li>
              </ul>
              <Link href="/register" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 text-center">
                Get Started
              </Link>
            </div>
          </div>
          
          <div className="mt-12 bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
            <div>
              <div className="text-xl font-bold text-gray-900">100% Money-Back Guarantee</div>
              <div className="text-gray-600">Not satisfied? Get a full refund within 24 hours.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Interview Skills?</h2>
          <p className="text-xl mb-8 text-blue-50">
            Join 500+ students who have landed jobs at top companies.
          </p>
          <Link href="/register" className="inline-block bg-orange-500 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600">
            Get Started Today
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold">
                  IA
                </div>
                <span className="text-xl font-bold">InterviewAce</span>
              </div>
              <p className="text-gray-400 mb-4">
                Made for Sri Lankan Job Seekers.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
                <li><a href="#industries" className="text-gray-400 hover:text-white">Industries</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">For Professionals</h4>
              <ul className="space-y-2">
                <li><Link href="/register-interviewer" className="text-gray-400 hover:text-white">Become an Interviewer</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@interviewace.lk</li>
                <li>+94 77 123 4567</li>
                <li>Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <div>© 2026 InterviewAce. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}