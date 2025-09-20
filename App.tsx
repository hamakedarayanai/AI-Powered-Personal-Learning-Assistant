
import React, { useState, useCallback } from 'react';
import { GraphData, GraphNode } from './types';
import { generateKnowledgeGraph } from './services/geminiService';
import TopicInput from './components/TopicInput';
import KnowledgeGraph from './components/KnowledgeGraph';
import LearningPane from './components/LearningPane';
import ChatPane from './components/ChatPane';
import { BrainCircuitIcon } from './components/Icons';

export default function App(): React.ReactElement {
  const [topic, setTopic] = useState<string>('');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopicSubmit = useCallback(async (newTopic: string) => {
    if (!newTopic.trim()) return;
    setIsGeneratingGraph(true);
    setTopic(newTopic);
    setGraphData(null);
    setSelectedNode(null);
    setError(null);
    try {
      const data = await generateKnowledgeGraph(newTopic);
      setGraphData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate knowledge graph. Please try again.');
    } finally {
      setIsGeneratingGraph(false);
    }
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (graphData) {
      const node = graphData.nodes.find(n => n.id === nodeId);
      setSelectedNode(node || null);
    }
  }, [graphData]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="flex items-center p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <BrainCircuitIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="ml-3 text-2xl font-bold text-white">AI Personal Learning Assistant</h1>
      </header>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Left Pane: Chat */}
        <div className="w-1/4 min-w-[350px] max-w-[450px] flex flex-col border-r border-gray-700">
          <ChatPane topic={topic} selectedConcept={selectedNode?.id ?? null} />
        </div>

        {/* Center Pane: Graph & Input */}
        <main className="flex-grow flex flex-col items-center justify-center p-4 relative bg-grid-gray-700/[0.2]">
          {!graphData && !isGeneratingGraph && (
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-gray-200 mb-4">Unlock Your Learning Potential</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Enter a topic to generate an interactive knowledge graph and start your personalized learning journey.</p>
              <TopicInput onSubmit={handleTopicSubmit} isLoading={isGeneratingGraph} />
            </div>
          )}
          
          {isGeneratingGraph && (
            <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-gray-300">Generating knowledge graph for "{topic}"...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment.</p>
            </div>
          )}

          {error && <p className="text-red-400">{error}</p>}
          
          {graphData && (
             <div className="w-full h-full flex flex-col">
              <div className="p-2 text-center">
                <h2 className="text-xl font-bold">Knowledge Graph: <span className="text-cyan-400">{topic}</span></h2>
                <p className="text-sm text-gray-400">Click on a node to learn more about a concept.</p>
              </div>
              <div className="flex-grow w-full h-full rounded-lg">
                <KnowledgeGraph 
                  data={graphData} 
                  onNodeClick={handleNodeClick} 
                  selectedNodeId={selectedNode?.id || null} 
                />
              </div>
            </div>
          )}
        </main>
        
        {/* Right Pane: Learning Content */}
        <aside className="w-1/3 min-w-[400px] max-w-[600px] flex flex-col border-l border-gray-700 bg-gray-800/30">
          <LearningPane topic={topic} concept={selectedNode?.id || null} />
        </aside>
      </div>
    </div>
  );
}
