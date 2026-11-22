"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  GitBranch,
  Layers3,
  Lightbulb,
  LoaderCircle,
  Map,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wifi,
  Workflow,
  Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Header from "@/components/Header";
type WorkStyle = "REMOTE" | "HYBRID" | "ONSITE" | "ANY";
type CareerGuidanceResponse = {
  assessment: {
    careerGoal: string;
    interests: string[];
    preferredWorkStyle: string;
  };
  recommendations: {
    careerPath: string;
    currentLevel: string;
    targetRole: string;
    profileMismatch: {
      detected: boolean;
      details: string[];
    };
    summary: string;
    skillGaps: {
      skill: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      reason: string;
      learningAction: string;
    }[];
    roadmap: {
      phase: string;
      duration: string;
      focus: string;
      tasks: string[];
      completionCriteria: string[];
    }[];
    recommendedProjects: {
      title: string;
      description: string;
      skillsPracticed: string[];
    }[];
    nextActions: string[];
  };
};
const interestOptions = [
  { label: "Node.js", icon: Code2 },
  { label: "System Design", icon: Workflow },
  { label: "AI Integration", icon: Sparkles },
  { label: "Cloud Computing", icon: Cloud },
  { label: "DevOps", icon: GitBranch },
  { label: "Database Optimization", icon: Database },
  { label: "Cybersecurity", icon: ShieldCheck },
  { label: "Frontend Development", icon: Layers3 },
  { label: "Data Structures & Algorithms", icon: Cpu },
  { label: "Leadership", icon: Award },
];
const workStyles: {
  value: WorkStyle;
  label: string;
  description: string;
  icon: typeof Wifi;
}[] = [
    {
      value: "REMOTE",
      label: "Remote",
      description: "Work from anywhere",
      icon: Wifi,
    },
    {
      value: "HYBRID",
      label: "Hybrid",
      description: "Office + remote",
      icon: Workflow,
    },
    {
      value: "ONSITE",
      label: "Onsite",
      description: "Office-based work",
      icon: BriefcaseBusiness,
    },
    {
      value: "ANY",
      label: "Flexible",
      description: "Open to all styles",
      icon: Compass,
    },
  ];
const priorityStyles = {
  HIGH: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  MEDIUM: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  LOW: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};
