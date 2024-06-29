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
    setEdges(prevEdges => {
      const updatedEdges = prevEdges.map(edge => {
        if (
          (edge.source.id === sourceId && edge.target.id === targetId) ||
          (edge.source.id === targetId && edge.target.id === sourceId)
        ) {
          return { ...edge, weight: weight, directed: weight === 0 ? true : edge.directed };
        }
        return edge;
      });

      return updatedEdges.filter(edge => edge.weight !== 0);
    });
  };

  return ( 
  <div className="container">
  <h1>Graph Visualizer</h1>
  <NavBar currentView={view} setView={setView} />
      {(view === 'graph' && !textView) && (
        
        <div className="file-upload">
          {view === 'graph' && 
          <button onClick={() => setTextView(!textView)}>
            {(!textView) ? 'Switch to text upload' : 'Switch to graph upload'}
          </button>}
          <p>Upload graph file:</p>
          <FileUpload onGraphParsed={handleFileParsed} />
          <GraphVisualizer
            initialVertices={vertices}
            initialEdges={edges}
            initialMapping={sentenceMapping}
            istext={false}
          />
        </div>
      )}
      {(view === 'graph' && textView) && (
        <div className="file-upload">
          {view === 'graph' && 
          <button onClick={() => setTextView(!textView)}>
            {(!textView) ? 'Switch to text upload' : 'Switch to graph upload'}
          </button>}
          <p>Upload text file:</p>
          <FileUpload onGraphParsed={handleTextFileParsed} />

          <GraphVisualizer
            initialVertices={vertices}
            initialEdges={edges}
            initialMapping={sentenceMapping}
            istext={true}
          />
      </div>
      )}
      {view === 'matrix' && (
        <AdjacencyMatrixView vertices={vertices} edges={edges} updateEdges={updateEdges} />
      )}
      {view === 'text' && <TextView text={fileText} />}
</div>
  );
};

export default App;


