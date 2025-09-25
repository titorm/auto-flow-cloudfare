import type { Node, Edge } from '@xyflow/react';
import { NODE_DEFINITIONS } from './node-types';
type WorkflowGraph = {
  nodes: (Omit<Node, 'data'> & { data: { nodeKey: string } })[];
  edges: Edge[];
};
export const parseWorkflowSuggestion = (
  jsonString: string
): { nodes: Node[]; edges: Edge[] } | null => {
  try {
    const graph: WorkflowGraph = JSON.parse(jsonString);
    if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      console.error('Invalid graph structure in AI suggestion.');
      return null;
    }
    const nodesWithData: Node[] = graph.nodes.map((node) => {
      const definition = NODE_DEFINITIONS.get(node.data.nodeKey);
      if (!definition) {
        throw new Error(`Node definition not found for key: ${node.data.nodeKey}`);
      }
      return {
        ...node,
        type: definition.type, // Ensure type is set from definition
        data: definition,
      };
    });
    return { nodes: nodesWithData, edges: graph.edges };
  } catch (error) {
    console.error('Failed to parse AI workflow suggestion:', error);
    return null;
  }
};