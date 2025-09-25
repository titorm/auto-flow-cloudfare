import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from '@xyflow/react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { initialNodes, initialEdges } from './node-types';
export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setGraph: (graph: { nodes: Node[]; edges: Edge[] }) => void;
};
export const useBuilderStore = create<RFState>()(
  immer((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    onNodesChange: (changes: NodeChange[]) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, get().nodes);
      });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, get().edges);
      });
    },
    onConnect: (connection: Connection) => {
      set((state) => {
        state.edges = addEdge(connection, get().edges);
      });
    },
    setNodes: (nodes: Node[]) => {
      set({ nodes });
    },
    setEdges: (edges: Edge[]) => {
      set({ edges });
    },
    setGraph: (graph: { nodes: Node[]; edges: Edge[] }) => {
      set({
        nodes: graph.nodes,
        edges: graph.edges,
      });
    },
  }))
);