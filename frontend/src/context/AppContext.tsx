// In src/context/AppContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

// --- Types remain the same ---
interface User { name: string; email: string; role: 'customer' | 'agent'; }
interface Message {
  id: number; sender: 'user' | 'agent'; text: string; status: 'waiting' | 'in-progress' | 'answered';
  userEmail: string; aiSuggestion?: string; agentFinalResponse?: string;
}
interface AppContextType {
  user: User | null; login: (userData: User) => void; logout: () => void;
  messageQueue: Message[]; currentQuery: Message | null;
  submitQuestion: (text: string) => void;
  takeNextQuery: () => void; getAISuggestion: () => void;
  sendReply: (messageId: number, agentResponseText: string) => void;
  clearHistory: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const speak = (text: string) => {
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } catch (error) { console.error("Speech synthesis failed", error); }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [messageQueue, setMessageQueue] = useState<Message[]>(() => JSON.parse(localStorage.getItem('globalMessageQueue') || '[]'));
  const [currentQuery, setCurrentQuery] = useState<Message | null>(null);

  useEffect(() => { localStorage.setItem('globalMessageQueue', JSON.stringify(messageQueue)); }, [messageQueue]);
  const login = (userData: User) => { setUser(userData); };
  const logout = () => { setUser(null); setCurrentQuery(null); };
  const clearHistory = () => { if (!user) return; setMessageQueue(prev => prev.filter(msg => msg.userEmail !== user.email)); speak("History cleared."); };
  
  const submitQuestion = (text: string) => {
    if (!text.trim() || !user) return;
    const newQuestion: Message = { id: Date.now(), sender: 'user', text, status: 'waiting', userEmail: user.email, };
    setMessageQueue(prev => [...prev, newQuestion]);
  };

  const takeNextQuery = () => {
    const nextQuery = messageQueue.find(msg => msg.status === 'waiting');
    if (!nextQuery) { speak("The queue is empty."); return; }
    speak(`Query from ${nextQuery.userEmail}. Customer says: ${nextQuery.text}`);
    setMessageQueue(prev => prev.map(msg => msg.id === nextQuery.id ? { ...msg, status: 'in-progress' } : msg));
    setCurrentQuery({ ...nextQuery, status: 'in-progress' });
  };

  // --- THIS IS THE MODIFIED FUNCTION ---
  const getAISuggestion = async () => {
    if (!currentQuery) { speak("No active query."); return; }
    
    // If suggestion already exists, just read it aloud again.
    if (currentQuery.aiSuggestion) {
        speak(`AI suggestion is: ${currentQuery.aiSuggestion}`);
        return;
    }

    try {
        const response = await axios.post('http://localhost:5000/predict', { text: currentQuery.text });
        const suggestedText = response.data.responseText;
        const queryWithSuggestion = { ...currentQuery, aiSuggestion: suggestedText };
        setMessageQueue(prev => prev.map(msg => msg.id === currentQuery.id ? queryWithSuggestion : msg));
        setCurrentQuery(queryWithSuggestion);
        speak(`AI suggests: ${suggestedText}`);
    } catch (error) {
        console.error("AI suggestion failed", error);
        speak("Could not get AI suggestion.");
    }
  };
  // ------------------------------------

  const sendReply = (messageId: number, agentResponseText: string) => {
    const originalQuestionerEmail = messageQueue.find(m => m.id === messageId)?.userEmail || '';
    setMessageQueue(prev => prev.map(msg => msg.id === messageId ? { ...msg, status: 'answered', agentFinalResponse: agentResponseText } : msg));
    const agentReplyMessage: Message = { id: Date.now(), sender: 'agent', text: agentResponseText, status: 'answered', userEmail: originalQuestionerEmail, };
    setMessageQueue(prev => [...prev, agentReplyMessage]);
    setCurrentQuery(null);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, messageQueue, currentQuery, submitQuestion, takeNextQuery, getAISuggestion, sendReply, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};