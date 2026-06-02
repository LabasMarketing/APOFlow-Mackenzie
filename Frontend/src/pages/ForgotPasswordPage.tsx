import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MackenzieLogo } from '@/components/MackenzieLogo';
import { forgotPassword } from '@/lib/api';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar e-mail.');
    } finally {
      setLoading(false);
    }
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
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-4 inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent shadow-glow">
              <GraduationCap className="h-7 w-7 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-primary-foreground">APOFlow</h1>
          </motion.div>
          <p className="font-body text-sm text-primary-foreground/60">Recuperação de senha</p>
        </div>

        <Card className="border-0 shadow-elevated">
          <CardContent className="p-6">
            {sent ? (
              <div className="space-y-4 text-center">
                <p className="font-display text-sm font-semibold text-foreground">E-mail enviado!</p>
                <p className="font-body text-sm text-muted-foreground">
                  Se o endereço <span className="font-semibold text-foreground">{email}</span> estiver
                  cadastrado, você receberá as instruções para redefinir sua senha em breve.
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Verifique também sua caixa de spam. O link expira em 1 hora.
                </p>
                <Link to="/" className="mt-2 inline-flex items-center gap-1.5 font-body text-sm text-primary hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao login
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label className="font-display text-sm">E-mail cadastrado</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@mackenzista.com.br"
                    required
                    autoFocus
                  />
                  <p className="font-body text-xs text-muted-foreground">
                    Enviaremos um link para redefinir sua senha.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-accent font-display font-semibold text-accent-foreground"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>

                <div className="text-center">
                  <Link to="/" className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar ao login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
