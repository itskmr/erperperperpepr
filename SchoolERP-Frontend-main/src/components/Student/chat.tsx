import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Trash2, 
  Sparkles,
  Maximize, 
  Minimize,
  Brain,
  ChevronDown,
  Clipboard,
  Image
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './chatmessage';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';



// Define message types
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
  containsCode?: boolean;
  containsMath?: boolean;
  isGenerating?: boolean;
  imageUrl?: string;
}

// Define suggested prompt types
interface SuggestedPrompt {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

const StudentChat: React.FC = () => {
  // State for messages, input, and loading status
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  
  // Image handling state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Router for navigation
  const navigate = useNavigate();
  
  // Chat session state
  const [threadId, setThreadId] = useState<string>("1"); // Default thread ID
  const [userId, setUserId] = useState<string>("1"); // Default user ID
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample suggested prompts with icons
  const suggestedPrompts: SuggestedPrompt[] = [
    { id: '1', text: 'Help me solve a quadratic equation', icon: <span className="text-blue-500 mr-2">∑</span> },
    { id: '2', text: 'Explain Pythagoras theorem', icon: <span className="text-green-500 mr-2">△</span> },
    { id: '3', text: 'How to calculate derivatives?', icon: <span className="text-yellow-500 mr-2">∂</span> },
    { id: '4', text: 'Explain binomial theorem', icon: <span className="text-purple-500 mr-2">Σ</span> },
    { id: '5', text: 'Tell me about India\'s PM', icon: <span className="text-red-500 mr-2">🏛️</span> },
    { id: '6', text: 'Solve 2x² + 3x - 5 = 0', icon: <span className="text-indigo-500 mr-2">∫</span> },
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect code blocks in content
  const detectCode = (content: string): boolean => {
    return (
      content.includes('```') || 
      (content.includes('{') && content.includes('}') && !content.includes('\\{')) ||
      /\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/.test(content)
    );
  };

  // Detect math content in text
  const detectMath = (content: string): boolean => {
    return (
      content.includes('\\[') || 
      content.includes('\\]') ||
      content.includes('\\(') ||
      content.includes('\\)') ||
      content.includes('\\frac') || 
      content.includes('\\sqrt') || 
      content.includes('\\sum') ||
      content.includes('\\int') ||
      content.includes('\\lim') ||
      content.includes('\\begin{') ||
      content.includes('\\end{') ||
      content.includes('\\alpha') ||
      content.includes('\\beta') ||
      content.includes('\\gamma') ||
      content.includes('\\delta') ||
      content.includes('\\pi') ||
      content.includes('\\neq') ||
      content.includes('\\pm') ||
      content.match(/[a-zA-Z0-9](\^|\^{)[0-9a-zA-Z]/g) !== null ||  // Detect exponents like x^2 or x^{2}
      content.match(/[0-9]+\/[0-9]+/g) !== null || // Detect fractions like 1/2
      content.match(/\[[^\]]*=[^\]]*\]/g) !== null || // Detect equations in brackets [x = 5]
      content.match(/\([^\)]*=[^\)]*\)/g) !== null || // Detect equations in parentheses (x = 5)
      Boolean(content.match(/\$\$.+?\$\$/s)) ||
      Boolean(content.match(/\$.+?\$/g)) ||
      Boolean(content.match(/\\\(.+?\\\)/s)) ||
      Boolean(content.match(/\\\[.+?\\\]/s)) ||
      (content.includes('^') && Boolean(content.match(/[a-zA-Z0-9]\^[a-zA-Z0-9{]/))) ||
      Boolean(content.match(/\=\s*[^=]+\s*\=/g)) ||
      content.match(/[a-zA-Z][0-9]+\s*=\s*[0-9]/g) !== null || // Detect coefficient assignments
      content.match(/quadratic|equation|formula|polynomial|discriminant/gi) !== null ||
      content.match(/ax\^2|[0-9]+x\^2/g) !== null || // Detect quadratic terms
      content.match(/\\sqrt{[^}]+}/g) !== null || // Detect square roots with braces
      content.match(/sqrt\([^)]+\)/g) !== null // Detect sqrt() function notation
    );
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + K to focus the input
      if (e.altKey && e.key === 'k') {
        inputRef.current?.focus();
      }
      
      // Alt + N to start a new conversation
      if (e.altKey && e.key === 'n') {
        handleClearChat();
      }

      // Ctrl + Enter to send message
      if (e.ctrlKey && e.key === 'Enter' && inputMessage.trim()) {
        sendMessage(inputMessage);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputMessage]);

  // Preprocess math content
  const preprocessMathContent = (content: string): string => {
    // Convert plain equations in brackets to LaTeX display mode
    content = content.replace(/\[([^[\]]*=.*[^[\]]*)\]/g, (match, equation) => {
      // Skip if it already has LaTeX delimiters
      if (match.includes('\\[') || match.includes('$')) return match;
      return `\\[ ${equation} \\]`;
    });

    // Handle inline LaTeX notation better
    content = content.replace(/([^\\])\$([\w\s\d\^\{\}\+\-\*\/\(\)=><]+?)\$/g, '$1\\($2\\)');
    
    // Replace "x^2" with "x^{2}" for better LaTeX rendering if not already in LaTeX format
    content = content.replace(/([a-zA-Z0-9])(\^)([0-9a-zA-Z])(?!\})/g, '$1$2{$3}');
    
    // Ensure proper spacing around operators in equations
    content = content.replace(/([a-zA-Z0-9}])([+\-=])([a-zA-Z0-9\\{])/g, '$1 $2 $3');
    
    // Convert division with slash to \frac for better display
    // Match a/b where a and b are numbers or variables, not already in \frac
    content = content.replace(/(\(?[a-zA-Z0-9]+\)?)\/(\(?[a-zA-Z0-9]+\)?)/g, (match, numerator, denominator) => {
      // Skip if it's already inside \frac
      if (match.includes('\\frac')) return match;
      return `\\frac{${numerator}}{${denominator}}`;
    });
    
    // Improve quadratic formula display
    // Recognize the quadratic formula pattern and enhance its display
    content = content.replace(
      /x\s*=\s*\(?-b\s*±\s*\\?sqrt\{?b\^?2?\s*-\s*4ac\}?\)?\/\(?2a\)?/g,
      `x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}`
    );
    
    // Convert sqrt() function notation to LaTeX \sqrt{}
    content = content.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    
    // Handle fraction expressions that aren't already using \frac
    content = content.replace(/(\([^)]+)\/([^)]+\))/g, (match, p1, p2) => {
      // Only replace if it's not already inside \frac{}{}
      if (!match.includes('\\frac')) {
        return match.replace(`${p1}/${p2}`, `\\frac${p1}${p2}`);
      }
      return match;
    });
    
    // Enclose obvious quadratic equations in display math mode if not already
    content = content.replace(
      /(?<![\\$\[])((\d+)?x\^2\s*[+\-]\s*\d+x\s*[+\-]\s*\d+\s*=\s*0)(?![\]$\\])/g,
      (match) => {
        // Skip if already in math mode
        const prevChar = content.charAt(content.indexOf(match) - 1);
        if (prevChar === '$' || prevChar === '[') return match;
        return `\\[ ${match} \\]`;
      }
    );
    
    return content;
  };

  // Function to send message to API and get response
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Generate a unique message ID
    const userMessageId = Date.now().toString();
    
    // Add user message to chat
    const userMessage: Message = {
      id: userMessageId,
      content: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Update messages state with the new user message
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field and hide suggestions
    setInputMessage('');
    setCharacterCount(0);
    setShowSuggestions(false);
    setIsLoading(true);
    
    try {
      // API call to backend chat service
      const response = await axios.post('https://web-production-8332.up.railway.app', {
        thread_id: threadId,
        user_id: userId,
        query: text
      });
      
      // Process the response
      if (response.data) {
        const responseContent = String(response.data);
        const containsCode = detectCode(responseContent);
        const containsMath = detectMath(responseContent);
        
        // Preprocess math content if needed
        const processedContent = containsMath 
          ? preprocessMathContent(responseContent)
          : responseContent;
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: processedContent,
          sender: 'bot',
          timestamp: new Date(),
          containsCode,
          containsMath
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error('Empty response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Fallback response in case of error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  // Handle clicking a suggested prompt
  const handleSuggestedPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    setCharacterCount(e.target.value.length);
  };

  // Handle clear chat
  const handleClearChat = () => {
    if (messages.length > 0) {
      setMessages([]);
      setShowSuggestions(true);
      // Generate a new thread ID when starting a new conversation
      setThreadId(Date.now().toString());
      toast.success('Conversation cleared');
    }
  };

  // Handle like/dislike functionality
  const handleFeedback = (messageId: string, feedbackType: 'like' | 'dislike') => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        if (feedbackType === 'like') {
          return {
            ...message,
            liked: !message.liked,
            disliked: false // Ensure dislike is removed if previously disliked
          };
        } else {
          return {
            ...message,
            disliked: !message.disliked,
            liked: false // Ensure like is removed if previously liked
          };
        }
      }
      return message;
    }));
  };

  // Handle regenerating a response
  const handleRegenerate = async (messageId: string) => {
    // Find the user message that preceded this bot message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0 && messages[messageIndex].sender === 'bot') {
      // Find the preceding user message
      let userMessageIndex = messageIndex - 1;
      while (userMessageIndex >= 0 && messages[userMessageIndex].sender !== 'user') {
        userMessageIndex--;
      }
      
      if (userMessageIndex >= 0) {
        // Get the user's original message
        const userMessage = messages[userMessageIndex];
        
        // Remove the bot message
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Send the user message again to get a new response
        setIsLoading(true);
        
        try {
          // Make API call to regenerate response
          const response = await axios.post('https://web-production-8332.up.railway.app', {
            thread_id: threadId,
            user_id: userId,
            query: userMessage.content
          });
          
          if (response.data) {
            const responseContent = String(response.data);
            const containsCode = detectCode(responseContent);
            const containsMath = detectMath(responseContent);
            
            // Preprocess math content if needed
            const processedContent = containsMath 
              ? preprocessMathContent(responseContent)
              : responseContent;
            
            const botResponse: Message = {
              id: Date.now().toString(),
              content: processedContent,
              sender: 'bot',
              timestamp: new Date(),
              containsCode,
              containsMath
            };
            
            setMessages(prev => [...prev, botResponse]);
          } else {
            throw new Error('Empty response from server');
          }
        } catch (error) {
          console.error('Error regenerating response:', error);
          toast.error('Failed to regenerate response. Please try again.');
          
          // Fallback response
          const errorResponse: Message = {
            id: Date.now().toString(),
            content: "I'm sorry, I couldn't regenerate a response at the moment. Please try again later.",
            sender: 'bot',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, errorResponse]);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // New function to handle copying the entire chat
  const handleCopyChat = () => {
    if (messages.length === 0) {
      toast.error('No chat to copy.');
      return;
    }
    const chatText = messages
      .map((m) => `${m.sender.toUpperCase()}:\n${m.content}\n`)
      .join('\n');
    navigator.clipboard.writeText(chatText)
      .then(() => {
        toast.success('Chat copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy chat.');
      });
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    toast.success('Image selected! Click to proceed with image analysis.');
  };
  
  // Cancel image selection
  const cancelImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  // Navigate to image analysis
  const goToImageAnalysis = () => {
    if (!selectedImage) return;
    
    // Create form data and navigate to image analysis page
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('thread_id', threadId);
    formData.append('user_id', userId);
    
    // Save formData to localStorage or state management
    // This is a simplified approach - in production you might use a different storage method
    localStorage.setItem('pendingImageAnalysis', JSON.stringify({
      threadId,
      userId,
      imageName: selectedImage.name,
      imageType: selectedImage.type,
      imageSize: selectedImage.size,
      timestamp: new Date().toISOString()
    }));
    
    // Store image in a temporary blob URL
    if (imagePreview) {
      localStorage.setItem('imagePreviewUrl', imagePreview);
    }
    
    // Navigate to image analysis page
    navigate(`/student/image-analysis?thread=${threadId}&user=${userId}`);
  };

  // If minimized, just show a small bubble
  if (minimized) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => setMinimized(false)}
          className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all hover:shadow-indigo-200/50 hover:scale-105 group"
        >
          <Sparkles size={26} className="text-white group-hover:animate-ping opacity-70 absolute" />
          <Sparkles size={26} className="text-white" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100"
    >
      {/* Chat header */}
      <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 shadow-md relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="mr-3 bg-white/20 p-2 rounded-lg">
                <Brain size={20} className="text-white" />
              </div>
              Pro Learning Assistant
            </h2>
            <p className="text-sm text-blue-100 mt-1 ml-1 opacity-90">
              Ask any academic question – now with a more polished interface!
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyChat}
              title="Copy entire conversation"
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Clipboard size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              disabled={messages.length === 0}
            >
              <Trash2 size={18} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMinimized(true)}
              title="Minimize chat"
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Minimize size={18} />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Chat messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-10"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">How can I help you today?</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask me anything related to your studies. I can explain concepts, solve math problems, or answer any academic questions.
              </p>
            </motion.div>
            
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, staggerChildren: 0.1 }}
                className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
              >
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={prompt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)' }}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="p-4 text-left border border-slate-200 rounded-xl flex items-center bg-white hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                      {prompt.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{prompt.text}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id}
                  message={message}
                  onFeedback={handleFeedback}
                  onSave={() => {}} // Empty function since we're removing save functionality
                  onRegenerate={handleRegenerate}
                />
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start items-start"
              >
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <Sparkles size={14} className="text-white" />
                  </div>
                </div>
                <div className="max-w-[80%] bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-200 animate-[pulse_1.5s_infinite]"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-300 animate-[pulse_1.5s_0.3s_infinite]"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-[pulse_1.5s_0.6s_infinite]"></div>
                    <span className="text-xs text-slate-400 ml-1">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Chat input */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-inner">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative flex items-end">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Ask your question... (Alt+K to focus)"
                className="w-full pl-4 pr-16 py-3.5 border-[1.5px] border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder:text-slate-400 shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-2 text-xs font-medium">
                {characterCount > 0 && (
                  <span className={`${characterCount > 400 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {characterCount}/500
                  </span>
                )}
              </div>
            </div>
            
            {/* Image upload button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowImageModal(true)}
              disabled={isLoading}
              className={`px-3 py-3.5 ml-1 rounded-2xl transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-md hover:shadow-purple-200 focus:ring-2 focus:ring-purple-300'
              }`}
              title="Upload image for analysis"
            >
              <Image size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`px-5 py-3.5 ml-1 rounded-2xl transition-all duration-200 ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-200 focus:ring-2 focus:ring-blue-300'
              }`}
            >
              <Send size={20} />
            </motion.button>
          </div>
          <div className="mt-2 flex justify-between items-center px-1">
            <p className="text-xs text-slate-500">Thread ID: {threadId}</p>
            <div className="flex space-x-3 text-xs text-slate-500">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded-md">Alt+K to focus</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded-md">Alt+N for new chat</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded-md">Ctrl+Enter to send</span>
            </div>
          </div>
        </form>
      </div>
      
      {/* Image upload modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Image Analysis</h3>
              
              <p className="text-gray-600 mb-6">
                Upload an image for analysis. I can help recognize content, solve problems from textbooks, 
                or answer questions about diagrams and visual information.
              </p>
              
              {imagePreview ? (
                <div className="mb-6">
                  <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden mb-2">
                    <img 
                      src={imagePreview} 
                      alt="Selected image preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {selectedImage?.name} ({Math.round(selectedImage?.size! / 1024)}KB)
                    </span>
                    <button 
                      onClick={cancelImageSelection}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label 
                    htmlFor="image-upload" 
                    className="flex flex-col items-center justify-center w-full h-64 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image size={40} className="text-slate-400 mb-3" />
                      <p className="mb-2 text-sm text-slate-500">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG or JPEG (max. 5MB)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToImageAnalysis}
                  disabled={!selectedImage || isUploadingImage}
                  className={`px-4 py-2 rounded-xl text-white ${
                    !selectedImage || isUploadingImage
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-md'
                  }`}
                >
                  {isUploadingImage ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Analyze Image'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentChat;
