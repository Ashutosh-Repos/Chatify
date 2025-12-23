"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, Lock, Loader } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import BorderAnimatedContainer from "@/components/ui/BorderAnimatedContainer";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Welcome Back</h2>
                  <p className="text-slate-400">Login to access your account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <Mail className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="johndoe@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <Lock className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="auth-btn" type="submit" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <Loader className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/signup" className="auth-link">
                    Don&apos;t have an account? Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <Image
                  src="/login.png"
                  alt="People using mobile devices"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Connect anytime, anywhere</h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
