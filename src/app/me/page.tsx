
"use client";

import { useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    CreditCard,
    Crown,
    ShieldCheck,
    Sparkles,
    Zap,
} from "lucide-react";

type PlanId = "FREE" | "PRO" | "PREMIUM";
type Billing = "monthly" | "yearly";
type PaymentMethod = "card" | "upi";

const plans = [
    {
        id: "FREE" as const,
        name: "Free",
        description: "Start your job search journey.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        icon: Sparkles,
        features: [
            "Basic job search and applications",
            "AI Assistant — 10 uses/month",
            "Resume Analysis — 3/month",
            "Skill Gap Analysis — 3/month",
            "Career Guidance — 1/month",
        ],
    },
    {
        id: "PRO" as const,
        name: "Pro",
        description: "For serious job seekers.",
        monthlyPrice: 499,
        yearlyPrice: 4990,
        icon: Zap,
        popular: true,
        features: [
            "Everything in Free",
            "Advanced resume analysis",
            "AI-powered job matching",
            "Skill gap analysis",
            "Higher AI usage limits",
        ],
    },
    {
        id: "PREMIUM" as const,
        name: "Premium",
        description: "Your complete AI career toolkit.",
        monthlyPrice: 999,
        yearlyPrice: 9990,
        icon: Crown,
        features: [
            "Everything in Pro",
            "Higher AI usage limits",
            "AI career guidance",
            "Advanced resume-job matching",
            "Priority access to career tools",
        ],
    },
];

type Plan = (typeof plans)[number];

