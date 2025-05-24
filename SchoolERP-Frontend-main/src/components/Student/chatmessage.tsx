import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, RotateCcw, Copy, Check } from 'lucide-react';
import { Message } from './chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './mathStyles.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string, feedbackType: 'like' | 'dislike') => void;
  onSave: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
}

// Define markdown component props type
type MarkdownComponentProps = {
  className?: string;
  children?: React.ReactNode;
  node?: any;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback, onSave, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [processedContent, setProcessedContent] = useState(message.content);

  // Process the content when message changes
  useEffect(() => {
    setProcessedContent(message.content);
  }, [message.content]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (message.sender === 'user') {
      return <p className="text-gray-100">{message.content}</p>;
    }

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: (props: MarkdownComponentProps) => (
              <h1 className="text-2xl font-bold text-gray-900 my-3" {...props} />
            ),
            h2: (props: MarkdownComponentProps) => (
              <h2 className="text-xl font-bold text-gray-800 my-2" {...props} />
            ),
            h3: (props: MarkdownComponentProps) => (
              <h3 className="text-lg font-bold text-gray-800 my-2" {...props} />
            ),
            h4: (props: MarkdownComponentProps) => (
              <h4 className="text-base font-bold text-gray-800 my-2" {...props} />
            ),
            p: (props: MarkdownComponentProps) => (
              <p className="my-2 text-gray-700" {...props} />
            ),
            ul: (props: MarkdownComponentProps) => (
              <ul className="list-disc pl-6 my-2 space-y-1" {...props} />
            ),
            ol: (props: MarkdownComponentProps) => (
              <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />
            ),
            li: (props: MarkdownComponentProps) => (
              <li className="text-gray-700" {...props} />
            ),
            a: (props: MarkdownComponentProps & { href?: string }) => (
              <a className="text-blue-600 hover:underline" {...props} />
            ),
            strong: (props: MarkdownComponentProps) => (
              <strong className="font-bold text-gray-900" {...props} />
            ),
            em: (props: MarkdownComponentProps) => (
              <em className="italic text-gray-800" {...props} />
            ),
            blockquote: (props: MarkdownComponentProps) => (
              <blockquote className="border-l-4 border-blue-200 pl-4 py-1 my-2 text-gray-700 bg-blue-50 rounded-r-md" {...props} />
            ),
            hr: (props: MarkdownComponentProps) => (
              <hr className="my-4 border-t border-gray-300" {...props} />
            ),
            code: ({ inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              
              return !inline && match ? (
                <div className="relative rounded-md overflow-hidden my-4">
                  <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-gray-200">
                    <span className="text-xs font-mono">{match[1]}</span>
                    <button
                      onClick={() => handleCopy(String(children))}
                      className="text-xs flex items-center hover:text-white transition-colors"
                    >
                      {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={dracula}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // @ts-ignore - These components are provided by remark-math plugin
            math: ({ node, ...props }: any) => (
              <div className="katex-display my-4 overflow-x-auto py-2 px-4 bg-slate-50 border-l-4 border-blue-200 rounded-r-md">
                {props.children}
              </div>
            ),
            // @ts-ignore - These components are provided by remark-math plugin
            inlineMath: ({ node, ...props }: any) => (
              <span className="katex-inline mx-1">
                {props.children}
              </span>
            ),
            table: (props: MarkdownComponentProps) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-md" {...props} />
              </div>
            ),
            thead: (props: MarkdownComponentProps) => (
              <thead className="bg-gray-50" {...props} />
            ),
            tbody: (props: MarkdownComponentProps) => (
              <tbody className="divide-y divide-gray-200" {...props} />
            ),
            tr: (props: MarkdownComponentProps) => (
              <tr {...props} />
            ),
            th: (props: MarkdownComponentProps) => (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
            ),
            td: (props: MarkdownComponentProps) => (
              <td className="px-4 py-3 text-sm text-gray-700" {...props} />
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  // Effect to trigger re-rendering of math when content changes
  useEffect(() => {
    if (message.containsMath) {
      const timer = setTimeout(() => {
        // Force re-render of math expressions by toggling content slightly
        setProcessedContent(prev => prev + ' ');
        setTimeout(() => setProcessedContent(message.content), 10);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [message.id, message.content, message.containsMath]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.sender === 'bot' && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              <circle cx="7" cy="17" r="1"/>
              <circle cx="17" cy="17" r="1"/>
            </svg>
          </div>
        </div>
      )}
      
      <div 
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg 
          ${message.sender === 'user' 
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' 
            : 'bg-white border border-gray-100'
          }`}
      >
        {renderContent()}
        
        {message.isGenerating && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-pulse mr-2">Generating...</div>
              <div className="animate-spin">⟳</div>
            </div>
          </div>
        )}
        
        {message.sender === 'bot' && !message.isGenerating && (
          <div className="flex mt-3 pt-2 border-t border-gray-100 text-gray-400 justify-between">
            <div className="flex space-x-2">
              <div className="relative group">
                <button 
                  onClick={() => onFeedback(message.id, 'like')}
                  className={`p-1 rounded-md transition-colors hover:text-blue-600 hover:bg-blue-50 ${message.liked ? 'text-blue-600 bg-blue-50' : ''}`}
                  aria-label="Like this response"
                >
                  <ThumbsUp size={18} />
                </button>
                <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Helpful
                </span>
              </div>
              
              <div className="relative group">
                <button 
                  onClick={() => onFeedback(message.id, 'dislike')}
                  className={`p-1 rounded-md transition-colors hover:text-red-600 hover:bg-red-50 ${message.disliked ? 'text-red-600 bg-red-50' : ''}`}
                  aria-label="Dislike this response"
                >
                  <ThumbsDown size={18} />
                </button>
                <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Not helpful
                </span>
              </div>
              
              <div className="relative group">
                <button 
                  onClick={() => handleCopy(message.content)}
                  className={`p-1 rounded-md transition-colors hover:text-blue-600 hover:bg-blue-50`}
                  aria-label="Copy response"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied ? 'Copied!' : 'Copy text'}
                </span>
              </div>
            </div>
            
            <div className="relative group">
              <button 
                onClick={() => onRegenerate(message.id)}
                className="p-1 rounded-md transition-colors hover:text-blue-600 hover:bg-blue-50 flex items-center text-xs"
                aria-label="Regenerate response"
              >
                <RotateCcw size={16} className="mr-1" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
              <span className="absolute -top-8 right-0 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Generate new response
              </span>
            </div>
          </div>
        )}
      </div>
      
      {message.sender === 'user' && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage; 