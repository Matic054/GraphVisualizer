import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import GraphVisualizer from './components/GraphVisualizer';
import './App.css';

const App = () => {
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sentenceMapping, setSentenceMapping] = useState({});
  const [textView, setTextView] = useState(false);

  const handleFileParsed = (parsedVertices, parsedEdges) => {
    setVertices(parsedVertices);
    setEdges(parsedEdges);
  };

  const handleTextFileParsed = (parsedVertices, parsedEdges, sentenceMapping) => {
    setVertices(parsedVertices);
    setEdges(parsedEdges);
    setSentenceMapping(sentenceMapping);
  };

  return ( 
  <div className="container">
  <h1>Graph Visualizer</h1>
  <button onClick={() => setTextView(!textView)}>
    {textView ? 'Switch to Graph View' : 'Switch to Text View'}
  </button>
  {!textView ? (
    <div className="file-upload">
      <p>Upload graph file:</p>
      <FileUpload onGraphParsed={handleFileParsed} />
    </div>
  ) : (
    <div className="file-upload">
      <p>Upload text file:</p>
      <FileUpload onSentenceGraphParsed={handleTextFileParsed} />
    </div>
  )}
  <div className="graph-container">
    <GraphVisualizer
      initialVertices={vertices}
      initialEdges={edges}
      initialMapping={sentenceMapping}
    />
  </div>
</div>
  );
};

export default App;


