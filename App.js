import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageSquare, Sparkles, Copy, Check, Undo, Plus, Menu, X } from 'lucide-react';

const AIChatInterface = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Load chats from storage
  useEffect(() => {
    const loadChats = async () => {
      try {
        const result = await window.storage.get('all_chats');
        if (result) {
          const loadedChats = JSON.parse(result.value);
          setChats(loadedChats);
          
          // Load the most recent chat
          if (loadedChats.length > 0) {
            setCurrentChatId(loadedChats[0].id);
            setMessages(loadedChats[0].messages);
          }
        }
      } catch (error) {
        console.log('No chats found');
      }
    };
    loadChats();
  }, []);

  // Save all chats to storage
  const saveChats = async (updatedChats) => {
    setChats(updatedChats);
    await window.storage.set('all_chats', JSON.stringify(updatedChats));
  };

  // Create new chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    const updatedChats = [newChat, ...chats];
    saveChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      saveChats(updatedChats);
      
      // If deleted current chat, switch to another or create new
      if (chatId === currentChatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id);
          setMessages(updatedChats[0].messages);
        } else {
          createNewChat();
        }
      }
    }
  };

  // Switch chat
  const switchChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  // Update current chat messages
  const updateCurrentChat = (newMessages) => {
    setMessages(newMessages);
    
    // Update chat in the list
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        // Generate title from first user message if still "New Chat"
        const title = chat.title === 'New Chat' && newMessages.length > 0
          ? newMessages[0].content.substring(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')
          : chat.title;
        
        return {
          ...chat,
          messages: newMessages,
          title,
          updatedAt: new Date().toISOString()
        };
      }
      return chat;
    });
    
    saveChats(updatedChats);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send message to Claude API
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    updateCurrentChat(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      
      // Extract text from response
      const assistantContent = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      const assistantMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      };

      updateCurrentChat([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error calling Claude API:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      updateCurrentChat([...updatedMessages, errorMessage]);
    }

    setIsLoading(false);
  };

  // Delete last message pair
  const deleteLastExchange = () => {
    if (messages.length < 2) return;
    const newMessages = messages.slice(0, -2);
    updateCurrentChat(newMessages);
  };

  // Clear current chat
  const clearCurrentChat = () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      updateCurrentChat([]);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format code blocks
  const formatMessage = (content) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const lines = part.split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n');
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-2">
            {language && <div className="text-blue-400 text-xs mb-2">{language}</div>}
            <code>{code}</code>
          </pre>
        );
      }
      return <div key={index} className="whitespace-pre-wrap">{part}</div>;
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No chats yet
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition ${
                    chat.id === currentChatId
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <div
                    onClick={() => switchChat(chat.id)}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500">
                      {chat.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Chat Assistant</h1>
                <p className="text-sm text-gray-600">Powered by Claude</p>
              </div>
            </div>
            <div className="flex gap-2">
              {messages.length >= 2 && (
                <button
                  onClick={deleteLastExchange}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                  title="Undo last exchange"
                >
                  <Undo size={18} />
                  Undo
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={clearCurrentChat}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={18} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Start a conversation</h2>
                <p className="text-gray-500">Ask me anything! I'm here to help.</p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => setInput("Explain how React hooks work")}
                    className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left"
                  >
                    <p className="font-medium text-gray-800">💡 Explain a concept</p>
                    <p className="text-sm text-gray-600 mt-1">How do React hooks work?</p>
                  </button>
                  <button
                    onClick={() => setInput("Write a Python function to reverse a string")}
                    className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left"
                  >
                    <p className="font-medium text-gray-800">💻 Write some code</p>
                    <p className="text-sm text-gray-600 mt-1">Python string reversal</p>
                  </button>
                  <button
                    onClick={() => setInput("Give me tips for a job interview")}
                    className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left"
                  >
                    <p className="font-medium text-gray-800">🎯 Get advice</p>
                    <p className="text-sm text-gray-600 mt-1">Job interview tips</p>
                  </button>
                  <button
                    onClick={() => setInput("Brainstorm app ideas for a portfolio")}
                    className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left"
                  >
                    <p className="font-medium text-gray-800">✨ Brainstorm ideas</p>
                    <p className="text-sm text-gray-600 mt-1">Portfolio project ideas</p>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {message.role === 'assistant' ? (
                        formatMessage(message.content)
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    {message.role === 'assistant' && !message.isError && (
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
            >
              <Send size={20} />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Chats are saved locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;
