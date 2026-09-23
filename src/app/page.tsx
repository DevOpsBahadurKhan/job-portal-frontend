'use client';

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HomeSearchPanel from "@/components/home/HomeSearchPanel";
import JobCard from "@/components/home/JobCard";
import { HomeIcon, SocialIcon } from "@/components/home/home-icons";
import {
  careerTips,
  categories,
  companies,
  faqs,
  featuredJobs,
  processSteps,
  searchTerms,
  stats,
  testimonials,
  trustedCompanies,
} from "@/components/home/home-data";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (searchKeyword) params.append("search", searchKeyword);
    if (searchLocation) params.append("location", searchLocation);
    if (searchJobType) params.append("jobType", searchJobType);

    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main>
        <section className="relative overflow-visible bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8">
            <div className="animate-fade-up mx-auto max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
                <span className="h-2 w-2 rounded-full bg-blue-200" />
                25,000+ professionals found their next opportunity
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Find Your Dream Job Today
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
                Discover thousands of job opportunities from top companies and take the next step in your career.
              </p>
            </div>

            <div className="animate-soft-float pointer-events-none absolute bottom-7 right-[12%] hidden rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-left text-sm text-blue-100 backdrop-blur-sm lg:block">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-xl">
                  👨‍💻
                </span>
                <span>
                  <strong className="block text-white">Find Your Perfect Job</strong>
                  <span>Search smarter today</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <HomeSearchPanel
          keyword={searchKeyword}
          location={searchLocation}
          jobType={searchJobType}
          popularTerms={searchTerms}
          onKeywordChange={setSearchKeyword}
          onLocationChange={setSearchLocation}
          onJobTypeChange={setSearchJobType}
          onPopularTermClick={setSearchKeyword}
          onSubmit={handleSearch}
        />

        <section className="bg-white py-12 sm:py-14" aria-label="Job portal statistics">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="jobs" className="scroll-mt-16 bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Curated for you</p>
                <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
              </div>
              <Link href="/jobs" className="font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                View All Jobs →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <JobCard job={featuredJobs[0]} featured />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featuredJobs.slice(1).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Popular Categories</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/jobs?search=${encodeURIComponent(category.name)}`}
                  className="group rounded-xl bg-gray-50 p-6 transition hover:-translate-y-1 hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div className="mb-3 text-3xl transition-transform group-hover:scale-110">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{category.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{category.jobs} jobs</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="companies" className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Top Companies</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {companies.map((company) => (
                <article key={company.name} className="rounded-xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-600">{company.logo}</div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="mb-3 text-sm text-gray-600">{company.industry}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">{company.positions} open positions</span>
                    <Link href="/jobs" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">View Jobs</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {processSteps.map((step) => (
                <article key={step.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <HomeIcon name={step.icon} className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Trusted by Leading Companies</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">Top companies use JobPortal to find their next team members</p>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {trustedCompanies.map((company) => (
                <div key={company.name} className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                  <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl ${company.color} text-2xl font-bold text-white shadow-lg`}>{company.initials}</div>
                  <span className="text-lg font-semibold text-gray-700">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">What Our Users Say</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">Hear from professionals who found their dream jobs through JobPortal</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.name} className="rounded-2xl bg-gray-50 p-8 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">{testimonial.avatar}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="leading-relaxed text-gray-700">&quot;{testimonial.content}&quot;</p>
                  <div className="mt-4 tracking-[0.15em] text-yellow-400" aria-label="5 out of 5 stars">★★★★★</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">Got questions? We have answers.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                const answerId = `faq-answer-${index}`;

                return (
                  <div key={faq.question} className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={answerId}
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    >
                      <h3 className="pr-4 text-lg font-semibold text-gray-900">{faq.question}</h3>
                      <HomeIcon name="chevron" className={`h-5 w-5 shrink-0 text-blue-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      id={answerId}
                      aria-hidden={!isExpanded}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="px-6 pb-5 leading-relaxed text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Career Tips &amp; Resources</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">Expert advice to help you succeed in your job search</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {careerTips.map((tip) => (
                <article key={tip.title} className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 text-4xl">{tip.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{tip.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{tip.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-center text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Start Your Career?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">Create your profile and discover your next opportunity.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/jobs" className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700">Find Jobs</Link>
              {!isAuthenticated && (
                <Link href="/register" className="rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700">Create Profile</Link>
              )}
            </div>
          </div>
        </section>

        <footer id="footer" className="bg-gray-900 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <h3 className="mb-4 text-2xl font-bold">JobPortal</h3>
                <p className="mb-4 text-gray-400">Your gateway to career success. Find your dream job with us.</p>
                <div className="flex space-x-4">
                  <a aria-label="Twitter" className="text-gray-400 transition hover:text-white" href="#footer"><SocialIcon name="twitter" className="h-6 w-6" /></a>
                  <a aria-label="Instagram" className="text-gray-400 transition hover:text-white" href="#footer"><SocialIcon name="instagram" className="h-6 w-6" /></a>
                  <a aria-label="LinkedIn" className="text-gray-400 transition hover:text-white" href="#footer"><SocialIcon name="linkedin" className="h-6 w-6" /></a>
                </div>
              </div>
              <FooterLinkGroup title="Quick Links" links={[['Home', '/'], ['Find Jobs', '/jobs'], ['Companies', '/companies'], ['About', '/about'], ['Contact', '/contact']]} />
              <FooterLinkGroup title="Job Seekers" links={[['Browse Jobs', '/jobs'], ['Create Profile', '/register'], ['My Applications', '/my-applications'], ['Profile', '/profile']]} />
              <FooterLinkGroup title="Employers" links={[['Post a Job', '/register'], ['Dashboard', '/dashboard'], ['Manage Company', '/companies'], ['Support', '/contact']]} />
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

function FooterLinkGroup({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h4 className="mb-4 font-semibold">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
