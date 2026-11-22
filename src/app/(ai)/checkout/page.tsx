
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient as api } from "@/lib/api";
import { toast } from "sonner";

// Razorpay global declaration
declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => {
            open: () => void;
            on: (event: string, callback: (response: unknown) => void) => void;
        };
    }
}

interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    billingInterval: string;
    maxActiveJobs: number;
    maxAiMessages: number;
    maxResumeAnalyses: number;
    maxSkillGapAnalyses: number;
    maxCareerGuidance: number;
}

interface Subscription {
    id: number;
    status: string;
    plan?: Plan;
}

interface ApiBody<T> {
    success?: boolean;
    message?: string;
    data?: T;
}

interface SubscriptionResult {
    subscription?: Subscription;
    requiresPayment?: boolean;
}

interface PaymentOrder {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKeyId: string;
}

interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    theme?: { color: string };
    handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
    modal?: {
        ondismiss?: () => void;
    };
}

// Normalize API responses
function normalizeResponse<T>(response: unknown): T {
    let current = response;

    // Support direct API responses and common request wrappers
    for (let i = 0; i < 2; i++) {
        if (
            current &&
            typeof current === "object" &&
            "data" in current &&
            !("success" in current) &&
            !("subscription" in current) &&
            !("orderId" in current)
        ) {
            current = (current as { data: unknown }).data;
        } else {
            break;
        }
    }

    return current as T;
}

// Format price
function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(price / 100);
}

// Get error message
function getErrorMessage(error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }

    return "Something went wrong. Please try again.";
}

// Get API message
function getApiMessage(response: unknown) {
    const body = normalizeResponse<ApiBody<unknown>>(response);
    return body?.message ?? "";
}

