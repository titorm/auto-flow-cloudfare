import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAuth } from '@/lib/auth';
import * as api from '@/lib/api';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(`Falha no login: ${error.message}`);
    },
  });
  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };
  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Bem-vindo de volta! Faça login para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Senha</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Esqueceu sua senha?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mutation.isPending ? 'Entrando...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="underline">
              Registre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}