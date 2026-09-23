import type { HomeIconName } from "./home-icons";

export type JobType = "" | "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  experience: string;
  posted: string;
  logo: string;
}

export interface Category {
  name: string;
  jobs: number;
  icon: string;
}

export interface Company {
  name: string;
  industry: string;
  positions: number;
  logo: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Resource {
  title: string;
  description: string;
  icon: string;
}

export interface TrustedCompany {
  name: string;
  color: string;
  initials: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  icon: HomeIconName;
}

export const searchTerms = [
  "Node.js Developer",
  "DevOps Engineer",
  "Frontend Developer",
  "Java Developer",
] as const;

export const jobTypeOptions: Array<{ value: JobType; label: string }> = [
  { value: "", label: "All Types" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "REMOTE", label: "Remote" },
];

export const stats: Stat[] = [
  { value: "10K+", label: "Jobs" },
  { value: "5K+", label: "Companies" },
  { value: "25K+", label: "Candidates" },
  { value: "8K+", label: "Successful Hires" },
];

export const featuredJobs: Job[] = [
  {
    id: 1,
    title: "Node.js Backend Developer",
    company: "TechCorp",
    location: "Remote",
    salary: "$80,000 - $120,000",
    jobType: "Full-time",
    experience: "3-5 years",
    posted: "2 days ago",
    logo: "TC",
  },
  {
    id: 2,
    title: "DevOps Engineer",
    company: "CloudScale",
    location: "San Francisco, CA",
    salary: "$100,000 - $150,000",
    jobType: "Full-time",
    experience: "5+ years",
    posted: "1 day ago",
    logo: "CS",
  },
  {
    id: 3,
    title: "React.js Developer",
    company: "WebSolutions",
    location: "New York, NY",
    salary: "$70,000 - $100,000",
    jobType: "Full-time",
    experience: "2-4 years",
    posted: "3 days ago",
    logo: "WS",
  },
  {
    id: 4,
    title: "Software Engineer",
    company: "InnovateTech",
    location: "Austin, TX",
    salary: "$90,000 - $130,000",
    jobType: "Full-time",
    experience: "3-6 years",
    posted: "1 week ago",
    logo: "IT",
  },
  {
    id: 5,
    title: "Full Stack Developer",
    company: "DigitalEdge",
    location: "Remote",
    salary: "$85,000 - $115,000",
    jobType: "Full-time",
    experience: "4-7 years",
    posted: "4 days ago",
    logo: "DE",
  },
  {
    id: 6,
    title: "Python Developer",
    company: "DataDriven",
    location: "Seattle, WA",
    salary: "$95,000 - $140,000",
    jobType: "Full-time",
    experience: "3-5 years",
    posted: "5 days ago",
    logo: "DD",
  },
];

export const categories: Category[] = [
  { name: "Software Development", jobs: 1250, icon: "💻" },
  { name: "DevOps & Cloud", jobs: 450, icon: "☁️" },
  { name: "Data Science", jobs: 380, icon: "📊" },
  { name: "UI/UX Design", jobs: 290, icon: "🎨" },
  { name: "Marketing", jobs: 520, icon: "📱" },
  { name: "Finance", jobs: 340, icon: "💰" },
  { name: "Human Resources", jobs: 180, icon: "👥" },
  { name: "Sales", jobs: 420, icon: "🎯" },
];

export const companies: Company[] = [
  { name: "TechCorp", industry: "Technology", positions: 25, logo: "TC" },
  { name: "CloudScale", industry: "Cloud Services", positions: 18, logo: "CS" },
  { name: "WebSolutions", industry: "Web Development", positions: 12, logo: "WS" },
  { name: "InnovateTech", industry: "Software", positions: 15, logo: "IT" },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Create Your Account",
    description: "Sign up and create your professional profile in minutes",
    icon: "user",
  },
  {
    title: "Search & Apply for Jobs",
    description: "Browse thousands of jobs and apply with one click",
    icon: "search",
  },
  {
    title: "Get Hired",
    description: "Connect with employers and land your dream job",
    icon: "check",
  },
];

export const trustedCompanies: TrustedCompany[] = [
  { name: "Google", color: "bg-blue-500", initials: "G" },
  { name: "Microsoft", color: "bg-blue-600", initials: "M" },
  { name: "Amazon", color: "bg-orange-500", initials: "A" },
  { name: "Apple", color: "bg-gray-800", initials: "A" },
  { name: "Meta", color: "bg-blue-500", initials: "M" },
  { name: "Netflix", color: "bg-red-600", initials: "N" },
  { name: "Tesla", color: "bg-red-500", initials: "T" },
  { name: "Spotify", color: "bg-green-500", initials: "S" },
];

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    content:
      "JobPortal helped me land my dream job at Google. The platform made it easy to find and apply to positions that matched my skills.",
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Product Manager",
    company: "Amazon",
    content:
      "The job search features are incredible. I found multiple opportunities within my first week of using the platform.",
    avatar: "MC",
  },
  {
    name: "Emily Davis",
    role: "UX Designer",
    company: "Apple",
    content:
      "Best job portal I have ever used. The interface is clean, and the application process is seamless.",
    avatar: "ED",
  },
];

export const faqs: FAQ[] = [
  {
    question: "How do I create an account?",
    answer:
      "Click on the Register button and fill in your details. You can sign up as a candidate to find jobs or as a recruiter to hire candidates.",
  },
  {
    question: "Is JobPortal free to use?",
    answer:
      "Yes! JobPortal is completely free for job seekers. Recruiters can post jobs with our flexible pricing plans.",
  },
  {
    question: "How do I apply for a job?",
    answer:
      'Browse through job listings, click on a job that interests you, and use the "Apply" button to submit your application with your resume and cover letter.',
  },
  {
    question: "Can I track my applications?",
    answer:
      'Yes, you can track all your job applications in the "My Applications" section where you can see the status of each application.',
  },
];

export const careerTips: Resource[] = [
  {
    title: "Optimize Your Resume",
    description:
      "Tailor your resume to each job application by highlighting relevant skills and experience.",
    icon: "📄",
  },
  {
    title: "Build Your Network",
    description:
      "Connect with professionals in your industry through LinkedIn and networking events.",
    icon: "🤝",
  },
  {
    title: "Prepare for Interviews",
    description:
      "Research the company and practice common interview questions to boost your confidence.",
    icon: "💡",
  },
  {
    title: "Stay Updated",
    description:
      "Keep learning new skills and stay informed about industry trends and job market changes.",
    icon: "📚",
  },
];
