// In src/components/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPassword, setCustomerPassword] = useState('');

    // Agent voice login logic
    useEffect(() => {
        if (!isListening && transcript) {
            const agentName = transcript.trim();
            if (agentName) {
                const agentUser = {
                    name: agentName,
                    email: `${agentName.toLowerCase().replace(/\s/g, '')}@vibank.agent`,
                    role: 'agent' as const,
                };
                login(agentUser);
                navigate('/agent-dashboard');
            }
            resetTranscript();
        }
    }, [isListening, transcript, login, navigate, resetTranscript]);

    // Mock customer login
    const handleCustomerLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (customerEmail && customerPassword) {
            const customerUser = {
                name: 'Hemanth Reddy',
                email: customerEmail,
                role: 'customer' as const,
            };
            login(customerUser);
            navigate('/customer-dashboard');
        }
    };

    // Spacebar listener for voice login
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !isListening) {
                e.preventDefault();
                startListening();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isListening) {
                stopListening();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isListening, startListening, stopListening]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            
            {/* --- THIS IS THE NEW HEADER SECTION --- */}
            <header className="text-center mb-10">
                <h1 className="text-6xl font-bold flex items-center justify-center gap-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                    <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    VIBANK
                </h1>
                
            </header>
            {/* ------------------------------------ */}

            <div className="w-full max-w-4xl flex flex-col items-center gap-8">
                {/* Customer Login Form */}
                <div className="w-full max-w-md bg-blue-900/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-700">
                    <form onSubmit={handleCustomerLogin}>
                        <div className="text-center mb-6">
                            <span className="text-5xl text-green-400">👥</span>
                            <h2 className="text-3xl font-bold mt-2">Customer Login</h2>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Email</label>
                            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600" />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-1">Password</label>
                            <input type="password" value={customerPassword} onChange={(e) => setCustomerPassword(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600" />
                        </div>
                        <button type="submit" className="w-full p-3 bg-green-600 rounded-lg font-bold">
                            Login as Customer
                        </button>
                    </form>
                </div>

                {/* Agent Voice Login Section */}
                <div className="w-full max-w-md text-center p-6 rounded-2xl border-dashed border-2 border-yellow-500">
                    <h2 className="text-2xl font-bold">Agent Voice Login</h2>
                    <p className="text-yellow-300 mt-2">Hold <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border rounded-lg">Spacebar</kbd> and say your name.</p>
                    <div className="mt-4 text-5xl">
                        <span className={isListening ? 'animate-pulse' : ''}>🎙️</span>
                    </div>
                </div>
            </div>
            <p className="mt-8 text-center text-gray-300">
                New Customer? <Link to="/signup" className="font-semibold text-green-400 hover:underline">Create an Account</Link>
            </p>
        </div>
    );
};

export default LoginPage;