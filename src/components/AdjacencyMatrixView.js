import React from 'react';

const AdjacencyMatrixView = ({ vertices, edges, updateEdges }) => {
  const matrix = createAdjacencyMatrix(vertices, edges);

  const handleCellClick = (i, j) => {
    const weight = prompt('Enter new weight (0 to remove edge):');
    updateEdges(vertices[i].id, vertices[j].id, parseInt(weight, 10));
  };

  return (
    <div className="adjacency-matrix-container">
      <table className="adjacency-matrix">
        <thead>
          <tr>
            <th></th>
            {vertices.map(vertex => (
              <th key={vertex.id}>{vertex.id}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={vertices[i].id}>
              <td>{vertices[i].id}</td>
              {row.map((cell, j) => (
                <td
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  className={cell !== 0 ? 'non-zero' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const createAdjacencyMatrix = (vertices, edges) => {
  const matrix = Array(vertices.length)
    .fill(0)
    .map(() => Array(vertices.length).fill(0));

  edges.forEach(edge => {
    const sourceIndex = vertices.findIndex(v => v.id === edge.source.id);
    const targetIndex = vertices.findIndex(v => v.id === edge.target.id);
    matrix[sourceIndex][targetIndex] = edge.weight;
    if (!edge.directed) {
      matrix[targetIndex][sourceIndex] = edge.weight;
    }
  });

  return matrix;
};

export default AdjacencyMatrixView;

