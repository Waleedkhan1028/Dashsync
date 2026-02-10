"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

const signupSchema = yup.object({
    name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

type SignupFormValues = yup.InferType<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
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
            const { error: signupError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.name,
                    },
                },
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -ml-64 -mt-64" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl -mr-64 -mb-64" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] w-full max-w-md relative z-10 border border-gray-100"
            >
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-purple-600 rounded-3xl mb-6 shadow-xl shadow-purple-500/20">
                        <span className="text-3xl text-white">🚀</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Create Account</h1>
                    <p className="text-gray-500 font-semibold tracking-tight">Join the future of project management.</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100 overflow-hidden"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                        <input
                            {...register("name")}
                            type="text"
                            placeholder="Enter Your Name"
                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border transition-all outline-none font-semibold text-gray-900 ${errors.name ? "border-red-400 focus:ring-4 focus:ring-red-100" : "border-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                }`}
                        />
                        {errors.name && <p className="text-red-500 text-xs font-bold px-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="Enter your Email"
                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border transition-all outline-none font-semibold text-gray-900 ${errors.email ? "border-red-400 focus:ring-4 focus:ring-red-100" : "border-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-bold px-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border transition-all outline-none font-semibold text-gray-900 ${errors.password ? "border-red-400 focus:ring-4 focus:ring-red-100" : "border-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                }`}
                        />
                        {errors.password && <p className="text-red-500 text-xs font-bold px-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Create Account <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-bold">
                    <span className="text-gray-400">Already a member?</span>{" "}
                    <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 transition-colors">
                        Log In Instead
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
