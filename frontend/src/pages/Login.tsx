import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface JwtPayload {
  role: string;
  user_id: string;
  exp: number;
}

export default function Login() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login/", data);
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Decode token to get user role
      const decoded = jwtDecode<JwtPayload>(access);
      
      if (decoded.role === "SUPER_ADMIN" || decoded.role === "ADMIN") {
        navigate("/admin");
      } else if (decoded.role === "AGENCY") {
        navigate("/agency");
      } else {
        setError("Unauthorized role.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-map-pattern bg-background">
      <div className="absolute inset-0 bg-background/90 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Al-Rabb Tours" className="w-16 h-16 object-contain mb-4 drop-shadow-sm" />
          <h1 className="text-2xl font-bold bg-gradient-sunrise bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your enterprise account</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg mb-6 border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              {...register("email")}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="admin@alrabb.com"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              {...register("password")}
              className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-md"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
