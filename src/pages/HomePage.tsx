import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Bot, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getWorkflows, deleteWorkflow, createWorkflow } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <Zap className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">
          Você ainda não tem workflows
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Comece a criar sua primeira automação para economizar tempo e aumentar a
          produtividade.
        </p>
        <div className="flex gap-4">
          <Button className="mt-4" onClick={onCreate}>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Fluxo
          </Button>
          <Button variant="outline" className="mt-4" disabled>
            <Bot className="mr-2 h-4 w-4" /> Criar com IA
          </Button>
        </div>
      </div>
    </div>
  );
};
const WorkflowGridSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-1/4" />
        </CardFooter>
      </Card>
    ))}
  </div>
);
export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
  });
  const createMutation = useMutation({
    mutationFn: () => createWorkflow('Novo Workflow'),
    onSuccess: (data) => {
      toast.success('Novo workflow criado!');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      navigate(`/builder/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar workflow: ${error.message}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      toast.success(`Workflow deletado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      toast.error(`Erro ao deletar workflow: ${error.message}`);
    },
  });
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  const handleCreate = () => {
    createMutation.mutate();
  };
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Bem-vindo, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Aqui estão seus fluxos de automação.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Fluxo
          </Button>
        </div>
      </div>
      {isLoading && <WorkflowGridSkeleton />}
      {error && <div className="text-destructive">Erro ao carregar workflows: {error.message}</div>}
      {!isLoading && !error && workflows && workflows.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((flow) => (
            <Card
              key={flow.id}
              className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">
                  {flow.name}
                </CardTitle>
                <Badge
                  variant={flow.status === 'active' ? 'default' : 'outline'}
                  className={
                    flow.status === 'active' ? 'bg-teal text-teal-foreground' : ''
                  }
                >
                  {flow.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Atualizado{' '}
                  {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true, locale: ptBR })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                 <div className="text-xs text-muted-foreground">
                  Criado em {new Date(flow.createdAt).toLocaleDateString()}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate(`/builder/${flow.id}`)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/workflows/${flow.id}/history`)}>
                      Ver Histórico
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={() => handleDelete(flow.id)}
                    >
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}
      {!isLoading && !error && (!workflows || workflows.length === 0) && (
        <div className="min-h-[calc(100vh-200px)] flex">
          <EmptyState onCreate={handleCreate} />
        </div>
      )}
    </div>
  );
}