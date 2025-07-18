// In src/components/AgentDashboard.tsx

import React, { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// Helper function to speak text using the browser's TTS engine
const speak = (text: string) => {
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } catch (error) { console.error("Speech synthesis failed", error); }
};

// A reusable stat card component
const StatCard: React.FC<{ title: string; count: number; icon: string; }> = ({ title, count, icon }) => (
    <div className="flex-1 p-4 bg-black/20 rounded-xl flex items-center gap-4 border border-white/10">
        <div className="text-3xl">{icon}</div>
        <div><div className="text-2xl font-bold">{count}</div><div className="text-sm text-gray-400">{title}</div></div>
    </div>
);

// A new component to display keyboard hints
const KeyboardHint: React.FC<{ keys: string; action: string; isActive: boolean }> = ({ keys, action, isActive }) => (
    <div className={`p-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600' : 'bg-gray-700/50'}`}>
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border rounded-lg">{keys}</kbd>
        <span className="ml-2 text-sm">{action}</span>
    </div>
);

const AgentDashboard: React.FC = () => {
    const { user, logout, messageQueue, currentQuery, takeNextQuery, getAISuggestion, sendReply } = useApp();
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
    
    // This effect handles the automatic sending of the response after recording
    useEffect(() => {
        if (transcript && !isListening && currentQuery) {
            speak(`I heard: ${transcript}. Sending now.`);
            sendReply(currentQuery.id, transcript);
            resetTranscript();
        }
    }, [transcript, isListening, currentQuery, sendReply, resetTranscript]);

    const pendingCount = messageQueue.filter(m => m.status === 'waiting').length;
    const inProgressCount = currentQuery ? 1 : 0;
    const completedCount = messageQueue.filter(m => m.status === 'answered' && m.sender === 'user').length;

    // --- THIS IS THE FIX ---
    // We define the key handlers using useCallback to prevent them from being redefined on every render.
    // This is a performance optimization.
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isListening) return;

        if (e.code === 'Space') {
            e.preventDefault();
            if (!currentQuery) { takeNextQuery(); } 
            else { speak(`Re-reading query: ${currentQuery.text}`); }
        } else if (e.altKey) {
            e.preventDefault();
            getAISuggestion();
        } else if (e.key === 'Shift') {
            e.preventDefault();
            if (currentQuery) { startListening(); }
        }
    }, [isListening, currentQuery, takeNextQuery, getAISuggestion, startListening]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Shift' && isListening) {
            e.preventDefault();
            stopListening();
        }
    }, [isListening, stopListening]);

    // This useEffect hook now manages the entire lifecycle of the keyboard shortcuts,
    // including when the tab is focused or blurred.
    useEffect(() => {
        const addListeners = () => {
            console.log("Tab focused: Adding Agent keyboard listeners.");
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        };

        const removeListeners = () => {
            console.log("Tab blurred or component unmounted: Removing Agent keyboard listeners.");
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };

        // Add listeners when the tab becomes active
        window.addEventListener('focus', addListeners);
        // Remove listeners when the tab becomes inactive
        window.addEventListener('blur', removeListeners);
        
        // Also add listeners when the component first mounts, in case the tab is already focused.
        addListeners();

        // This is the cleanup function. It runs when the component unmounts (on logout).
        return () => {
            removeListeners(); // Make sure to remove them on logout
            window.removeEventListener('focus', addListeners);
            window.removeEventListener('blur', removeListeners);
        };
    }, [handleKeyDown, handleKeyUp]); // The effect re-runs if the handlers change.
    // ------------------------------------

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-[#2c2a4a] to-[#4f3b78] text-white">
            <header className="flex justify-between items-center p-4 bg-black/20 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold">Agent Portal</h1>
                    <p className="text-sm text-gray-400">Welcome back, Agent {user?.name}</p>
                </div>
                <button onClick={logout} className="px-5 py-2 bg-red-600 font-bold rounded-lg">Logout</button>
            </header>

            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="flex gap-6">
                    <StatCard title="Pending Queries" count={pendingCount} icon="⏲️" />
                    <StatCard title="In Progress" count={inProgressCount} icon="💬" />
                    <StatCard title="Completed" count={completedCount} icon="✔️" />
                </div>

                <div className="bg-black/20 p-6 rounded-xl border border-white/10 text-center">
                    {!currentQuery ? (
                        <>
                            <h2 className="text-2xl font-bold">Ready for Next Query</h2>
                            <p className="text-gray-400 mt-1">There are {pendingCount} customer{pendingCount !== 1 ? 's' : ''} waiting.</p>
                        </>
                    ) : (
                        <div className="text-left space-y-4">
                            <h3 className="font-bold text-lg">Current Query from: <span className="text-teal-300">{currentQuery.userEmail}</span></h3>
                            <p className="p-3 bg-gray-800/50 rounded-lg">{currentQuery.text}</p>
                            
                            <h3 className="font-bold text-lg">AI Suggested Response:</h3>
                            <p className="p-3 bg-gray-800/50 rounded-lg italic h-16">
                                {currentQuery.aiSuggestion || "Press ALT key to generate suggestion..."}
                            </p>
                            
                            <hr className="border-white/10" />
                            
                            <div>
                                <h3 className="font-bold text-lg">Your Final Response:</h3>
                                <div className={`p-4 mt-2 text-center rounded-lg border-2 ${isListening ? 'border-red-500 animate-pulse' : 'border-dashed border-gray-600'}`}>
                                    <p className="font-semibold">{isListening ? "Listening..." : "Hold SHIFT to record your response"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                    <h3 className="font-semibold text-lg mb-2">Keyboard Shortcuts</h3>
                    <div className="flex flex-wrap gap-4">
                        <KeyboardHint keys="SPACE" action={currentQuery ? "Re-listen to Query" : "Take Next Query"} isActive={!currentQuery} />
                        <KeyboardHint keys="ALT" action={currentQuery?.aiSuggestion ? "Re-listen to Suggestion" : "Get AI Suggestion"} isActive={!!currentQuery} />
                        <KeyboardHint keys="SHIFT" action="Hold to Record Response" isActive={!!currentQuery} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AgentDashboard;