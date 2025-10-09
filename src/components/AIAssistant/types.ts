import { Company } from "../DataVisualization/types";

export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface AIAssistantProps {
  company: Company | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
