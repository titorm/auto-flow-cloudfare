import type { Node, Edge } from '@xyflow/react';
export type ProgressCallback = (message: string, type: 'info' | 'success' | 'error') => void;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const executeWorkflow = async (
  nodes: Node[],
  edges: Edge[],
  onProgress: ProgressCallback
): Promise<void> => {
  onProgress('Iniciando execução do workflow...', 'info');
  await delay(500);
  const nodeMap = new Map<string, Node>(nodes.map(node => [node.id, node]));
  const adjacencyMap = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacencyMap.has(edge.source)) {
      adjacencyMap.set(edge.source, []);
    }
    adjacencyMap.get(edge.source)!.push(edge.target);
  }
  const triggers = nodes.filter(node => node.type === 'trigger');
  if (triggers.length === 0) {
    onProgress('Nenhum gatilho (trigger) encontrado no workflow.', 'error');
    return;
  }
  const queue: string[] = triggers.map(t => t.id);
  const executed = new Set<string>();
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (executed.has(nodeId)) continue;
    const node = nodeMap.get(nodeId);
    if (!node) {
      onProgress(`Nó com ID ${nodeId} não encontrado.`, 'error');
      continue;
    }
    onProgress(`Executando nó: "${node.data.title}"...`, 'info');
    await delay(1000 + Math.random() * 500); // Simulate work
    // Simulate success/failure
    const isSuccess = Math.random() > 0.1; // 90% success rate
    if (isSuccess) {
      onProgress(`Nó "${node.data.title}" executado com sucesso.`, 'success');
      executed.add(nodeId);
      const children = adjacencyMap.get(nodeId) || [];
      for (const childId of children) {
        if (!executed.has(childId)) {
          queue.push(childId);
        }
      }
    } else {
      onProgress(`Nó "${node.data.title}" falhou.`, 'error');
      onProgress('Execução do workflow interrompida devido a erro.', 'error');
      return; // Stop execution on failure
    }
  }
  onProgress('Execução do workflow concluída com sucesso!', 'success');
};