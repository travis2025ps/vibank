// In src/components/SignUpPage.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const API_URL = 'http://localhost:8000/api/auth';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useApp();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Call the register endpoint
            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password,
                role: 'customer' // All signups are customers
            });

            // Log the user in immediately after successful registration
            login(response.data.user);
            navigate('/customer-dashboard');

        } catch (err: any) {
            setError(err.response?.data?.msg || 'Could not create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md bg-blue-900/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-700">
                <form onSubmit={handleSignUp}>
                    <div className="text-center mb-6">
                        <span className="text-5xl text-green-400">📝</span>
                        <h2 className="text-3xl font-bold mt-2">Create Customer Account</h2>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-1">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full p-3 bg-green-600 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-500">
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    <p className="mt-4 text-center text-gray-400">
                        Already have an account? <Link to="/login" className="font-semibold text-green-300 hover:underline">Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;