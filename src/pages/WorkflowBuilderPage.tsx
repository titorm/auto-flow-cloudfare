import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
  useOnSelectionChange,
} from '@xyflow/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '@xyflow/react/dist/style.css';
import { useBuilderStore } from '@/features/workflow-builder/store';
import {
  nodeTypes,
  NODE_DEFINITIONS,
} from '@/features/workflow-builder/node-types';
import { BuilderSidebar } from '@/features/workflow-builder/components/BuilderSidebar';
import { Button } from '@/components/ui/button';
import { Save, Play, ArrowLeft, Bot, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AiChatPanel } from '@/features/ai-chat/components/AiChatPanel';
import { parseWorkflowSuggestion } from '@/features/workflow-builder/utils';
import { toast } from 'sonner';
import { getWorkflow, updateWorkflow, createWorkflow } from '@/lib/api';
import { executeWorkflow } from '@/lib/workflow-executor';
const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setGraph: state.setGraph,
});
function WorkflowBuilderHeader({
  onOpenAiChat,
  onSave,
  isSaving,
  onTestRun,
  isTesting,
}: {
  onOpenAiChat: () => void;
  onSave: () => void;
  isSaving: boolean;
  onTestRun: () => void;
  isTesting: boolean;
}) {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId!),
    enabled: workflowId !== 'new',
  });
  const title = isLoading
    ? 'Carregando...'
    : workflowId === 'new'
    ? 'Novo Workflow'
    : `Editando: ${workflow?.name || 'Workflow'}`;
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onOpenAiChat}>
          <Bot className="mr-2 h-4 w-4" />
          Criar com IA
        </Button>
        <Button variant="outline" onClick={onTestRun} disabled={isTesting}>
          {isTesting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Testar
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </header>
  );
}
export function WorkflowBuilderPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setGraph,
  } = useBuilderStore(selector);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setNodes, setEdges, getNodes, getEdges, fitView, deleteElements } = useReactFlow();
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes.map((node) => node.id));
      setSelectedEdges(edges.map((edge) => edge.id));
    },
  });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' && (selectedNodes.length > 0 || selectedEdges.length > 0)) {
        deleteElements({ nodes: selectedNodes.map(id => ({id})), edges: selectedEdges.map(id => ({id})) });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, selectedEdges, deleteElements]);
  const { data: workflowData } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId!),
    enabled: workflowId !== 'new',
  });
  useEffect(() => {
    if (workflowData?.graph?.nodes) {
      setGraph(workflowData.graph);
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    } else if (workflowId === 'new') {
      setGraph({ nodes: [], edges: [] });
    }
  }, [workflowData, workflowId, setGraph, fitView]);
  const saveMutation = useMutation({
    mutationFn: (graph: { nodes: Node[], edges: any[] }) => updateWorkflow(workflowId!, graph),
    onSuccess: () => {
      toast.success('Workflow salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });
  const handleSave = () => {
    if (workflowId === 'new') {
      toast.error("Crie o workflow primeiro antes de salvar. Use o botão na dashboard.");
      return;
    }
    const graph = { nodes: getNodes(), edges: getEdges() };
    saveMutation.mutate(graph);
  };
  const handleTestRun = async () => {
    setIsTesting(true);
    const executionToastId = toast.loading('Iniciando teste de execução...');
    const onProgress = (message: string, type: 'info' | 'success' | 'error') => {
      switch (type) {
        case 'info':
          toast.loading(message, { id: executionToastId });
          break;
        case 'success':
          toast.success(message, { id: executionToastId, duration: 4000 });
          break;
        case 'error':
          toast.error(message, { id: executionToastId, duration: 4000 });
          break;
      }
    };
    try {
      await executeWorkflow(getNodes(), getEdges(), onProgress);
    } catch (e) {
      onProgress('Ocorreu um erro inesperado durante a execução.', 'error');
    } finally {
      setIsTesting(false);
    }
  };
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const nodeKey = event.dataTransfer.getData(
        'application/reactflow-node-key'
      );
      if (!nodeKey) return;
      const definition = NODE_DEFINITIONS.get(nodeKey);
      if (!definition) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: `dnd-node-${crypto.randomUUID()}`,
        type: definition.type,
        position,
        data: definition,
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );
  const handleApplyWorkflow = (graphJson: string) => {
    const graph = parseWorkflowSuggestion(graphJson);
    if (graph) {
      setGraph(graph);
      setIsAiChatOpen(false);
      toast.success('Workflow aplicado com sucesso!');
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    } else {
      toast.error('Erro ao aplicar o workflow. O formato é inválido.');
    }
  };
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <WorkflowBuilderHeader
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
        onTestRun={handleTestRun}
        isTesting={isTesting}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            deleteKeyCode={null} // Disable default delete behavior
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
        <BuilderSidebar />
      </div>
      <AiChatPanel
        open={isAiChatOpen}
        onOpenChange={setIsAiChatOpen}
        onApplyWorkflow={handleApplyWorkflow}
      />
    </div>
  );
}