function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
function SectionTitle({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: typeof Target;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-violet-600">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action || (Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <Icon size={19} />
        </span>
      ))}
    </div>
  );
}
function BulletList({
  items,
  tone = "violet",
}: {
  items: string[];
  tone?: "violet" | "emerald";
}) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
        >
          <span
            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${tone === "emerald"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-violet-100 text-violet-700"
              } `}
          >
            <Check size={10} strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
function EmptyState() {
  const features = [
    {
      number: "01",
      title: "Career direction",
      description: "Understand your next role",
      icon: Target,
    },
    {
      number: "02",
      title: "Skill priorities",
      description: "Discover what to improve",
      icon: TrendingUp,
    },
    {
      number: "03",
      title: "Learning roadmap",
      description: "Turn goals into milestones",
      icon: Map,
    },
  ];
  return (
    <div className="relative flex min-h-[450px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
          <Sparkles size={26} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
          Your personal career companion
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
          Your ambition deserves a{" "}
          <span className="text-violet-600">clear plan.</span>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
          Get personalized career direction, identify your most important skill
          gaps, and discover practical projects to help you move forward.
        </p>
      </div>
      <div className="relative mt-10 grid gap-3 sm:grid-cols-3">
        {features.map(({ number, title, description, icon: Icon }) => (
          <div
            key={number}
            className="rounded-xl border border-slate-200 bg-white/90 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-600">
                {number}
              </span>
              <Icon size={17} className="text-slate-400" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
      <p className="relative mt-5 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} />
        Your profile helps personalize your recommendations.
      </p>
    </div>
  );
}
export default function CareerGuidancePage() {
  const router = useRouter();
  const [careerGoal, setCareerGoal] = useState(
    "Become a senior backend developer"
  );
  const [interests, setInterests] = useState<string[]>([
    "Node.js",
    "System Design",
    "AI Integration",
  ]);
  const [preferredWorkStyle, setPreferredWorkStyle] =
    useState<WorkStyle>("REMOTE");
  const [result, setResult] =
    useState<CareerGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function toggleInterest(interest: string) {
    setError("");
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }
      if (current.length >= 10) {
        setError("You can select a maximum of 10 interests.");
        return current;
      }
      return [...current, interest];
    });
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!careerGoal.trim()) {
      setError("Please enter your career goal.");
      return;
    }
    if (interests.length === 0) {
      setError("Please select at least one area of interest.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.generateCareerGuidance({
        careerGoal: careerGoal.trim(),
        interests,
        preferredWorkStyle,
      });
      if (!response.success || !response.data) {
        throw new Error(
          response.error ||
          response.message ||
          "Unable to generate career guidance."
        );
      }
      setResult(response.data as CareerGuidanceResponse);
      window.setTimeout(() => {
        document.getElementById("career-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }
  const recommendations = result?.recommendations;
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
         
        {/* HEADER */}
         <Header />

        {/* Assessment and results */}
        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Assessment form */}
          <aside className="min-w-0 lg:sticky lg:top-5">
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-violet-700">
                    Your assessment
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    3 steps
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-900">
                  Define your direction
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tell us what you want to achieve.
                </p>
                <div className="mt-5 flex items-center">
                  {[1, 2, 3].map((step, index) => (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                        {step}
                      </span>
                      {index < 2 && (
                        <span className="mx-1.5 h-px flex-1 bg-violet-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 p-5 sm:p-6">
                {/* Goal */}
                <div>
                  <label
                    htmlFor="careerGoal"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    1. Career goal
                  </label>
                  <p className="mb-3 text-xs leading-5 text-slate-500">
                    What role do you want to achieve?
                  </p>
                  <textarea
                    id="careerGoal"
                    value={careerGoal}
                    onChange={(event) => setCareerGoal(event.target.value)}
                    placeholder="e.g. Become a senior backend developer"
                    rows={3}
                    maxLength={300}
                    required
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                  />
                  <p className="mt-1.5 text-right text-[11px] text-slate-400">
                    {careerGoal.length}/300 characters
                  </p>
                </div>
                {/* Interests */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-bold text-slate-800">
                      2. Areas of interest
                    </label>
                    <span className="shrink-0 text-[11px] font-semibold text-violet-700">
                      {interests.length}/10
                    </span>
                  </div>
                  <p className="mb-3 mt-1.5 text-xs leading-5 text-slate-500">
                    Select skills you want to develop.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(({ label, icon: Icon }) => {
                      const selected = interests.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleInterest(label)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${selected
                            ? "border-violet-400 bg-violet-50 text-violet-800 ring-1 ring-violet-100"
                            : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/50"
                            } `}
                        >
                          {selected ? (
                            <Check size={12} strokeWidth={2.5} />
                          ) : (
                            <Icon size={12} />
                          )}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Work style */}
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-800">
                    3. Work preference
                  </label>
                  <p className="mb-3 mt-1.5 text-xs leading-5 text-slate-500">
                    Select your preferred work style.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {workStyles.map(({ value, label, description, icon: Icon }) => {
                      const selected = preferredWorkStyle === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setPreferredWorkStyle(value)}
                          className={`rounded-xl border p-3 text-left transition ${selected
                            ? "border-violet-500 bg-violet-50 ring-1 ring-violet-200"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            } `}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <Icon
                              size={19}
                              className={
                                selected ? "text-violet-700" : "text-slate-500"
                              }
                            />
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-slate-300 bg-white"
                                } `}
                            >
                              {selected && <Check size={10} strokeWidth={3} />}
                            </span>
                          </span>
                          <span className="mt-3 block text-sm font-bold text-slate-800">
                            {label}
                          </span>
                          <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                            {description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-700"
                  >
                    <CircleAlert size={17} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-200/60 transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Generating your roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate my roadmap
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] leading-5 text-slate-400">
                  Your profile helps personalize recommendations.
                </p>
              </div>
            </form>
          </aside>
          {/* Main results */}
          <div
            id="career-results"
            className="min-w-0 scroll-mt-5 space-y-5"
          >
            {!result && !loading && <EmptyState />}
            {loading && (
              <Panel className="min-h-[450px]">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <LoaderCircle size={26} className="animate-spin" />
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Building your career roadmap
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Analyzing your profile, interests, and career goal...
                    </p>
                  </div>
                </div>
                <div className="mt-8 space-y-5" aria-hidden="true">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="animate-pulse space-y-3">
                      <div className="h-4 w-1/3 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-4/5 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            {recommendations && (
              <>
                {/* Career path */}
                <Panel className="overflow-hidden">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-violet-600">
                        Recommended career path
                      </p>
                      <h2 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {recommendations.careerPath}
                      </h2>
                    </div>
                    <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={14} />
                      Plan generated
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {recommendations.summary}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Target size={15} />
                        <p className="text-xs font-medium">Current level</p>
                      </div>
                      <p className="mt-2 break-words text-sm font-bold leading-6 text-slate-900">
                        {recommendations.currentLevel}
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4">
                      <div className="flex items-center gap-2 text-violet-700">
                        <TrendingUp size={15} />
                        <p className="text-xs font-medium">Target role</p>
                      </div>
                      <p className="mt-2 break-words text-sm font-bold leading-6 text-violet-950">
                        {recommendations.targetRole}
                      </p>
                    </div>
                  </div>
                  {result && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {result.assessment.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                        >
                          {interest}
                        </span>
                      ))}
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                        {result.assessment.preferredWorkStyle}
                      </span>
                    </div>
                  )}
                </Panel>
                {/* Profile alignment */}
                {recommendations.profileMismatch.detected && (
                  <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                        <CircleAlert size={21} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-amber-950">
                          Profile alignment needs attention
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-amber-900/80">
                          Review these differences to keep your profile aligned
                          with your career direction.
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-3 border-t border-amber-200/80 pt-4">
                      {recommendations.profileMismatch.details.map(
                        (detail, index) => (
                          <li
                            key={`${index}-${detail}`}
                            className="flex items-start gap-3 text-sm leading-6 text-amber-950"
                          >
                            <ArrowUpRight
                              size={15}
                              className="mt-1 shrink-0 text-amber-700"
                            />
                            <span>{detail}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}
                {/* Skill gaps */}
                <Panel>
                  <SectionTitle
                    eyebrow="Focus areas"
                    title="Skills to strengthen"
                    description="Prioritize these areas to move closer to your target role."
                    icon={TrendingUp}
                    action={
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                        {recommendations.skillGaps.length} skills
                      </span>
                    }
                  />
                  {recommendations.skillGaps.length > 0 ? (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                      {recommendations.skillGaps.map((gap, index) => {
                        const style =
                          priorityStyles[gap.priority] || priorityStyles.MEDIUM;
                        return (
                          <article
                            key={`${gap.skill}-${index}`}
                            className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                                <Zap size={16} />
                              </span>
                              <span
                                className={`rounded-md border px-2 py-1 text-[10px] font-bold ${style.badge}`}
                              >
                                {gap.priority}
                              </span>
                            </div>
                            <h3 className="mt-3 font-bold leading-5 text-slate-900">
                              {gap.skill}
                            </h3>
                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                              {gap.reason}
                            </p>
                            <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50/70 p-3">
                              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                                <Lightbulb size={12} />
                                Suggested action
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-700">
                                {gap.learningAction}
                              </p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">
                      No skill gaps were returned for this assessment.
                    </p>
                  )}
                </Panel>
                {/* Roadmap */}
                <Panel>
                  <SectionTitle
                    eyebrow="Your learning journey"
                    title="Roadmap to your goal"
                    description="Follow the phases in order and use the completion criteria to assess your progress."
                    icon={Map}
                  />
                  <div className="mt-7 space-y-5">
                    {recommendations.roadmap.map((phase, index) => (
                      <article
                        key={`${phase.phase}-${index}`}
                        className="relative rounded-xl border border-slate-200 p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold text-white shadow-sm shadow-violet-200">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                              <div className="min-w-0">
                                <h3 className="font-bold leading-6 text-slate-900">
                                  {phase.phase}
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {phase.focus}
                                </p>
                              </div>
                              <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-700">
                                <Clock3 size={13} />
                                {phase.duration}
                              </span>
                            </div>
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                              <div className="rounded-xl bg-slate-50/80 p-4">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                                  <BookOpen size={14} />
                                  Key tasks
                                </h4>
                                <BulletList items={phase.tasks} />
                              </div>
                              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                                  <CheckCircle2 size={14} />
                                  Completion criteria
                                </h4>
                                <BulletList
                                  items={phase.completionCriteria}
                                  tone="emerald"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </Panel>
                {/* Recommended projects */}
                <Panel>
                  <SectionTitle
                    eyebrow="Learn by building"
                    title="Recommended projects"
                    description="Build practical projects that demonstrate your skills to future employers."
                    icon={BriefcaseBusiness}
                  />
                  {recommendations.recommendedProjects.length > 0 ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {recommendations.recommendedProjects.map(
                        (project, index) => (
                          <article
                            key={`${project.title}-${index}`}
                            className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-5"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700">
                              {index % 3 === 0 ? (
                                <Code2 size={19} />
                              ) : index % 3 === 1 ? (
                                <Workflow size={19} />
                              ) : (
                                <Rocket size={19} />
                              )}
                            </div>
                            <h3 className="mt-4 font-bold leading-6 text-slate-900">
                              {project.title}
                            </h3>
                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                              {project.description}
                            </p>
                            <div className="mt-4 border-t border-slate-100 pt-4">
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Skills practiced
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {project.skillsPracticed.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">
                      No projects were returned for this assessment.
                    </p>
                  )}
                </Panel>
                {/* Next actions */}
                <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-5 text-white shadow-md sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-violet-300">
                        Turn plans into progress
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight">
                        Your next actions
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Start with these steps to move toward your career goal.
                      </p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-200">
                      <Rocket size={21} />
                    </span>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {recommendations.nextActions.map((action, index) => (
                      <div
                        key={`${index}-${action}`}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-200">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm leading-6 text-slate-200">
                          {action}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-400">
                      Your plan can be refined whenever your career goals change.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setError("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        window.setTimeout(() => {
                          document.getElementById("careerGoal")?.focus();
                        }, 350);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-violet-100"
                    >
                      <RefreshCw size={15} />
                      Refine assessment
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
        <footer className="mt-8 border-t border-slate-200 pt-5">
          <p className="text-center text-xs leading-5 text-slate-400">
            AI recommendations are guidance, not guarantees. Review your goals
            and verify important career decisions.
          </p>
        </footer>
      </div>
    </main>
  );
}
