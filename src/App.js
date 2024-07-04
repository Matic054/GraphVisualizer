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
  const [isNew, setIsNew] = useState(false);

  const handleFileParsed = (parsedVertices, parsedEdges, sentenceMapping, fileText, isText) => {
    setVertices(parsedVertices);
    setEdges(parsedEdges);
    setSentenceMapping(sentenceMapping);
    setText(fileText);
    setTextView(isText);
    setIsNew(true);
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
            updatedEdges[oppositeEdgeIndex] = { ...updatedEdges[oppositeEdgeIndex], directed: false };
            updatedEdges.push({ source, target, weight, directed: false });
          } else {
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
      setVertices(vertices.filter(vertex => vertex.id !== nodeId));
      setEdges(edges.filter(edge => edge.source.id !== nodeId && edge.target.id !== nodeId));
    } else {
      setVertices([...vertices, { id: nodeId }]);
    }
  };    

  const updateAllEdges = (newEdges) => {
    setEdges(newEdges);
  }

  const updateNew = () => {setIsNew(!isNew)}

  return ( 
  <div className="container">
  <h1>Graph Visualizer</h1>
  <NavBar currentView={view} setView={setView} />
      {(view === 'graph') && (
        
        <div className="file-upload">
          <div className="upload">
            <p>Upload file:</p>
            <FileUpload onGraphParsed={handleFileParsed} />
          </div>
          <GraphVisualizer
            initialVertices={vertices}
            initialEdges={edges}
            initialMapping={sentenceMapping}
            istext={textView}
            updateEdges={updateEdges}
            updateVertices={updateVertices}
            updateAllEdges={updateAllEdges}
            isnew={isNew}
            updateNew={updateNew}
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


