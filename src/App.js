import React, { useState } from 'react';
import GraphVisualizer from './components/GraphVisualizer';
import FileUpload from './components/FileUpload';
import NavBar from './components/NavBar';
import AdjacencyMatrixView from './components/AdjacencyMatrixView';
import TextView from './components/TextView';
import './App.css';

const App = () => {
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sentenceMapping, setSentenceMapping] = useState({});
  const [textView, setTextView] = useState(false);
  const [fileText, setText] = useState('');
  const [view, setView] = useState('graph');

  const handleFileParsed = (parsedVertices, parsedEdges, fileText) => {
    setVertices(parsedVertices);
    setEdges(parsedEdges);
    setText(fileText);
  };

  const handleTextFileParsed = (parsedVertices, parsedEdges, sentenceMapping, fileText) => {
    setVertices(parsedVertices);
    setEdges(parsedEdges);
    setSentenceMapping(sentenceMapping);
    setText(fileText);
  };

  const updateEdges = (sourceId, targetId, weight) => {
    const source = vertices.find(vertex => vertex.id === sourceId);
    const target = vertices.find(vertex => vertex.id === targetId);
  
    if (source && target) {
      let updatedEdges = edges.map(edge => {
        if (edge.source.id === sourceId && edge.target.id === targetId) {
          return { ...edge, weight };
        }
        if (edge.source.id === targetId && edge.target.id === sourceId && weight !== 0) {
          return { ...edge, weight, directed: false };
        }
        return edge;
      }).filter(edge => edge.weight !== 0);
  
      const oppositeEdgeIndex = updatedEdges.findIndex(edge => 
        edge.source.id === targetId && edge.target.id === sourceId
      );
  
      if (!updatedEdges.some(edge => edge.source.id === sourceId && edge.target.id === targetId)) {
        if (weight !== 0) {
          if (oppositeEdgeIndex !== -1) {
            // Make the opposite edge undirected
            updatedEdges[oppositeEdgeIndex] = { ...updatedEdges[oppositeEdgeIndex], directed: false };
            // Add the new undirected edge
            updatedEdges.push({ source, target, weight, directed: false });
          } else {
            // Add the new directed edge
            updatedEdges.push({ source, target, weight, directed: true });
          }
        }
      }
      setEdges(updatedEdges);
    }
  };
  
  const updateVertices = (nodeId) => {
    const nodeExists = vertices.some(vertex => vertex.id === nodeId);
  
    if (nodeExists) {
      // Remove the node and all its edges
      setVertices(vertices.filter(vertex => vertex.id !== nodeId));
      setEdges(edges.filter(edge => edge.source.id !== nodeId && edge.target.id !== nodeId));
    } else {
      // Add the new node
      setVertices([...vertices, { id: nodeId }]);
    }
  };    

  return ( 
  <div className="container">
  <h1>Graph Visualizer</h1>
  <NavBar currentView={view} setView={setView} />
  {(view === 'graph') && (
    <button onClick={() => setTextView(!textView)}>
      {(!textView) ? 'Switch to text upload' : 'Switch to graph upload'}
    </button>
  )}
      {(view === 'graph' && !textView) && (
        
        <div className="file-upload">
          {view === 'graph'}
          <p>Upload graph file:</p>
          <FileUpload onGraphParsed={handleFileParsed} />
          <GraphVisualizer
            initialVertices={vertices}
            initialEdges={edges}
            initialMapping={sentenceMapping}
            istext={false}
            updateEdges={updateEdges}
            updateVertices={updateVertices}
          />
        </div>
      )}
      {(view === 'graph' && textView) && (
        <div className="file-upload">
          {view === 'graph'}
          <p>Upload text file:</p>
          <FileUpload onGraphParsed={handleTextFileParsed} />

          <GraphVisualizer
            initialVertices={vertices}
            initialEdges={edges}
            initialMapping={sentenceMapping}
            istext={true}
            updateEdges={updateEdges}
            updateVertices={updateVertices}
          />
      </div>
      )}
      {view === 'matrix' && (
        <AdjacencyMatrixView 
          vertices={vertices} 
          edges={edges} 
          updateEdges={updateEdges} />
      )}
      {view === 'text' && <TextView text={fileText} />}
</div>
  );
};

export default App;


