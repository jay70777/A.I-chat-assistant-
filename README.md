# AI Chat Assistant

A modern, feature-rich chat interface powered by Claude AI. Build and manage multiple AI conversations with a clean, intuitive UI similar to ChatGPT.

## Features

### Multi-Chat Management
- **Multiple Conversations**: Create and manage unlimited chat sessions
- **Chat Sidebar**: Easy navigation between different conversations
- **Auto-Naming**: Chats automatically named from first message
- **Persistent Storage**: All conversations saved locally in browser
- **Delete Chats**: Remove individual conversations you no longer need

### Conversation Tools
- **Undo Function**: Remove last message exchange if needed
- **Clear Chat**: Wipe current conversation with confirmation
- **Copy Responses**: One-click copy of AI responses to clipboard
- **Message History**: Full conversation history with timestamps
- **Quick Prompts**: Starter examples to get conversations going

### AI Integration
- **Powered by Claude**: Uses Claude Sonnet 4 for intelligent responses
- **Real-time Responses**: Fast, accurate AI-generated replies
- **Code Highlighting**: Automatic syntax highlighting for code blocks
- **Error Handling**: Graceful error messages if API calls fail
- **Typing Indicator**: Animated dots while AI is thinking

### User Experience
- **Clean UI**: Modern, ChatGPT-style interface
- **Collapsible Sidebar**: Toggle sidebar to maximize chat space
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Press Enter to send, Shift+Enter for new line
- **Smooth Animations**: Polished transitions and hover effects

## Technologies Used

- **React**: Frontend framework
- **Claude API**: AI language model (Sonnet 4)
- **Tailwind CSS**: Styling and responsive design
- **Lucide React**: Icon library
- **Browser Storage API**: Persistent chat history

## How to Run

### Installation
````bash
# Install dependencies
npm install

# Run the app
npm start
````

The app will open at `http://localhost:3000`

### Build for Production
````bash
npm run build
````

## Usage Guide

### Starting a New Chat
1. Click the **"New Chat"** button in the sidebar
2. Type your message in the input box
3. Press Enter or click **"Send"**
4. Wait for AI response

### Managing Chats
- **Switch Chats**: Click any chat in the sidebar to open it
- **Delete Chat**: Hover over a chat and click the trash icon
- **Collapse Sidebar**: Click the menu icon (☰) to hide/show sidebar

### Conversation Controls
- **Undo**: Remove the last question and answer pair
- **Clear**: Wipe the entire current conversation
- **Copy**: Click copy icon on AI responses to copy text

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in message

## Features in Detail

### Code Block Support
The AI can write code, and it will be automatically formatted with syntax highlighting:
