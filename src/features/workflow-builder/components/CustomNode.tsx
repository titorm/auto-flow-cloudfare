import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
export type CustomNodeData = {
  icon: LucideIcon;
  title: string;
  description: string;
};
export function CustomNode({ data, type }: { data: CustomNodeData; type: string }) {
  const Icon = data.icon;
  return (
    <Card
      className={cn(
        'w-64 border-2 transition-all duration-200',
        type === 'trigger'
          ? 'border-teal bg-teal/5'
          : 'border-indigo bg-indigo/5'
      )}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-3">
        <div
          className={cn(
            'rounded-md p-2',
            type === 'trigger' ? 'bg-teal/20' : 'bg-indigo/20'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              type === 'trigger' ? 'text-teal' : 'text-indigo'
            )}
          />
        </div>
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 text-xs text-muted-foreground">
        {data.description}
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !bg-slate-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !bg-slate-400"
      />
    </Card>
  );
}