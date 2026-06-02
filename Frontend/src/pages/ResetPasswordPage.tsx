import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MackenzieLogo } from '@/components/MackenzieLogo';
import { resetPassword } from '@/lib/api';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error('Link de redefinição inválido. Solicite um novo.');
      return;
    }
    if (novaSenha.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, novaSenha);
      toast.success('Senha redefinida com sucesso! Faça login.');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao redefinir senha.');
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
          <p className="font-body text-sm text-primary-foreground/60">Definir nova senha</p>
        </div>

        <Card className="border-0 shadow-elevated">
          <CardContent className="p-6">
            {!token ? (
              <div className="space-y-3 text-center">
                <p className="font-display text-sm font-semibold text-destructive">Link inválido</p>
                <p className="font-body text-sm text-muted-foreground">
                  O link de redefinição é inválido ou expirou. Solicite um novo.
                </p>
                <Link to="/forgot-password" className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:underline">
                  Solicitar novo link
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label className="font-display text-sm">Nova senha</Label>
                  <div className="relative">
                    <Input
                      type={showSenha ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-display text-sm">Confirmar nova senha</Label>
                  <Input
                    type={showSenha ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-accent font-display font-semibold text-accent-foreground"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
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
