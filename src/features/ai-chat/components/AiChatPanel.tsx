import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Send, Sparkles, User, FileJson, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiChatStore } from '../store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chatService } from '@/lib/chat';
import { toast } from 'sonner';
const chatSchema = z.object({
  prompt: z.string().min(1, 'Digite sua ideia de automação.'),
});
type ChatFormValues = z.infer<typeof chatSchema>;
export function AiChatPanel({
  open,
  onOpenChange,
  onApplyWorkflow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyWorkflow: (graphJson: string) => void;
}) {
  const { messages, isLoading, addMessage, setLoading } = useAiChatStore();
  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { prompt: '' },
  });
  const onSubmit = async (data: ChatFormValues) => {
    addMessage({ role: 'user', content: data.prompt });
    form.reset();
    setLoading(true);
    const response = await chatService.sendMessage(data.prompt);
    setLoading(false);
    if (response.success && response.data) {
      const { content, suggestion } = response.data;
      addMessage({
        role: 'assistant',
        content: content,
        suggestion: suggestion,
      });
    } else {
      toast.error('Ocorreu um erro ao comunicar com a IA.');
      addMessage({
        role: 'assistant',
        content: 'Desculpe, não consegui processar sua solicitação no momento.',
      });
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Criar com IA
          </SheetTitle>
          <SheetDescription>
            Descreva sua automação e a IA irá gerar um fluxo para você.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg p-3 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.suggestion && (
                      <div className="mt-3 rounded-md border bg-background p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <FileJson className="h-4 w-4" />
                            <span>Sugestão de Workflow</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onApplyWorkflow(msg.suggestion!)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Aplicar
                          </Button>
                        </div>
                        <pre className="max-h-48 overflow-auto rounded bg-secondary p-2 text-xs">
                          <code>{msg.suggestion}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-1 rounded-lg bg-muted p-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-foreground [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-foreground [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-start gap-2"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Enviar e-mail de boas-vindas..."
                          className="max-h-24 resize-none"
                          disabled={isLoading}
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}