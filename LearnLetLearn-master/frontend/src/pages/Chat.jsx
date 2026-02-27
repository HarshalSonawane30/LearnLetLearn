import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../app/AuthContext';
import { socketService } from '../services/socketService';
import { LoadingSpinner, ErrorMessage } from '../components/ui';

const Chat = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [peerId, setPeerId] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return;

    socketService.initialize(user._id, () => {
      console.log('Socket connected successfully');
    });

    // Listen to incoming messages
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socketService.onMessage(handleReceiveMessage);

    // Cleanup on unmount
    return () => {
      socketService.removeListener('receive_message');
    };
  }, [user?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat history
  const fetchHistory = useCallback(async () => {
    if (!peerId.trim()) {
      setError('Please enter a peer user ID');
      return;
    }

    setIsLoadingMessages(true);
    setError('');
    setMessages([]);

    socketService.fetchHistory(
      { userId: user._id, peerId },
      (history) => {
        setMessages(history || []);
        setIsLoadingMessages(false);
      }
    );
  }, [user?._id, peerId]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!message.trim() || !peerId.trim()) {
      setError('Please enter a peer ID and message');
      return;
    }

    const messageData = {
      senderId: user._id,
      receiverId: peerId,
      message: message.trim(),
    };

    socketService.sendMessage(messageData, (response) => {
      if (response?.success === false) {
        setError('Failed to send message');
      }
    });

    // Add message to local state
    setMessages((prev) => [
      ...prev,
      {
        senderId: user._id,
        receiverId: peerId,
        message: message.trim(),
        timestamp: new Date(),
      },
    ]);
    setMessage('');
    setError('');
  }, [message, peerId, user?._id]);

  // Handle typing indicator
  const handleTyping = useCallback(
    (e) => {
      setMessage(e.target.value);
      if (peerId.trim()) {
        socketService.sendTyping({
          senderId: user._id,
          receiverId: peerId,
        });
      }
    },
    [peerId, user?._id]
  );

  // Handle enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Chat</h2>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {/* Peer Selection */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Peer User ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter peer user ID"
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={fetchHistory}
              disabled={isLoadingMessages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoadingMessages ? 'Loading...' : 'Load Chat'}
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white rounded-lg shadow mb-4 overflow-y-auto p-4">
          {messages.length === 0 && !peerId ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>Select a peer and load chat history to begin</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.senderId === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === user._id
                          ? 'text-blue-100'
                          : 'text-gray-600'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              disabled={!peerId}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!peerId || !message.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
          {isTyping && (
            <p className="text-xs text-gray-500 mt-2">Communicating...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
