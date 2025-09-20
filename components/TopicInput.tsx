
import React, { useState } from 'react';
import { ArrowRightIcon } from './Icons';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(topic);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full max-w-lg mx-auto">
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g., Quantum Physics, Roman History..."
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-shadow"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !topic}
        className="px-6 py-3 bg-cyan-600 text-white rounded-r-md font-semibold hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-[50px] w-[120px]"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            Start <ArrowRightIcon className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </form>
  );
};

export default TopicInput;
