'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchJobType, setSearchJobType] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const featuredJobs = [
    {
      id: 1,
      title: 'Node.js Backend Developer',
      company: 'TechCorp',
      location: 'Remote',
      salary: '$80,000 - $120,000',
      jobType: 'Full-time',
      experience: '3-5 years',
      posted: '2 days ago',
      logo: 'TC'
    },
    {
      id: 2,
      title: 'DevOps Engineer',
      company: 'CloudScale',
      location: 'San Francisco, CA',
      salary: '$100,000 - $150,000',
      jobType: 'Full-time',
      experience: '5+ years',
      posted: '1 day ago',
      logo: 'CS'
    },
    {
      id: 3,
      title: 'React.js Developer',
      company: 'WebSolutions',
      location: 'New York, NY',
      salary: '$70,000 - $100,000',
      jobType: 'Full-time',
      experience: '2-4 years',
      posted: '3 days ago',
      logo: 'WS'
    },
    {
      id: 4,
      title: 'Software Engineer',
      company: 'InnovateTech',
      location: 'Austin, TX',
      salary: '$90,000 - $130,000',
      jobType: 'Full-time',
      experience: '3-6 years',
      posted: '1 week ago',
      logo: 'IT'
    },
    {
      id: 5,
      title: 'Full Stack Developer',
      company: 'DigitalEdge',
      location: 'Remote',
      salary: '$85,000 - $115,000',
      jobType: 'Full-time',
      experience: '4-7 years',
      posted: '4 days ago',
      logo: 'DE'
    },
    {
      id: 6,
      title: 'Python Developer',
      company: 'DataDriven',
      location: 'Seattle, WA',
      salary: '$95,000 - $140,000',
      jobType: 'Full-time',
      experience: '3-5 years',
      posted: '5 days ago',
      logo: 'DD'
    }
  ];

  const categories = [
    { name: 'Software Development', jobs: 1250, icon: '💻' },
    { name: 'DevOps & Cloud', jobs: 450, icon: '☁️' },
    { name: 'Data Science', jobs: 380, icon: '📊' },
    { name: 'UI/UX Design', jobs: 290, icon: '🎨' },
    { name: 'Marketing', jobs: 520, icon: '📱' },
    { name: 'Finance', jobs: 340, icon: '💰' },
    { name: 'Human Resources', jobs: 180, icon: '👥' },
    { name: 'Sales', jobs: 420, icon: '🎯' }
  ];

  const companies = [
    { name: 'TechCorp', industry: 'Technology', positions: 25, logo: 'TC' },
    { name: 'CloudScale', industry: 'Cloud Services', positions: 18, logo: 'CS' },
    { name: 'WebSolutions', industry: 'Web Development', positions: 12, logo: 'WS' },
    { name: 'InnovateTech', industry: 'Software', positions: 15, logo: 'IT' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Google',
      content: 'JobPortal helped me land my dream job at Google. The platform made it easy to find and apply to positions that matched my skills.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      company: 'Amazon',
      content: 'The job search features are incredible. I found multiple opportunities within my first week of using the platform.',
      avatar: 'MC'
    },
    {
      name: 'Emily Davis',
      role: 'UX Designer',
      company: 'Apple',
      content: 'Best job portal I have ever used. The interface is clean, and the application process is seamless.',
      avatar: 'ED'
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the Register button and fill in your details. You can sign up as a candidate to find jobs or as a recruiter to hire candidates.'
    },
    {
      question: 'Is JobPortal free to use?',
      answer: 'Yes! JobPortal is completely free for job seekers. Recruiters can post jobs with our flexible pricing plans.'
    },
    {
      question: 'How do I apply for a job?',
      answer: 'Browse through job listings, click on a job that interests you, and use the "Apply" button to submit your application with your resume and cover letter.'
    },
    {
      question: 'Can I track my applications?',
      answer: 'Yes, you can track all your job applications in the "My Applications" section where you can see the status of each application.'
    }
  ];

  const careerTips = [
    {
      title: 'Optimize Your Resume',
      description: 'Tailor your resume to each job application by highlighting relevant skills and experience.',
      icon: '📄'
    },
    {
      title: 'Build Your Network',
      description: 'Connect with professionals in your industry through LinkedIn and networking events.',
      icon: '🤝'
    },
    {
      title: 'Prepare for Interviews',
      description: 'Research the company and practice common interview questions to boost your confidence.',
      icon: '💡'
    },
    {
      title: 'Stay Updated',
      description: 'Keep learning new skills and stay informed about industry trends and job market changes.',
      icon: '📚'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.append('search', searchKeyword);
    if (searchLocation) params.append('location', searchLocation);
    if (searchJobType) params.append('jobType', searchJobType);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                  Find Your Dream Job Today
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed animate-slide-up">
                  Discover thousands of job opportunities from top companies and take the next step in your career.
                </p>

                {/* Search Component */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title / Keyword</label>
                        <input
                          type="text"
                          placeholder="e.g. Node.js Developer"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Remote, New York"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                        <select
                          value={searchJobType}
                          onChange={(e) => setSearchJobType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">All Types</option>
                          <option value="FULL_TIME">Full-time</option>
                          <option value="PART_TIME">Part-time</option>
                          <option value="CONTRACT">Contract</option>
                          <option value="REMOTE">Remote</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Search Jobs
                    </button>
                  </form>
                </div>

                {/* Popular Searches */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-blue-200">Popular:</span>
                  {['Node.js Developer', 'DevOps Engineer', 'Frontend Developer', 'Java Developer'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchKeyword(term)}
                      className="text-sm bg-blue-500/30 hover:bg-blue-500/50 px-3 py-1 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Illustration */}
              <div className="hidden lg:flex justify-center animate-slide-right">
                <div className="relative">
                  <div className="w-96 h-96 bg-blue-500/20 rounded-full absolute -top-10 -right-10 blur-3xl animate-pulse-slow"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-float">
                    <div className="text-6xl mb-4">👨‍💻</div>
                    <div className="text-2xl font-semibold mb-2">Find Your Perfect Job</div>
                    <div className="text-blue-200">Join 25,000+ professionals who found their dream job with us</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Jobs</div>
              </div>
              <div className="text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
                <div className="text-gray-600">Companies</div>
              </div>
              <div className="text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">25K+</div>
                <div className="text-gray-600">Candidates</div>
              </div>
              <div className="text-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">8K+</div>
                <div className="text-gray-600">Successful Hires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Jobs Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
              <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold">
                View All Jobs →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job, index) => (
                <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold mr-3">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.salary}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {job.jobType}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.experience}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{job.posted}</span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.name}
                  href={`/jobs?search=${category.name}`}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-blue-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.jobs} jobs</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Companies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {companies.map((company, index) => (
                <div key={company.name} className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
                    {company.logo}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{company.industry}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{company.positions} open positions</span>
                    <Link
                      href="/jobs"
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View Jobs
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
                <p className="text-gray-600">Sign up and create your professional profile in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Apply for Jobs</h3>
                <p className="text-gray-600">Browse thousands of jobs and apply with one click</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Hired</h3>
                <p className="text-gray-600">Connect with employers and land your dream job</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Companies Section */}
        <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Leading Companies</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Top companies use JobPortal to find their next team members
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Google', color: 'bg-blue-500', initials: 'G' },
                { name: 'Microsoft', color: 'bg-blue-600', initials: 'M' },
                { name: 'Amazon', color: 'bg-orange-500', initials: 'A' },
                { name: 'Apple', color: 'bg-gray-800', initials: 'A' },
                { name: 'Meta', color: 'bg-blue-500', initials: 'M' },
                { name: 'Netflix', color: 'bg-red-600', initials: 'N' },
                { name: 'Tesla', color: 'bg-red-500', initials: 'T' },
                { name: 'Spotify', color: 'bg-green-500', initials: 'S' }
              ].map((company, index) => (
                <div key={company.name} className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col items-center justify-center animate-scale-in cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className={`w-16 h-16 ${company.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg`}>
                    {company.initials}
                  </div>
                  <span className="text-gray-700 font-semibold text-lg">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Hear from professionals who found their dream jobs through JobPortal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.name} className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex mt-4 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Got questions? We have answers.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${expandedFaq === index ? 'max-h-40 pb-5' : 'max-h-0'}`}
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Tips Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Career Tips & Resources</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Expert advice to help you succeed in your job search
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {careerTips.map((tip, index) => (
                <div key={tip.title} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{tip.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Career?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Create your profile and discover your next opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/jobs"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Find Jobs
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Create Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">JobPortal</h3>
                <p className="text-gray-400 mb-4">Your gateway to career success. Find your dream job with us.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Find Jobs</Link></li>
                  <li><Link href="/companies" className="text-gray-400 hover:text-white transition-colors">Companies</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Job Seekers</h4>
                <ul className="space-y-2">
                  <li><Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
                  <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Create Profile</Link></li>
                  <li><Link href="/my-applications" className="text-gray-400 hover:text-white transition-colors">My Applications</Link></li>
                  <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Employers</h4>
                <ul className="space-y-2">
                  <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Post a Job</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link href="/companies" className="text-gray-400 hover:text-white transition-colors">Manage Company</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 JobPortal. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
