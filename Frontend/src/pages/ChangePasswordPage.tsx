import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { MackenzieLogo } from '@/components/MackenzieLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const initialEmail = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.sessionStorage.getItem('changePasswordEmail') ?? '';
  }, []);

  const [email, setEmail] = useState(initialEmail);
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas nao correspondem.');
      return;
    }

    if (novaSenha.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(email, senhaAntiga, novaSenha);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('changePasswordEmail');
      }
      toast.success('Senha alterada com sucesso. Faça login novamente.');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-hero p-4">
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
              <Lock className="h-7 w-7 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-primary-foreground">Alterar Senha</h1>
          </motion.div>
          <p className="font-body text-sm text-primary-foreground/60">
            Use esta tela para atualizar a senha da sua conta.
          </p>
        </div>

        <Card className="border-0 shadow-elevated">
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div className="space-y-1.5">
                <Label className="font-display text-sm">E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@mackenzista.com.br"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-display text-sm">Senha Atual</Label>
                <Input
                  type="password"
                  value={senhaAntiga}
                  onChange={(event) => setSenhaAntiga(event.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-display text-sm">Nova Senha</Label>
                <Input
                  type="password"
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">Minimo de 8 caracteres.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-display text-sm">Confirmar Nova Senha</Label>
                <Input
                  type="password"
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-accent font-display font-semibold text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-xs font-display font-semibold text-blue-900">Dica de Seguranca</p>
              <p className="text-xs text-blue-800">
                Use uma senha forte com letras maiusculas, minusculas, numeros e simbolos.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center font-body text-xs text-primary-foreground/30">Prototipo v1 - Equipe APOFlow 2026</p>
      </motion.div>
    </div>
  );
}
