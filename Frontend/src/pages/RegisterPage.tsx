import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MackenzieLogo } from '@/components/MackenzieLogo';
import { register } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (senha !== confirmSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (senha.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(nome.trim(), email.trim(), senha);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conta.');
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
        className="w-full max-w-lg"
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
          <p className="font-body text-sm text-primary-foreground/60">Criar nova conta</p>
        </div>

        <Card className="border-0 shadow-elevated">
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="font-display text-sm">Nome completo</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-display text-sm">E-mail institucional</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@mackenzista.com.br"
                  required
                />
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
                <p className="font-display text-sm font-semibold text-foreground">Cadastro inicial</p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  Toda nova conta é criada como aluno. A mudança para orientador ou comissão é feita depois pelo administrador.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-display text-sm">Senha</Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-display text-sm">Confirmar senha</Label>
                <Input
                  type="password"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-accent font-display font-semibold text-accent-foreground"
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <p className="mt-4 text-center font-body text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/" className="font-semibold text-foreground underline underline-offset-2">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center font-body text-xs text-primary-foreground/30">Protótipo v1 - Equipe APOFlow 2026</p>
      </motion.div>
    </div>
  );
}
