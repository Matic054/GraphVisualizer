import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import GraphVisualizer from './components/GraphVisualizer';

const App = () => {
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleFileParsed = (parsedVertices, parsedEdges) => {
    setVertices(parsedVertices);
    setEdges(parsedEdges);
  };

  return (
    <div>
      <h1>Graph Visualizer</h1>
      <FileUpload onFileParsed={handleFileParsed} />
      <GraphVisualizer initialVertices={vertices} initialEdges={edges} />
    </div>
  );
};

export default App;