// Main checkout content
function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const planId = Number(searchParams.get("planId"));

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [scriptReady, setScriptReady] = useState(false);

    // Load selected plan
    useEffect(() => {
        let cancelled = false;

        async function loadPlans() {
            if (!Number.isInteger(planId) || planId <= 0) {
                setError("Invalid plan selected. Please choose a plan again.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await api.getPlans();

                const body = normalizeResponse<ApiBody<Plan[]> | Plan[]>(
                    response
                );

                const plans = Array.isArray(body) ? body : body.data ?? [];

                const selectedPlan = plans.find(
                    (item) => item.id === planId
                );

                if (!selectedPlan) {
                    throw new Error("Selected plan was not found.");
                }

                if (!cancelled) {
                    setPlan(selectedPlan);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPlans();

        return () => {
            cancelled = true;
        };
    }, [planId]);

    // Load Razorpay checkout script
    useEffect(() => {
        let disposed = false;

        const src = "https://checkout.razorpay.com/v1/checkout.js";

        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${src}"]`
        );

        const onLoad = () => {
            if (!disposed) {
                setScriptReady(Boolean(window.Razorpay));
            }
        };

        const onError = () => {
            if (!disposed) {
                setError(
                    "Unable to load Razorpay Checkout. Please refresh the page."
                );
            }
        };

        if (window.Razorpay) {
            setScriptReady(true);
            return;
        }

        if (existing) {
            existing.addEventListener("load", onLoad);
            existing.addEventListener("error", onError);
        } else {
            const script = document.createElement("script");

            script.src = src;
            script.async = true;

            script.addEventListener("load", onLoad);
            script.addEventListener("error", onError);

            document.body.appendChild(script);
        }

        return () => {
            disposed = true;

            existing?.removeEventListener("load", onLoad);
            existing?.removeEventListener("error", onError);
        };
    }, []);

    // Handle payment
    const handlePayment = async () => {
        if (!plan || paying) return;

        if (plan.price <= 0) {
            setError("Use the subscription flow to activate the Free plan.");
            return;
        }

        if (!scriptReady || !window.Razorpay) {
            setError(
                "Payment checkout is still loading. Please try again shortly."
            );
            return;
        }

        setPaying(true);
        setError("");

        try {
            // Step 1: Create subscription
            const subscriptionResponse = await api.subscribeToPlan(plan.id);

            const subscriptionBody =
                normalizeResponse<
                    ApiBody<SubscriptionResult> & SubscriptionResult
                >(subscriptionResponse);

            const subscription =
                subscriptionBody.data?.subscription ??
                subscriptionBody.subscription;

            const requiresPayment =
                subscriptionBody.data?.requiresPayment ??
                subscriptionBody.requiresPayment;

            if (!subscription?.id) {
                const message = getApiMessage(subscriptionResponse);

                if (
                    message.toLowerCase().includes("pending subscription")
                ) {
                    throw new Error(
                        "You already have a pending subscription. Complete or cancel that subscription before starting another checkout."
                    );
                }

                throw new Error(
                    message || "Subscription ID was not returned by the server."
                );
            }

            if (requiresPayment === false) {
                toast.success("Your plan is active.");
                router.replace("/dashboard");
                return;
            }

            // Step 2: Create payment order
            const orderResponse = await api.createPaymentOrder(
                subscription.id
            );

            const orderBody = normalizeResponse<
                ApiBody<PaymentOrder> & PaymentOrder
            >(orderResponse);

            const order = orderBody.data ?? orderBody;

            if (!order.orderId || !order.razorpayKeyId) {
                throw new Error(
                    getApiMessage(orderResponse) ||
                    "Payment order details are incomplete."
                );
            }

            // Step 3: Open Razorpay Checkout
            const checkout = new window.Razorpay({
                key: order.razorpayKeyId,
                amount: order.amount,
                currency: order.currency,
                name: "QuireHire",
                description: `${plan.name} Plan`,
                order_id: order.orderId,
                theme: { color: "#4F46E5" },

                // Step 4: Verify payment on backend
                handler: async (paymentResponse) => {
                    try {
                        // 1. Verify Razorpay payment on backend
                        await api.verifyPayment({
                            razorpay_order_id:
                                paymentResponse.razorpay_order_id,

                            razorpay_payment_id:
                                paymentResponse.razorpay_payment_id,

                            razorpay_signature:
                                paymentResponse.razorpay_signature,
                        });

                        // 2. Fetch latest subscription from server
                        const subscriptionResponse =
                            await api.getMySubscription();

                        // FIX: Use normalizeResponse instead of undefined getPayload
                        const current = normalizeResponse<{
                            plan: {
                                id: number;
                                name: string;
                            };
                            subscription: {
                                id: number;
                                status: string;
                                currentPeriodStart: string | null;
                                currentPeriodEnd: string | null;
                            } | null;
                        }>(subscriptionResponse);

                        // 3. Confirm subscription is ACTIVE
                        if (current.subscription?.status !== "ACTIVE") {
                            throw new Error(
                                "Payment verification completed, but the subscription is not active yet. Please refresh and check again."
                            );
                        }

                        // 4. Show success and redirect
                        toast.success(
                            `${current.plan.name} plan activated successfully!`
                        );

                        router.replace("/dashboard");
                    } catch (verificationError) {
                        setError(
                            `Payment was submitted, but activation could not be confirmed. ${getErrorMessage(
                                verificationError
                            )} Please check your subscription status before retrying.`
                        );
                    } finally {
                        setPaying(false);
                    }
                },

                modal: {
                    ondismiss: () => setPaying(false),
                },
            });

            checkout.on("payment.failed", () => {
                setPaying(false);
                setError("Payment failed. Please try again.");
            });

            checkout.open();
        } catch (err) {
            setPaying(false);
            setError(getErrorMessage(err));
        }
    };

    // Loading UI
    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl animate-pulse space-y-5">
                    <div className="h-8 w-64 rounded bg-slate-200" />
                    <div className="h-80 rounded-2xl bg-white shadow-sm" />
                </div>
            </main>
        );
    }

    // Checkout UI
    return (
        <main className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => router.push("/pricing")}
                    className="mb-8 text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                    ← Back to pricing
                </button>

                <header className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        QuireHire checkout
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Review your plan
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Confirm your selection before continuing to secure payment.
                    </p>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {error}

                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="ml-2 font-semibold underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {plan && (
                    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Selected plan
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                        {plan.name}
                                    </h2>
                                </div>

                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {plan.billingInterval}
                                </span>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {plan.description}
                            </p>

                            <div className="mt-6">
                                <span className="text-4xl font-bold tracking-tight text-slate-900">
                                    {formatPrice(plan.price, plan.currency)}
                                </span>

                                <span className="ml-2 text-sm text-slate-500">
                                    /{" "}
                                    {plan.billingInterval.toUpperCase() === "YEARLY"
                                        ? "year"
                                        : "month"}
                                </span>
                            </div>

                            <div className="my-7 border-t border-slate-100" />

                            <h3 className="font-semibold text-slate-900">
                                Included with your plan
                            </h3>

                            <ul className="mt-5 space-y-4">
                                {[
                                    `${plan.maxActiveJobs} maximum active jobs`,
                                    `${plan.maxAiMessages} AI Assistant uses`,
                                    `${plan.maxResumeAnalyses} resume analyses`,
                                    `${plan.maxSkillGapAnalyses} skill gap analyses`,
                                    `${plan.maxCareerGuidance} career guidance uses`,
                                ].map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-3 text-sm text-slate-600"
                                    >
                                        <span className="font-bold text-emerald-600">
                                            ✓
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-4 text-xs text-slate-500">
                                AI feature limits follow the quotas configured for this plan.
                            </p>
                        </section>

                        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-lg font-bold text-slate-900">
                                Order summary
                            </h2>

                            <div className="mt-6 flex justify-between gap-4 text-sm">
                                <span className="text-slate-600">
                                    {plan.name} plan
                                </span>

                                <span className="font-medium text-slate-900">
                                    {formatPrice(plan.price, plan.currency)}
                                </span>
                            </div>

                            <div className="mt-4 flex justify-between gap-4 text-sm">
                                <span className="text-slate-600">
                                    Billing interval
                                </span>

                                <span className="font-medium text-slate-900">
                                    {plan.billingInterval}
                                </span>
                            </div>

                            <div className="my-6 border-t border-slate-200" />

                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-slate-900">
                                    Total payable
                                </span>

                                <span className="text-2xl font-bold text-slate-900">
                                    {formatPrice(plan.price, plan.currency)}
                                </span>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                The final amount and currency are confirmed by the backend payment order.
                            </p>

                            <button
                                type="button"
                                onClick={handlePayment}
                                disabled={paying || !plan}
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {paying
                                    ? "Processing..."
                                    : plan.price === 0
                                        ? "Continue with Free"
                                        : "Continue to Payment"}

                                {!paying && (
                                    <span aria-hidden="true">→</span>
                                )}
                            </button>

                            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <span aria-hidden="true">🔒</span>
                                Secure checkout powered by Razorpay
                            </div>

                            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                                Your paid plan becomes active only after the server verifies the payment.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}

// Page wrapper: Required for useSearchParams during production build
export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-slate-50">
                    <p className="text-gray-600">
                        Loading checkout...
                    </p>
                </main>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
