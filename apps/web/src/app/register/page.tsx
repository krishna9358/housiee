"use client";

import { Button, Card, CardBody, Input, Divider } from "@nextui-org/react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await api.post<{ user: { id: string; email: string; name: string; role: string }; token: string }>("/auth/register", {
      email,
      password,
      name,
      role: "USER",
    });

    if (res.success && res.data) {
      setAuth(res.data.user, res.data.token);
      router.push("/dashboard");
    } else {
      setError(res.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ServiceHub
            </Link>
            <p className="text-slate-500 mt-2">Create an account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              startContent={<User className="w-5 h-5 text-slate-400" />}
              isRequired
            />

            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="w-5 h-5 text-slate-400" />}
              isRequired
            />

            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Create a password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock className="w-5 h-5 text-slate-400" />}
              endContent={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                </button>
              }
              isRequired
            />

            <Button type="submit" color="primary" fullWidth size="lg" isLoading={loading} className="font-semibold">
              Create Account
            </Button>
          </form>

          <Divider className="my-6" />

          <p className="text-center text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