export default function PricingPage() {
    const [billing, setBilling] = useState<Billing>("monthly");
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [currentPlan, setCurrentPlan] = useState<PlanId>("FREE");
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("card");
    const [screen, setScreen] = useState<
        "pricing" | "checkout" | "success"
    >("pricing");

    const priceOf = (plan: Plan) =>
        billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price);

    function choosePlan(plan: Plan) {
        if (plan.id === currentPlan) return;

        if (plan.id === "FREE") {
            setSelectedPlan(plan);
            setScreen("success");
            return;
        }

        setSelectedPlan(plan);
        setPaymentMethod("card");
        setScreen("checkout");
    }

    function simulatePayment() {
        if (!selectedPlan) return;

        // DEMO ONLY:
        // This changes local React state. It does not charge money,
        // create a backend subscription, or verify a payment.
        setCurrentPlan(selectedPlan.id);
        setScreen("success");
    }

    function backToPricing() {
        setSelectedPlan(null);
        setScreen("pricing");
    }

    const isSuccess = screen === "success";
    const isCheckout = screen === "checkout";

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-10 flex items-center justify-between">
                    <a href="/dashboard" className="flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                            <Sparkles size={21} />
                        </span>
                        <span className="text-xl font-bold tracking-tight">
                            QuireHire
                        </span>
                    </a>

                    <a
                        href="/dashboard"
                        className="text-sm font-medium text-slate-600 hover:text-violet-700"
                    >
                        Back to dashboard
                    </a>
                </header>

                {screen === "pricing" && (
                    <>
                        <section className="mx-auto mb-10 max-w-2xl text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                                <Sparkles size={16} />
                                Simple, transparent pricing
                            </span>

                            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                                Invest in your next opportunity.
                            </h1>

                            <p className="mt-4 text-base leading-7 text-slate-600">
                                Choose the plan that fits your career goals.
                                Start free and upgrade whenever you're ready.
                            </p>

                            <div className="mt-7 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setBilling("monthly")}
                                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${billing === "monthly"
                                            ? "bg-violet-600 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    Monthly
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setBilling("yearly")}
                                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${billing === "yearly"
                                            ? "bg-violet-600 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                >
                                    Yearly
                                    <span className="ml-2 text-xs">
                                        Save ~17%
                                    </span>
                                </button>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
                            {plans.map((plan) => {
                                const Icon = plan.icon;
                                const price = priceOf(plan);
                                const isCurrent = currentPlan === plan.id;

                                return (
                                    <article
                                        key={plan.id}
                                        className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${plan.popular
                                                ? "border-violet-500 ring-1 ring-violet-500"
                                                : "border-slate-200"
                                            }`}
                                    >
                                        {plan.popular && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1 text-xs font-bold text-white">
                                                MOST POPULAR
                                            </span>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                                <Icon size={22} />
                                            </span>

                                            <div>
                                                <h2 className="text-xl font-bold">
                                                    {plan.name}
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {plan.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="my-6">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-extrabold tracking-tight">
                                                    {formatPrice(price)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {price === 0
                                                    ? "Free forever"
                                                    : billing === "monthly"
                                                        ? "per month"
                                                        : "per year"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => choosePlan(plan)}
                                            disabled={isCurrent}
                                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-default ${isCurrent
                                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    : plan.popular
                                                        ? "bg-violet-600 text-white hover:bg-violet-700"
                                                        : "border border-slate-300 text-slate-800 hover:border-violet-400 hover:bg-violet-50"
                                                }`}
                                        >
                                            {isCurrent ? (
                                                <>
                                                    <CheckCircle2 size={17} />
                                                    Current Plan
                                                </>
                                            ) : plan.id === "FREE" ? (
                                                <>
                                                    Get Started Free
                                                    <ArrowRight size={17} />
                                                </>
                                            ) : (
                                                <>
                                                    Upgrade to {plan.name}
                                                    <ArrowRight size={17} />
                                                </>
                                            )}
                                        </button>

                                        <div className="my-6 border-t border-slate-100" />

                                        <p className="mb-4 text-sm font-bold">
                                            What's included
                                        </p>

                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-3 text-sm leading-5 text-slate-600"
                                                >
                                                    <Check
                                                        size={17}
                                                        className="mt-0.5 shrink-0 text-emerald-600"
                                                    />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                );
                            })}
                        </section>

                        <p className="mt-8 text-center text-xs text-slate-500">
                            Demo pricing and feature limits. No real payment is
                            processed by this prototype.
                        </p>
                    </>
                )}

                {isCheckout && selectedPlan && (
                    <section className="mx-auto max-w-4xl">
                        <button
                            type="button"
                            onClick={backToPricing}
                            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-700"
                        >
                            <ArrowLeft size={17} />
                            Back to plans
                        </button>

                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold">
                                Complete your subscription
                            </h1>
                            <p className="mt-2 text-slate-600">
                                Review your plan and select a demo payment method.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                            <div className="space-y-5 md:col-span-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                    <h2 className="text-lg font-bold">
                                        Payment method
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Select how you would like to simulate payment.
                                    </p>

                                    <div className="mt-5 space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("card")}
                                            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${paymentMethod === "card"
                                                    ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                                                    : "border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <CreditCard size={22} />
                                            <span className="flex-1">
                                                <span className="block font-semibold">
                                                    Credit / Debit Card
                                                </span>
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    Demo card payment
                                                </span>
                                            </span>
                                            <span className="text-xs font-semibold text-violet-700">
                                                {paymentMethod === "card" ? "Selected" : "Select"}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("upi")}
                                            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${paymentMethod === "upi"
                                                    ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                                                    : "border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-violet-700">
                                                UPI
                                            </span>
                                            <span className="flex-1">
                                                <span className="block font-semibold">UPI</span>
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    Demo UPI payment
                                                </span>
                                            </span>
                                            <span className="text-xs font-semibold text-violet-700">
                                                {paymentMethod === "upi" ? "Selected" : "Select"}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                        <strong>Demo checkout:</strong> no card number,
                                        UPI ID or banking details are needed. Clicking
                                        the button below only simulates a successful payment.
                                    </div>
                                </div>
                            </div>

                            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">
                                <h2 className="text-lg font-bold">Order summary</h2>

                                <div className="mt-5 flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                        <selectedPlan.icon size={22} />
                                    </span>
                                    <div>
                                        <p className="font-bold">{selectedPlan.name} Plan</p>
                                        <p className="text-sm text-slate-500">
                                            {billing === "monthly" ? "Monthly billing" : "Yearly billing"}
                                        </p>
                                    </div>
                                </div>

                                <div className="my-5 border-t border-slate-100" />

                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Plan price</span>
                                    <span>{formatPrice(priceOf(selectedPlan))}</span>
                                </div>

                                <div className="mt-3 flex justify-between text-sm text-slate-600">
                                    <span>Tax</span>
                                    <span>Calculated at checkout</span>
                                </div>

                                <div className="my-5 border-t border-slate-100" />

                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-bold">Demo total</span>
                                    <span className="text-2xl font-extrabold">
                                        {formatPrice(priceOf(selectedPlan))}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={simulatePayment}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                                >
                                    Simulate Successful Payment
                                    <ArrowRight size={17} />
                                </button>

                                <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
                                    <ShieldCheck size={15} />
                                    Demo only · No money charged
                                </p>
                            </aside>
                        </div>
                    </section>
                )}

                {isSuccess && (
                    <section className="mx-auto max-w-xl py-10 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={42} />
                        </div>

                        <h1 className="mt-6 text-3xl font-extrabold">
                            {selectedPlan?.id === "FREE"
                                ? "You're ready to get started!"
                                : "Demo payment successful!"}
                        </h1>

                        <p className="mt-3 leading-7 text-slate-600">
                            {selectedPlan?.id === "FREE"
                                ? "Your Free plan has been selected in this demo."
                                : `Your ${selectedPlan?.name} plan has been selected for this demo. No real payment was processed and no backend subscription was created.`}
                        </p>

                        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 text-left">
                            <p className="text-sm text-slate-500">Selected plan</p>
                            <div className="mt-2 flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {selectedPlan?.name ?? "Free"} Plan
                                </h2>
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Demo success
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                                {selectedPlan
                                    ? `${formatPrice(priceOf(selectedPlan))} / ${selectedPlan.id === "FREE"
                                        ? "forever"
                                        : billing === "monthly"
                                            ? "month"
                                            : "year"
                                    }`
                                    : "Free forever"}
                            </p>
                        </div>

                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={backToPricing}
                                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-white"
                            >
                                Back to pricing
                            </button>

                            <a
                                href="/dashboard"
                                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                            >
                                Go to dashboard
                            </a>
                        </div>
                    </section>
                )}

                <footer className="mt-14 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} QuireHire · Demo subscription experience
                </footer>
            </div>
        </main>
    );
}
