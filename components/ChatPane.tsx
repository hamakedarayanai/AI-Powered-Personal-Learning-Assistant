
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { ai } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, SparklesIcon } from './Icons';

interface ChatPaneProps {
  topic: string | null;
  selectedConcept: string | null;
}

const ChatPane: React.FC<ChatPaneProps> = ({ topic, selectedConcept }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when topic changes
    if (topic) {
      const systemInstruction = `You are a helpful learning assistant. The user is currently learning about "${topic}". Help them understand the concepts. Be friendly and encouraging.`;
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
      });
      setMessages([
        { role: 'model', content: `Hello! I see you're learning about ${topic}. How can I help you today?` }
      ]);
    } else {
      setMessages([]);
    }
  }, [topic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const fullPrompt = selectedConcept 
      ? `In the context of "${selectedConcept}", ${input}`
      : input;
      
    try {
      const result = await chatRef.current.sendMessageStream({ message: fullPrompt });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      
      for await (const chunk of result) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: modelResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/60">
      <div className="flex items-center p-4 border-b border-gray-700">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-cyan-400" />
        <h2 className="ml-3 text-lg font-semibold text-white">Chat Assistant</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
             <SparklesIcon className="w-12 h-12 mb-4 text-gray-600"/>
             <p>Enter a topic to start a conversation with your learning assistant.</p>
           </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
              msg.role === 'user' 
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-700 text-gray-200'
            }`}>
              <div className="prose prose-invert prose-p:my-0 whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 px-4 py-3 rounded-lg flex items-center">
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s] mx-1"></div>
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
         )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSend} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={topic ? "Ask a question..." : "Enter a topic first"}
            disabled={!topic || isLoading}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-shadow"
          />
          <button
            type="submit"
            disabled={!topic || isLoading || !input.trim()}
            className="p-3 bg-cyan-600 text-white rounded-r-md hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPane;
