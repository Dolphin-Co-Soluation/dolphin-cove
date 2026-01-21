import { useState } from 'react';
import { 
  Search, 
  Edit, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  Info,
  MessageSquare
} from 'lucide-react';
import './Messages.css';

export function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // TODO: Replace with real data from backend
  const conversations: unknown[] = [];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Send message to backend
    setMessageText('');
  };

  return (
    <div className="messages-page">
      {/* Conversations List */}
      <aside className="conversations-panel">
        <div className="panel-header">
          <h2>Messages</h2>
          <button className="new-message-btn">
            <Edit size={18} />
          </button>
        </div>

        <div className="search-conversations">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {conversations.length > 0 ? (
            // TODO: Map over real conversations
            <></>
          ) : (
            <div className="empty-conversations">
              <MessageSquare size={40} />
              <p>No conversations yet</p>
              <span>Start chatting with your connections!</span>
            </div>
          )}
        </div>

        {/* Conversation Item Template */}
        {/*
        <div className="conversation-item active">
          <div className="conv-avatar">
            <span>U</span>
            <span className="online-indicator"></span>
          </div>
          <div className="conv-info">
            <div className="conv-header">
              <h4>User Name</h4>
              <span className="conv-time">2m</span>
            </div>
            <p className="conv-preview">Last message preview...</p>
          </div>
          <span className="unread-badge">3</span>
        </div>
        */}
      </aside>

      {/* Chat Area */}
      <main className="chat-panel">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user">
                <div className="chat-avatar">U</div>
                <div className="chat-user-info">
                  <h3>User Name</h3>
                  <span>Online</span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn">
                  <Phone size={18} />
                </button>
                <button className="action-btn">
                  <Video size={18} />
                </button>
                <button className="action-btn">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {/* Messages will be mapped here */}
            </div>

            {/* Message Input */}
            <div className="message-input">
              <button className="input-action">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="input-action">
                <Smile size={20} />
              </button>
              <button 
                className="send-btn" 
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <div className="icon-wrapper">
                <MessageSquare size={64} />
              </div>
              <h2>Your Messages</h2>
              <p>Select a conversation or start a new one</p>
              <button className="btn-primary">
                <Edit size={16} />
                New Message
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
