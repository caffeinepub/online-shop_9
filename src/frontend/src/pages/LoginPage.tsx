import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }

    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Ошибка входа");
      return;
    }

    toast.success("Добро пожаловать!");
    navigate({ to: "/" });
  }

  return (
    <main
      className="flex-1 flex items-center justify-center py-16 px-4"
      data-ocid="login.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(var(--primary) / 0.12)" }}
          >
            <ShoppingBag
              className="w-7 h-7"
              style={{ color: "oklch(var(--primary))" }}
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Вход в аккаунт
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Введите email и пароль для входа
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-ocid="login.form"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </Label>
              <Input
                id="login-email"
                type="text"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                data-ocid="login.email.input"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  data-ocid="login.toggle_password.button"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-sm font-medium rounded-lg px-4 py-3"
                style={{
                  color: "oklch(var(--destructive))",
                  background: "oklch(var(--destructive) / 0.08)",
                  border: "1px solid oklch(var(--destructive) / 0.2)",
                }}
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-base"
              disabled={loading}
              data-ocid="login.submit_button"
            >
              {loading ? "Входим…" : "Войти"}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="font-semibold underline underline-offset-4 hover:text-foreground transition-colors"
              style={{ color: "oklch(var(--primary))" }}
              data-ocid="login.register.link"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
