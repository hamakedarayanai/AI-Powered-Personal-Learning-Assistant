
import React, { useState, useEffect, useCallback } from 'react';
import { generateExplanation, generateExample, generateDiagram } from '../services/geminiService';
import { BookOpenIcon, LightBulbIcon, PhotographIcon, DocumentTextIcon } from './Icons';

interface LearningPaneProps {
  topic: string | null;
  concept: string | null;
}

type Tab = 'explanation' | 'example' | 'diagram';

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse p-4">
    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2 mt-6"></div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
  </div>
);

const LearningPane: React.FC<LearningPaneProps> = ({ topic, concept }) => {
  const [activeTab, setActiveTab] = useState<Tab>('explanation');
  const [content, setContent] = useState({ explanation: '', example: '', diagramUrl: '' });
  const [loading, setLoading] = useState({ explanation: false, example: false, diagram: false });
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async (contentType: Tab) => {
    if (!topic || !concept) return;

    setLoading(prev => ({ ...prev, [contentType]: true }));
    setError(null);

    try {
      let result = '';
      if (contentType === 'explanation') {
        result = await generateExplanation(topic, concept);
      } else if (contentType === 'example') {
        result = await generateExample(topic, concept);
      } else if (contentType === 'diagram') {
        result = await generateDiagram(topic, concept);
      }
      setContent(prev => ({ ...prev, [contentType === 'diagram' ? 'diagramUrl' : contentType]: result }));
    } catch (e) {
      console.error(`Failed to fetch ${contentType}`, e);
      setError(`Could not load ${contentType}. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [contentType]: false }));
    }
  }, [topic, concept]);
  
  useEffect(() => {
    if (concept) {
      setContent({ explanation: '', example: '', diagramUrl: '' });
      setActiveTab('explanation');
      fetchContent('explanation');
    } else {
      setContent({ explanation: '', example: '', diagramUrl: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept]);


  useEffect(() => {
    if (concept && activeTab === 'example' && !content.example && !loading.example) {
      fetchContent('example');
    }
    if (concept && activeTab === 'diagram' && !content.diagramUrl && !loading.diagram) {
      fetchContent('diagram');
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, concept, content, loading]);

  if (!concept) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
        <DocumentTextIcon className="w-16 h-16 mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold text-gray-300">Learning Panel</h3>
        <p className="mt-2">Select a concept from the knowledge graph to view detailed explanations, examples, and diagrams.</p>
      </div>
    );
  }

  const renderContent = () => {
    if (loading[activeTab]) return <LoadingSkeleton />;
    if (error) return <p className="text-red-400 p-4">{error}</p>;

    switch (activeTab) {
      case 'explanation':
        return <div className="prose prose-invert prose-p:text-gray-300 p-6 whitespace-pre-wrap">{content.explanation}</div>;
      case 'example':
        return <div className="prose prose-invert prose-p:text-gray-300 p-6 whitespace-pre-wrap">{content.example}</div>;
      case 'diagram':
        return content.diagramUrl ? <img src={content.diagramUrl} alt={`Diagram for ${concept}`} className="w-full h-auto object-contain p-4" /> : <p className="p-4 text-gray-400">No diagram available.</p>;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, icon, label }: {tab: Tab, icon: React.ReactNode, label: string}) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center p-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === tab 
        ? 'border-cyan-400 text-cyan-400' 
        : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">{concept}</h2>
        <p className="text-sm text-gray-400">in {topic}</p>
      </div>
      <div className="flex border-b border-gray-700">
        <TabButton tab="explanation" icon={<BookOpenIcon className="w-5 h-5"/>} label="Explanation" />
        <TabButton tab="example" icon={<LightBulbIcon className="w-5 h-5"/>} label="Example" />
        <TabButton tab="diagram" icon={<PhotographIcon className="w-5 h-5"/>} label="Diagram" />
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default LearningPane;
