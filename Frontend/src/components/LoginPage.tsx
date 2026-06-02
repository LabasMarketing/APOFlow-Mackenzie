import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MackenzieLogo } from '@/components/MackenzieLogo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login, verifyOtp, cancelOtp, pendingOtpEmail, isAuthenticating } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await login(email, senha);
      toast.success('Código de verificação enviado para seu e-mail.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível autenticar.');
    }
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await verifyOtp(otpCode);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Código inválido.');
    }
  };

  const handleCancelOtp = () => {
    cancelOtp();
    setOtpCode('');
  };

  return (
    <div className="relative min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <MackenzieLogo />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-4 inline-flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => setShowDemoCredentials((current) => !current)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent shadow-glow transition-transform hover:scale-105"
              aria-label="Mostrar credenciais de demonstração"
            >
              <GraduationCap className="h-7 w-7 text-accent-foreground" />
            </button>
            <h1 className="text-3xl font-display font-bold text-primary-foreground">APOFlow</h1>
          </motion.div>
          <p className="font-body text-sm text-primary-foreground/60">
            Sistema de Gestão de Atividades Programadas Obrigatórias
          </p>
          <p className="mt-1 font-body text-xs text-primary-foreground/40">
            PPG-CA - Programa de Pós-Graduação em Computação Aplicada
          </p>
        </div>

        <AnimatePresence mode="wait">
          {pendingOtpEmail ? (
            <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="border-0 shadow-elevated">
                <CardContent className="p-6">
                  <div className="mb-4 flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent">
                      <ShieldCheck className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <p className="text-center font-display text-sm font-semibold text-foreground">Verificação em duas etapas</p>
                    <p className="text-center font-body text-xs text-muted-foreground">
                      Enviamos um código de 6 dígitos para<br />
                      <span className="font-semibold text-foreground">{pendingOtpEmail}</span>
                    </p>
                  </div>
                  <form className="space-y-3" onSubmit={handleVerifyOtp}>
                    <div className="space-y-1.5">
                      <Label className="font-display text-sm">Código de verificação</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={handleCancelOtp}>
                        Voltar
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-accent font-display font-semibold text-accent-foreground" disabled={isAuthenticating || otpCode.length !== 6}>
                        {isAuthenticating ? 'Verificando...' : 'Confirmar'}
                      </Button>
                    </div>
                  </form>
                  <p className="mt-3 text-center font-body text-xs text-muted-foreground">
                    O código expira em 10 minutos.{' '}
                    <button type="button" className="underline" onClick={() => login(email, senha)}>Reenviar</button>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="login" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              <Card className="border-0 shadow-elevated">
                <CardContent className="p-6">
                  <p className="mb-4 text-center font-body text-sm text-muted-foreground">Acesse com e-mail e senha</p>
                  <form className="space-y-3" onSubmit={handleLogin}>
                    <div className="space-y-1.5">
                      <Label className="font-display text-sm">E-mail</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@mackenzista.com.br" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-display text-sm">Senha</Label>
                      <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-accent font-display font-semibold text-accent-foreground" disabled={isAuthenticating}>
                      {isAuthenticating ? 'Verificando...' : 'Entrar'}
                    </Button>
                  </form>
                  {showDemoCredentials && (
                    <div className="mt-4 rounded-lg bg-secondary/60 p-3">
                      <p className="mb-1 text-xs font-display font-semibold text-foreground">Credenciais de demonstração</p>
                      <p className="text-xs text-muted-foreground">10427372@mackenzista.com.br / JosePedro123@</p>
                      <p className="text-xs text-muted-foreground">10437996@mackenzista.com.br / GustavoNeto123@</p>
                      <p className="text-xs text-muted-foreground">10443681@mackenzista.com.br / GabrielLabarca123@</p>
                      <p className="text-xs text-muted-foreground">10438932@mackenzista.com.br / VitorCosta123@</p>
                      <p className="text-xs text-muted-foreground">10438938@mackenzista.com.br / LuizBatista123@</p>
                    </div>
                  )}
                  {isAuthenticating && <p className="pt-2 text-center font-body text-xs text-muted-foreground">Conectando com a API...</p>}
                  <p className="mt-4 text-center font-body text-sm text-muted-foreground">
                    Novo usuário?{' '}
                    <Link to="/register" className="font-semibold text-foreground underline underline-offset-2">
                      Criar conta
                    </Link>
                  </p>
                  <p className="mt-2 text-center font-body text-sm text-muted-foreground">
                    <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                      Esqueci minha senha
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center font-body text-xs text-primary-foreground/30">Protótipo v1 - Equipe APOFlow 2026</p>
      </motion.div>
    </div>
  );
}
