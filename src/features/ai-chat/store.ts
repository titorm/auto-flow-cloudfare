import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  suggestion?: string | null;
};
type AiChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
};
type AiChatActions = {
  addMessage: (message: ChatMessage) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
};
const initialState: AiChatState = {
  messages: [
    {
      role: 'assistant',
      content:
        'Olá! Descreva a automação que você gostaria de criar. Por exemplo: "Quando eu receber um PIX, envie uma mensagem de confirmação no WhatsApp."',
    },
  ],
  isLoading: false,
};
export const useAiChatStore = create<AiChatState & AiChatActions>()(
  immer((set) => ({
    ...initialState,
    addMessage: (message) =>
      set((state) => {
        state.messages.push(message);
      }),
    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),
    reset: () => set(initialState),
  }))
);