import React, { useState } from 'react';
import { solveMathWithGemini } from '../services/geminiService';
import { Loader2, Sparkles, Send } from 'lucide-react';

interface SmartInputProps {
  onResult: (expression: string, result: string) => void;
}

const SmartInput: React.FC<SmartInputProps> = ({ onResult }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await solveMathWithGemini(input);
      onResult(input, result);
      setInput('');
    } catch (error) {
      console.error("Failed to solve:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mb-4 relative z-10">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Sparkles className={`h-5 w-5 ${isLoading ? 'text-indigo-400 animate-pulse' : 'text-gray-400 group-focus-within:text-indigo-400'}`} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini (e.g., 'sqrt of 134 + 5')"
          className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute inset-y-1 right-1 px-3 flex items-center justify-center bg-gray-700 hover:bg-indigo-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default SmartInput;
