import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import './AIChat.css';

const AIChat = () => {
  const { t } = useTranslation();
  const { language, chatAlignment } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    tone: 'neutral',
    length: 'medium',
    includeHashtags: true,
    includeEmojis: false,
  });
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate API call to backend
      // In a real implementation, this would call your backend API
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          text: t('This is a simulated AI response. In a real implementation, this would connect to your backend AI service.'),
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: t('Sorry, I encountered an error. Please try again.'),
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messageClass = (sender) => (
    sender === 'user' ? 'aichat-message user' : 'aichat-message ai'
  );

  return (
    <div
      className="aichat-container"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ [chatAlignment === 'left' ? 'left' : 'right']: 20 }}
    >
      <div className="aichat-header">{t('chatWithAI')}</div>
      
      <div className="aichat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={messageClass(message.sender)}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className={messageClass('ai')}>{t('loading')}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="aichat-input" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('typeYourMessage')}
          className="aichat-textinput"
          disabled={isLoading}
        />
        <div className="aichat-actions">
          <button
            onClick={handleSendMessage}
            className="aichat-send"
            disabled={isLoading || !inputValue.trim()}
          >
            {t('sendMessage')}
          </button>
          <button
            type="button"
            className="aichat-settings"
            aria-expanded={showOptions}
            aria-controls="aichat-options"
            title={t('settings') || 'Settings'}
            onClick={() => setShowOptions((v) => !v)}
          >
            <svg
              className="aichat-settings-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="currentColor"/>
              <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.2l2.1-1.6-2-3.5-2.6 1a7.7 7.7 0 0 0-2.1-1.2l-.4-2.8h-4l-.4 2.8c-.7.2-1.4.6-2.1 1.1l-2.6-1-2 3.5 2.2 1.6a9.3 9.3 0 0 0 0 2.4l-2.1 1.6 2 3.5 2.6-1c.6.5 1.3.9 2.1 1.2l.4 2.8h4l.4-2.8c.7-.2 1.4-.6 2.1-1.1l2.6 1 2-3.5-2.2-1.6c.1-.4.1-.8.1-1.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        id="aichat-options"
        className={`aichat-options ${showOptions ? 'open' : ''}`}
        aria-hidden={!showOptions}
      >
        <div className="aichat-option">
          <label>{t('tone') || 'Tone'}</label>
          <select
            value={options.tone}
            onChange={(e) => setOptions({ ...options, tone: e.target.value })}
          >
            <option value="neutral">{t('neutral') || 'Neutral'}</option>
            <option value="friendly">{t('friendly') || 'Friendly'}</option>
            <option value="formal">{t('formal') || 'Formal'}</option>
            <option value="humorous">{t('humorous') || 'Humorous'}</option>
          </select>
        </div>
        <div className="aichat-option">
          <label>{t('length') || 'Length'}</label>
          <select
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: e.target.value })}
          >
            <option value="short">{t('short') || 'Short'}</option>
            <option value="medium">{t('medium') || 'Medium'}</option>
            <option value="long">{t('long') || 'Long'}</option>
          </select>
        </div>
        <div className="aichat-option aichat-option-row">
          <label>
            <input
              type="checkbox"
              checked={options.includeHashtags}
              onChange={(e) => setOptions({ ...options, includeHashtags: e.target.checked })}
            />{' '}
            {t('includeHashtags') || 'Include hashtags'}
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.includeEmojis}
              onChange={(e) => setOptions({ ...options, includeEmojis: e.target.checked })}
            />{' '}
            {t('includeEmojis') || 'Include emojis'}
          </label>
        </div>
      </div>
    </div>
  );
};

export default AIChat;