"use client";

import { Button, Card, CardBody, Input, Divider } from "@nextui-org/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
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

    const res = await api.post<{ user: { id: string; email: string; name: string; role: string }; token: string }>("/auth/login", { email, password });

    if (res.success && res.data) {
      if (res.data.user.role !== "PROVIDER") {
        setError("This portal is for service providers only");
        setLoading(false);
        return;
      }
      setAuth(res.data.user, res.data.token);
      router.push("/");
    } else {
      setError(res.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Provider Portal
            </h1>
            <p className="text-slate-500 mt-2">Sign in to manage your listings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="w-5 h-5 text-slate-400" />}
              isRequired
            />

            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
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

            <Button type="submit" color="success" fullWidth size="lg" isLoading={loading} className="font-semibold">
              Sign In
            </Button>
          </form>

          <Divider className="my-6" />

          <p className="text-center text-slate-500">
            Need a provider account?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
