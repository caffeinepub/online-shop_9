import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    if (!email.includes("@")) {
      setError("Некорректный email");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    const result = register(email.trim(), password, contact.trim());
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Ошибка регистрации");
      return;
    }

    toast.success("Аккаунт создан! Добро пожаловать!");
    navigate({ to: "/" });
  }

  return (
    <main
      className="flex-1 flex items-center justify-center py-16 px-4"
      data-ocid="register.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
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
            Регистрация
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Создайте свой аккаунт за несколько секунд
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-ocid="register.form"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email (придумайте или используйте свой)
              </Label>
              <Input
                id="reg-email"
                type="text"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                data-ocid="register.email.input"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-password"
                className="flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Пароль (минимум 6 символов)
              </Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Придумайте пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  data-ocid="register.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  data-ocid="register.toggle_password.button"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-confirm"
                className="flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Подтвердите пароль
              </Label>
              <div className="relative">
                <Input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  data-ocid="register.confirm_password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  data-ocid="register.toggle_confirm.button"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Contact — WhatsApp or Telegram */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-contact"
                className="flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp или Telegram (необязательно)
              </Label>
              <Input
                id="reg-contact"
                type="text"
                placeholder="+992 17 391 8530 или @username"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                data-ocid="register.contact.input"
              />
              <p className="text-xs text-muted-foreground">
                Укажите номер телефона (WhatsApp) или @username (Telegram) для
                связи при проблемах
              </p>
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
                data-ocid="register.error_state"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-base"
              disabled={loading}
              data-ocid="register.submit_button"
            >
              {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              className="font-semibold underline underline-offset-4 hover:text-foreground transition-colors"
              style={{ color: "oklch(var(--primary))" }}
              data-ocid="register.login.link"
            >
              Войти
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
