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
const registerSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});
type RegisterFormValues = z.infer<typeof registerSchema>;
export function RegisterPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });
  const mutation = useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(`Falha no registro: ${error.message}`);
    },
  });
  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };
  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrar</CardTitle>
          <CardDescription>
            Crie sua conta para começar a automatizar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    <FormLabel>Senha</FormLabel>
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
                {mutation.isPending ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}