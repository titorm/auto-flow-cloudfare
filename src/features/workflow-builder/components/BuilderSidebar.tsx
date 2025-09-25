import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { NODE_DEFINITIONS, NodeDefinition } from '../node-types';
const DraggableNode = ({
  nodeKey,
  definition,
}: {
  nodeKey: string;
  definition: NodeDefinition;
}) => {
  const { type, title, icon: Icon } = definition;
  const onDragStart = (event: React.DragEvent, key: string) => {
    event.dataTransfer.setData('application/reactflow-node-key', key);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div
      className={cn(
        'flex cursor-grab items-center gap-3 rounded-lg border-2 p-3 text-sm transition-all duration-200 hover:shadow-md',
        type === 'trigger'
          ? 'border-teal bg-teal/10 hover:border-teal'
          : 'border-indigo bg-indigo/10 hover:border-indigo'
      )}
      onDragStart={(event) => onDragStart(event, nodeKey)}
      draggable
    >
      <Icon
        className={cn(
          'h-5 w-5',
          type === 'trigger' ? 'text-teal' : 'text-indigo'
        )}
      />
      <span>{title}</span>
    </div>
  );
};
export function BuilderSidebar() {
  const triggers = Array.from(NODE_DEFINITIONS.entries()).filter(
    ([, def]) => def.type === 'trigger'
  );
  const actions = Array.from(NODE_DEFINITIONS.entries()).filter(
    ([, def]) => def.type === 'action'
  );
  return (
    <aside className="w-72 border-l bg-background p-4">
      <Card>
        <CardHeader>
          <CardTitle>Nós</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Arraste um nó para a tela para começar.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-teal">Gatilhos</h4>
            {triggers.map(([key, def]) => (
              <DraggableNode key={key} nodeKey={key} definition={def} />
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-indigo">Ações</h4>
            {actions.map(([key, def]) => (
              <DraggableNode key={key} nodeKey={key} definition={def} />
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}