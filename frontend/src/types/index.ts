// --- START OF REFACTORED FILE src/types/index.ts ---

/**
 * Represents a user of the application.
 * This data will be sent from the Node.js backend after a successful login.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'customer' | 'agent'; // 'type' is used in the frontend
}

/**
 * Represents a single message in a conversation.
 * This is used for displaying the chat in the CustomerDashboard.
 */
export interface Message {
  sender: 'user' | 'bot';
  text: string;
  audioBase64?: string; // Optional: To hold the audio from the bot
  timestamp?: string;   // Optional: To show when the message was sent
}

/**
 * Represents a full conversation history for a single customer.
 * This will be fetched by the AgentDashboard.
 */
export interface ConversationHistory {
  _id: string;      // The unique ID of the conversation from MongoDB
  user: {
    _id: string;
    name: string;
    email: string;
  };
  messages: Message[];
  createdAt: string; // The date the conversation started
}