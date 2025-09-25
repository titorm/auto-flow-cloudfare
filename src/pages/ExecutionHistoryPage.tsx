import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { getWorkflowExecutions, getWorkflow } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
const StatusBadge = ({ status }: { status: 'success' | 'failed' | 'running' }) => {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'bg-teal text-teal-foreground', label: 'Sucesso' },
    failed: { icon: XCircle, color: 'bg-destructive text-destructive-foreground', label: 'Falhou' },
    running: { icon: RefreshCw, color: 'bg-blue-500 text-white', label: 'Executando' },
  };
  const { icon: Icon, color, label } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5 pl-1.5', color)}>
      <Icon className={cn('h-3.5 w-3.5', status === 'running' && 'animate-spin')} />
      {label}
    </Badge>
  );
};
const ExecutionHistorySkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/4" />
    <Skeleton className="h-4 w-1/2" />
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
export function ExecutionHistoryPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { data: workflow, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId!),
    enabled: !!workflowId,
  });
  const { data: executions, isLoading: isLoadingExecutions, error } = useQuery({
    queryKey: ['executions', workflowId],
    queryFn: () => getWorkflowExecutions(workflowId!),
    enabled: !!workflowId,
  });
  if (isLoadingWorkflow || isLoadingExecutions) {
    return <ExecutionHistorySkeleton />;
  }
  if (error) {
    return <div className="text-destructive">Erro ao carregar o histórico de execuções.</div>;
  }
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Histórico de Execuções</h1>
          <p className="text-muted-foreground">
            Visualizando execuções para: <span className="font-semibold text-foreground">{workflow?.name}</span>
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Execuções Recentes</CardTitle>
          <CardDescription>
            Aqui está a lista das últimas execuções para este workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID da Execução</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Iniciado em</TableHead>
                <TableHead>Finalizado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions && executions.length > 0 ? (
                executions.map((exec) => (
                  <TableRow key={exec.id}>
                    <TableCell className="font-mono text-xs">{exec.id}</TableCell>
                    <TableCell>
                      <StatusBadge status={exec.status} />
                    </TableCell>
                    <TableCell>{new Date(exec.startedAt).toLocaleString()}</TableCell>
                    <TableCell>{exec.finishedAt ? new Date(exec.finishedAt).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma execução encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}