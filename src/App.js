import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import GraphVisualizer from './components/GraphVisualizer';

const App = () => {
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sentenceMapping, setSentenceMapping] = useState({});

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
    <div>
      <h1>Graph Visualizer</h1>
      <FileUpload onGraphParsed={handleFileParsed} />
      <FileUpload onSentenceGraphParsed={handleTextFileParsed} />
      <GraphVisualizer initialVertices={vertices} initialEdges={edges} initialMapping={sentenceMapping} />
    </div>
  );
};

export default App;


