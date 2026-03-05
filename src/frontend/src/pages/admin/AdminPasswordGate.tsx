import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ADMIN_PASSWORD = "fftr56#^";

interface AdminPasswordGateProps {
  onSuccess: () => void;
}

export function AdminPasswordGate({ onSuccess }: AdminPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true");
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-background px-4 py-16">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.56 0.17 40 / 0.06), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative"
      >
        {/* Logo / Brand mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "oklch(var(--primary))" }}
          >
            <ShieldCheck className="w-7 h-7 text-primary-foreground" />
          </div>
        </motion.div>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border shadow-xl shadow-foreground/5">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-display text-2xl tracking-tight">
                Панель управления
              </CardTitle>
              <CardDescription className="text-sm">
                Введите пароль для входа
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-password"
                    className="text-sm font-medium"
                  >
                    Пароль администратора
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      className="pl-9 pr-10"
                      placeholder="Введите пароль"
                      autoComplete="current-password"
                      autoFocus
                      data-ocid="admin_gate.password.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-1.5"
                    data-ocid="admin_gate.error_state"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-destructive inline-block"
                      aria-hidden="true"
                    />
                    Неверный пароль
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  data-ocid="admin_gate.submit_button"
                >
                  Войти в панель управления
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Доступ только для администраторов
        </p>
      </motion.div>
    </main>
  );
}
