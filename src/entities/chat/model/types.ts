export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: '1',
  role: 'system',
  content: 'Привет! Я твой финансовый помощник. Спрашивай меня о деньгах, копилках и покупках!',
  timestamp: new Date().toISOString(),
};
