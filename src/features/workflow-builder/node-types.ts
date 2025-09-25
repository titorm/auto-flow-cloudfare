import type { Node, Edge } from '@xyflow/react';
import { Webhook, MessageSquare, Send, Bot, LucideIcon } from 'lucide-react';
import { CustomNode } from './components/CustomNode';
export type NodeDefinition = {
  type: 'trigger' | 'action';
  icon: LucideIcon;
  title: string;
  description: string;
};
export const NODE_DEFINITIONS: Map<string, NodeDefinition> = new Map([
  [
    'webhook',
    {
      type: 'trigger',
      icon: Webhook,
      title: 'Gatilho de Webhook',
      description: 'Inicia o fluxo com uma requisição HTTP.',
    },
  ],
  [
    'whatsapp',
    {
      type: 'action',
      icon: MessageSquare,
      title: 'Enviar Mensagem (WhatsApp)',
      description: 'Envia uma mensagem para um contato.',
    },
  ],
  [
    'email',
    {
      type: 'action',
      icon: Send,
      title: 'Enviar E-mail',
      description: 'Envia um e-mail via SMTP.',
    },
  ],
  [
    'ai_action',
    {
      type: 'action',
      icon: Bot,
      title: 'Ação de IA',
      description: 'Usa IA para processar dados.',
    },
  ],
]);
export const nodeTypes = {
  trigger: CustomNode,
  action: CustomNode,
};
export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 5 },
    data: NODE_DEFINITIONS.get('webhook'),
  },
  {
    id: '2',
    type: 'action',
    position: { x: 100, y: 125 },
    data: NODE_DEFINITIONS.get('whatsapp'),
  },
  {
    id: '3',
    type: 'action',
    position: { x: 400, y: 125 },
    data: NODE_DEFINITIONS.get('email'),
  },
];
export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
];