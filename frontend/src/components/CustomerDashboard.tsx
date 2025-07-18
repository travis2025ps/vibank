// In src/components/CustomerDashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Helper function for Text-to-Speech
const speak = (text: string) => {
  try {
    // Cancel any speech that is currently happening to prevent overlap
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Speech synthesis failed", error);
  }
};

const CustomerDashboard: React.FC = () => {
  const { user, logout, messageQueue, submitQuestion, clearHistory } = useApp();
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const [textInput, setTextInput] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);


  // We track the ID of the last message spoken to prevent repeats.
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState<number | null>(null);
  
  const myMessages = messageQueue.filter(msg => msg.userEmail === user?.email);
  const lastUserQuestion = [...myMessages].reverse().find(m => m.sender === 'user');

  // This useEffect now has smarter logic to only speak a message once.
  useEffect(() => {
    if (myMessages.length > 0) {
      const lastMessage = myMessages[myMessages.length - 1];
      // CONDITION: Only speak if the last message is from an agent AND we haven't already spoken it.
      if (lastMessage.sender === 'agent' && lastMessage.id !== lastSpokenMessageId) {
        speak(`Agent replied: ${lastMessage.text}`);
        // After speaking, we record the ID of the message we just spoke.
        setLastSpokenMessageId(lastMessage.id);
      }
    }
  }, [myMessages, lastSpokenMessageId]); // Add lastSpokenMessageId to dependency array

  // Auto-scroll chat history (no changes needed here)
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [myMessages]);

  // Populate textarea from speech recognition (no changes needed here)
  useEffect(() => {
    if (transcript) {
      setTextInput(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleSend = () => {
    if (textInput.trim()) {
      submitQuestion(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-teal-900 text-white font-sans">
      <header className="flex justify-between items-center p-4 bg-black/20 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Customer Portal</h1>
          <p className="text-sm text-gray-400">Welcome back, {user?.email}</p>
        </div>
        <button onClick={logout} className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
          Logout
        </button>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
        {/* Chat History */}
        <div className="flex flex-col bg-black/20 p-5 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Query History</h2>
            {myMessages.length > 0 && (
              <button onClick={clearHistory} className="px-3 py-1 text-xs bg-red-800/70 text-red-300 rounded-lg hover:bg-red-700">
                Clear History
              </button>
            )}
          </div>
          <div ref={chatHistoryRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
            {myMessages.length > 0 ? (
              myMessages.map(msg => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${msg.status === 'answered' ? 'text-green-400 bg-green-900/50' : 'text-red-400 bg-red-900/50'}`}>
                      {msg.status === 'answered' ? 'Completed' : 'Waiting'}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(msg.id).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-gray-200">
                    {msg.sender === 'user' ? (msg.text) : (<><strong className="text-teal-400">Agent:</strong> {msg.text}</>)}
                  </p>
                  <hr className="border-t border-white/10 my-3" />
                </div>
              ))
            ) : (<p className="text-gray-500 text-center mt-10">Your chat history will appear here.</p>)}
          </div>
        </div>

        {/* Ask Question + Status */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 flex flex-col bg-black/20 p-5 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-2">Ask Your Question</h2>
            {/* --- THIS IS THE FIX for Disabling Shortcuts --- */}
            {/* The onKeyDown prop has been removed from this textarea */}
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your banking question here..."
              className="flex-1 w-full p-3 bg-gray-800/50 rounded-lg border border-gray-600 text-white"
            />
            <div className="flex gap-4 mt-4">
              <button onClick={isListening ? stopListening : startListening} className={`flex-1 py-3 font-bold rounded-lg ${isListening ? 'bg-red-600' : 'bg-blue-600'}`}>
                {isListening ? 'Listening...' : 'Record Voice'}
              </button>
              <button onClick={handleSend} disabled={!textInput.trim()} className="flex-1 py-3 font-bold bg-gray-600 rounded-lg disabled:opacity-50">
                Send Question
              </button>
            </div>
          </div>

          <div className="bg-black/20 p-5 rounded-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Latest Query Status</h2>
            {lastUserQuestion ? (
              <>
                <div className="mb-4">
                  <h3 className="font-bold text-gray-300">Your Question:</h3>
                  <p className="text-gray-400">{lastUserQuestion.text}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-300">Status: {lastUserQuestion.status === 'answered' ? 'Responded' : 'Waiting for Agent'}</h3>
                  <p className="text-gray-400">{lastUserQuestion.status === 'answered' ? 'An agent has responded in the history panel.' : 'Your query is in the queue.'}</p>
                </div>
              </>
            ) : (<p className="text-gray-500">No active query.</p>)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;