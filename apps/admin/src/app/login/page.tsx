"use client";

import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function AdminLoginPage() {
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
      if (res.data.user.role !== "ADMIN") {
        setError("Access denied. Admin credentials required.");
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 mt-2">Restricted access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</div>}

            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="w-5 h-5 text-slate-400" />}
              classNames={{ input: "text-white", inputWrapper: "bg-slate-700 border-slate-600" }}
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
              classNames={{ input: "text-white", inputWrapper: "bg-slate-700 border-slate-600" }}
              isRequired
            />

            <Button type="submit" color="danger" fullWidth size="lg" isLoading={loading} className="font-semibold">
              Sign In as Admin
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
