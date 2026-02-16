"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { trackEvent } from "@/lib/analytics";

const signupSchema = yup.object({
    name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type SignupFormValues = yup.InferType<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const signup = useAuthStore((s) => s.signUp);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: yupResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormValues) => {
        setLoading(true);
        setError(null);

        try {
            const { error: signupError } = await signup({
                email: data.email,
                password: data.password,
                name: data.name,
            });

            if (signupError) {
                setError(signupError.message);
            } else {
                trackEvent({ name: 'user_signup', properties: { method: 'email' } });
                router.push("/dashboard");
            }
        } catch {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white p-6 font-sans">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create Account</h1>
                    <p className="text-gray-500 font-medium">Join the future of project management.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                        <input
                            {...register("name")}
                            type="text"
                            placeholder="Enter Your Name"
                            className={`w-full px-5 py-3.5 rounded-xl bg-gray-50 border transition-all outline-none font-medium text-gray-900 ${errors.name ? "border-red-400 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                                }`}
                        />
                        {errors.name && <p className="text-red-500 text-xs font-bold px-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="Enter your Email"
                            className={`w-full px-5 py-3.5 rounded-xl bg-gray-50 border transition-all outline-none font-medium text-gray-900 ${errors.email ? "border-red-400 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                                }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-bold px-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className={`w-full px-5 py-3.5 rounded-xl bg-gray-50 border transition-all outline-none font-medium text-gray-900 ${errors.password ? "border-red-400 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                                }`}
                        />
                        {errors.password && <p className="text-red-500 text-xs font-bold px-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium">
                    <span className="text-gray-400">Already a member?</span>{" "}
                    <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                        Log In Instead
                    </Link>
                </div>
            </div>
        </div>
    );
}
