import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualizer = ({ initialVertices, initialEdges, initialMapping, updateEdges, updateVertices, updateAllEdges, isnew, updateNew }) => {
  const [vertices, setVertices] = useState(initialVertices);
  const [edges, setEdges] = useState(initialEdges);
  const [sentenceMapping, setSentenceMapping] = useState(initialMapping);
  const firstEdges = useRef(initialEdges);
  const [isNew, setIsNew] = useState(isnew);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [selectedNodeToDelete, setSelectedNodeToDelete] = useState('');
  const [selectedEdgeToDelete, setSelectedEdgeToDelete] = useState('');
  const [linkDistance, setLinkDistance] = useState(150);
  const [chargeStrength, setChargeStrength] = useState(-500);
  const [textPar, setTextPar] = useState(1);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [algorithmParams, setAlgorithmParams] = useState({});

  const svgRef = useRef();
  const simulationRef = useRef();

  const [speed, setSpeed] = useState(1000);
  const isAnimatingRef = useRef(false);

  const timeoutsRef = useRef([]);

  useEffect(() => {
    setVertices(initialVertices);
    setEdges(initialEdges);
    setSentenceMapping(initialMapping);
    //setFirstEdges(initialEdges);
    setIsNew(isnew);

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialVertices, initialEdges, initialMapping, isnew]);

  useEffect(() => {
    if (!vertices.length) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', 'end')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    simulationRef.current = d3.forceSimulation(vertices)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)
      .attr('marker-end', d => d.directed ? 'url(#end)' : null);

    const edgeLabels = svg.append('g')
      .selectAll('text')
      .data(edges)
      .enter().append('text')
      .attr('dy', -5)
      .attr('dx', 5)
      .attr('font-size', 12)
      .text(d => d.weight !== 1 ? d.weight : '');

    const node = svg.append('g')
      .selectAll('circle')
      .data(vertices)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
        .on('click', (event, d) => {
          if (sentenceMapping[d.id]!=null)
          alert(sentenceMapping[d.id]);
        });

    const text = svg.append('g')
      .selectAll('text')
      .data(vertices)
      .enter().append('text')
      .attr('dy', -15)
      .attr('dx', 15)
      .text(d => d.id);

    simulationRef.current.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      text
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      edgeLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
    });

    function dragstarted(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulationRef.current.stop();
  }, [vertices, edges, sentenceMapping, linkDistance, chargeStrength, dimensions]);

  const addNode = () => {
    const newNodeId = `v${vertices.length + 1}`;
    const newVertices = [...vertices, { id: newNodeId }];
    setVertices(newVertices);
    updateVertices(newNodeId);
  };

  const handleAddEdge = () => {
    const newEdge = { source: sourceNode, target: targetNode, weight: edgeWeight, directed: true };

    const oppositeEdgeIndex = edges.findIndex(edge => 
      edge.source.id === targetNode && edge.target.id === sourceNode && edge.weight === edgeWeight
    );

    if (oppositeEdgeIndex !== -1) {
      const updatedEdges = edges.map((edge, index) => {
        if (index === oppositeEdgeIndex || (edge.source.id === sourceNode && edge.target.id === targetNode && edge.weight === edgeWeight)) {
          return { ...edge, directed: false };
        }
        return edge;
      });
      setEdges(updatedEdges);
    } else {
      setEdges([...edges, newEdge]);
    }
    updateEdges(sourceNode, targetNode, edgeWeight);
  };

  const deleteNode = () => {
    const newVertices = vertices.filter(vertex => vertex.id !== selectedNodeToDelete);
    const newEdges = edges.filter(edge => edge.source.id !== selectedNodeToDelete && edge.target.id !== selectedNodeToDelete);
    setVertices(newVertices);
    setEdges(newEdges);
    updateVertices(selectedNodeToDelete);
  };

  const deleteEdge = () => {
    const [source, target] = selectedEdgeToDelete.split('-');
    const newEdges = edges.filter(edge => !(edge.source.id === source && edge.target.id === target));
    setEdges(newEdges);
    updateEdges(source, target, 0);
  };

  const handleAlgorithmChange = (e) => {
    setSelectedAlgorithm(e.target.value);
    setAlgorithmParams({});
  };

  const handleAlgorithmParamsChange = (e) => {
    const { name, value } = e.target;
    setAlgorithmParams(prevParams => ({ ...prevParams, [name]: value }));
  };

  const visualizeAlgorithm = () => {
    if (selectedAlgorithm === 'DFS') {
      visualizeDFS(algorithmParams.startNode);
    } else if (selectedAlgorithm === 'BFS') {
      visualizeBFS(algorithmParams.startNode);
    } else if (selectedAlgorithm === 'MST') {
      visualizeMST(vertices, edges);
    } else if (selectedAlgorithm === 'Dijkstra') {
      visualizeDijkstra(algorithmParams.startNode);
    }
  };  

  const visualizeDFS = (startNode) => {
    const visited = new Set();
    const dfsTraversal = [];
    const dfsEdges = [];
  
    const dfs = (node) => {
      visited.add(node);
      dfsTraversal.push(node);
      const neighbors = edges
        .filter(edge => edge.source.id === node)
        .map(edge => ({ target: edge.target.id, sourceEdge: edge }));
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.target)) {
          dfsEdges.push(neighbor.sourceEdge);
          dfs(neighbor.target);
        }
      }
    };
  
    dfs(startNode);
  
    isAnimatingRef.current = true;
  
    dfsTraversal.forEach((node, index) => {
      const timeoutId = setTimeout(() => {
        if (isAnimatingRef.current) {
          d3.selectAll('circle').filter(d => d.id === node).attr('fill', 'red');
        }
      }, index * speed);
      timeoutsRef.current.push(timeoutId);
    });
  
    dfsEdges.forEach((edge, index) => {
      const timeoutId = setTimeout(() => {
        if (isAnimatingRef.current) {
          d3.selectAll('line')
            .filter(d => (d.source.id === edge.source.id && d.target.id === edge.target.id) ||
              (d.source.id === edge.target.id && d.target.id === edge.source.id))
            .attr('stroke', 'red');
        }
      }, index * speed + 300); // Offset to ensure edges are colored after nodes
      timeoutsRef.current.push(timeoutId);
    });
  
    const finalTimeoutId = setTimeout(() => {
      if (isAnimatingRef.current) {
        d3.selectAll('circle').attr('fill', '#69b3a2');
        d3.selectAll('line').attr('stroke', '#999');
      }
    }, dfsTraversal.length * speed + 1000);
    timeoutsRef.current.push(finalTimeoutId);
  };  

  const visualizeBFS = (startNode) => {
    const visited = new Set();
    const queue = [startNode];
    const bfsTraversal = [];
    const bfsEdges = [];
  
    while (queue.length > 0) {
      const node = queue.shift();
      if (!visited.has(node)) {
        visited.add(node);
        bfsTraversal.push(node);
        const neighbors = edges
          .filter(edge => (edge.source.id === node && !visited.has(edge.target.id)))
          .map(edge => ({ target: edge.target.id, sourceEdge: edge }));
        for (const neighbor of neighbors) {
          if (!queue.some(n => n === neighbor.target)) bfsEdges.push(neighbor.sourceEdge);
          queue.push(neighbor.target);
        }
      }
    }

    isAnimatingRef.current = true;
  
    bfsTraversal.forEach((node, index) => {
      const timeoutId = setTimeout(() => {
        if (isAnimatingRef.current){
          d3.selectAll('circle').filter(d => d.id === node).attr('fill', 'red');
        }
      }, index * speed);
      timeoutsRef.current.push(timeoutId);
    });
  
    bfsEdges.forEach((edge, index) => {
      const timeoutId = setTimeout(() => {
        if (isAnimatingRef.current){
          d3.selectAll('line')
            .filter(d => (d.source.id === edge.source.id && d.target.id === edge.target.id) ||
            (d.source.id === edge.target.id && d.target.id === edge.source.id))
            .attr('stroke', 'red');
        }
      }, index * speed); 
      timeoutsRef.current.push(timeoutId);
    });
  
    const finalTimeoutId = setTimeout(() => {
      if (isAnimatingRef.current){
        d3.selectAll('circle').attr('fill', '#69b3a2');
        d3.selectAll('line').attr('stroke', '#999');
      }
    }, bfsTraversal.length * speed + 1000);
    timeoutsRef.current.push(finalTimeoutId);
  };  

  const visualizeMST = (vertices, edges) => {
    // Union-Find (Disjoint Set) data structure
    class UnionFind {
      constructor(size) {
        this.parent = Array(size).fill(0).map((_, index) => index);
        this.rank = Array(size).fill(0);
      }
  
      find(node) {
        if (this.parent[node] !== node) {
          this.parent[node] = this.find(this.parent[node]);
        }
        return this.parent[node];
      }
  
      union(node1, node2) {
        const root1 = this.find(node1);
        const root2 = this.find(node2);
  
        if (root1 !== root2) {
          if (this.rank[root1] > this.rank[root2]) {
            this.parent[root2] = root1;
          } else if (this.rank[root1] < this.rank[root2]) {
            this.parent[root1] = root2;
          } else {
            this.parent[root2] = root1;
            this.rank[root1]++;
          }
        }
      }
    }
  
    const unionFind = new UnionFind(vertices.length);
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const mstEdges = [];
  
    sortedEdges.forEach((edge) => {
      const sourceIndex = vertices.findIndex(v => v.id === edge.source.id);
      const targetIndex = vertices.findIndex(v => v.id === edge.target.id);
      if (unionFind.find(sourceIndex) !== unionFind.find(targetIndex)) {
        unionFind.union(sourceIndex, targetIndex);
        mstEdges.push(edge);
      }
    });

    isAnimatingRef.current = true;
  
    mstEdges.forEach((edge, index) => {
      const timeoutId = setTimeout(() => {
        if (isAnimatingRef.current){
          d3.selectAll('line')
            .filter(d => 
              (d.source.id === edge.source.id && d.target.id === edge.target.id) ||
              (d.source.id === edge.target.id && d.target.id === edge.source.id)
            )
            .attr('stroke', 'red');
        }
      }, index * speed);
      timeoutsRef.current.push(timeoutId);
    });
  
    const finalTimeoutId = setTimeout(() => {
      if (isAnimatingRef.current){
        d3.selectAll('circle').attr('fill', '#69b3a2');
        d3.selectAll('line').attr('stroke', '#999');
      }
    }, mstEdges.length * speed + 1000);
    timeoutsRef.current.push(finalTimeoutId);
  };

  const visualizeDijkstra = (startNode) => {
    const distances = {};
    const prev = {};
    const nodes = new Set(vertices.map(v => v.id));
  
    vertices.forEach(v => {
      distances[v.id] = Infinity;
      prev[v.id] = null;
    });
    distances[startNode] = 0;
  
    const edgesCopy = [...edges];
  
    while (nodes.size > 0) {
      let minNode = null;
      nodes.forEach(node => {
        if (minNode === null || distances[node] < distances[minNode]) {
          minNode = node;
        }
      });
  
      if (distances[minNode] === Infinity) {
        break;
      }
  
      nodes.delete(minNode);
  
      edgesCopy.forEach(edge => {
        if (edge.source.id === minNode) {
          const neighbor = edge.target.id;
          const newDist = distances[minNode] + edge.weight;
          if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist;
            prev[neighbor] = { node: minNode, edge };
          }
        }
      });
    }
  
    const pathEdges = [];
    vertices.forEach(v => {
      let node = v.id;
      while (prev[node] !== null) {
        pathEdges.push(prev[node].edge);
        node = prev[node].node;
      }
    });

    isAnimatingRef.current = true;
  
    pathEdges.forEach((edge, index) => {
      const timeoutId = setTimeout(() => {
        if (isAnimatingRef.current){
          d3.selectAll('line')
            .filter(d => 
              (d.source.id === edge.source.id && d.target.id === edge.target.id) ||
              (d.source.id === edge.target.id && d.target.id === edge.source.id)
            )
            .attr('stroke', 'red');
        }
      }, index * speed);
      timeoutsRef.current.push(timeoutId);
    });

    const finalTimeoutId = setTimeout(() => {
      if (isAnimatingRef.current){
        d3.selectAll('circle').attr('fill', '#69b3a2');
        d3.selectAll('line').attr('stroke', '#999');
      }
    }, pathEdges.length * speed + 1000);
    timeoutsRef.current.push(finalTimeoutId);
  };  

  const downloadGraph = () => {
    // Format vertices
    const vertexStrings = vertices.map(vertex => vertex.id).join(',');
  
    // Format edges
    const edgeStrings = edges.map(edge => `(${edge.source.id},${edge.weight},${edge.target.id})`).join(',');
  
    // Get current date
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
  
    // Create the content string
    const content = `V={${vertexStrings}}\nE={${edgeStrings}}\nLast_modified: ${formattedDate}`;
  
    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
  
    // Create a link element and trigger a download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'graph.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateTextGraph = (par) =>{
    if (isNew){
      firstEdges.current = edges;
      updateNew();
    } 
    setTextPar(par);
    const newEdges = firstEdges.current.filter(edge => (edge.weight >= par));
    setEdges(newEdges);
    updateAllEdges(newEdges);
  } 

  const stopAnimation = () => {
    isAnimatingRef.current = false;
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current = [];
    d3.selectAll('circle').attr('fill', '#69b3a2');
    d3.selectAll('line').attr('stroke', '#999');
  };
  
  return (
    <div className="graph-visualizer">
      <svg ref={svgRef} width={dimensions.width/2} height={dimensions.height/1.5}></svg>
      <div className="graph-visualizer-row">
        <div>
          <label>
            Select Algorithm:
            <select value={selectedAlgorithm} onChange={handleAlgorithmChange}>
              <option value="">Select Algorithm</option>
              <option value="DFS">DFS</option>
              <option value="BFS">BFS</option>
              <option value="MST">MST</option>
              <option value="Dijkstra">Dijkstra</option>
            </select>
          </label>
          {selectedAlgorithm && (
            <div>
              {(selectedAlgorithm === 'DFS' || selectedAlgorithm === 'BFS' || selectedAlgorithm === 'Dijkstra') && (
                <div>
                  <label>
                    Start Node:
                    <select
                      name="startNode"
                      value={algorithmParams.startNode || ''}
                      onChange={handleAlgorithmParamsChange}
                    >
                      <option value="">Select Start Node</option>
                      {vertices.map(vertex => (
                        <option key={vertex.id} value={vertex.id}>
                          {vertex.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button onClick={visualizeAlgorithm}>Visualize {selectedAlgorithm}</button>
                </div>
              )}
              {selectedAlgorithm === 'MST' && (
                <div>
                  <button onClick={visualizeAlgorithm}>Visualize MST</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label>
            Animation speed: {speed}
            <input
              type="range"
              min="100"
              max="2000"
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div>
          {isAnimatingRef && (
            <button onClick={stopAnimation}>Stop Animation</button>
          )}
        </div>
        <div>
          <label>
            Source Node:
            <select value={sourceNode} onChange={e => setSourceNode(e.target.value)}>
              <option value="">Select Source</option>
              {vertices.map(vertex => (
                <option key={vertex.id} value={vertex.id}>
                  {vertex.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target Node:
            <select value={targetNode} onChange={e => setTargetNode(e.target.value)} disabled={!sourceNode}>
              <option value="">Select Target</option>
              {vertices
                .filter(vertex => vertex.id !== sourceNode)
                .map(vertex => (
                  <option key={vertex.id} value={vertex.id}>
                    {vertex.id}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Edge Weight:
            <input
              type="number"
              value={edgeWeight}
              onChange={e => setEdgeWeight(parseFloat(e.target.value))}
              min="1"
            />
          </label>
          <button onClick={handleAddEdge}>Add Edge</button>
        </div>
        <div>
          <label>
            Node to Delete:
            <select value={selectedNodeToDelete} onChange={e => setSelectedNodeToDelete(e.target.value)}>
              <option value="">Select Node</option>
              {vertices.map(vertex => (
                <option key={vertex.id} value={vertex.id}>
                  {vertex.id}
                </option>
              ))}
            </select>
          </label>
          <button onClick={deleteNode}>Delete Node</button>
        </div>
        <div>
          <label>
            Edge to Delete:
            <select value={selectedEdgeToDelete} onChange={e => setSelectedEdgeToDelete(e.target.value)}>
              <option value="">Select Edge</option>
              {edges.map(edge => (
                <option 
                  key={`${typeof edge.source === 'string' ? edge.source : edge.source.id}-${typeof edge.target === 'string' ? edge.target : edge.target.id}`} 
                  value={`${typeof edge.source === 'string' ? edge.source : edge.source.id}-${typeof edge.target === 'string' ? edge.target : edge.target.id}`}
                >
                  {`${typeof edge.source === 'string' ? edge.source : edge.source.id} -> ${typeof edge.target === 'string' ? edge.target : edge.target.id}`}
                </option>
              ))}
            </select>
          </label>
          <button onClick={deleteEdge}>Delete Edge</button>
        </div>
        <div>
          <label>
            Link Distance: {linkDistance}
            <input
              type="range"
              min="50"
              max="300"
              value={linkDistance}
              onChange={e => setLinkDistance(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            Charge Strength: {chargeStrength}
            <input
              type="range"
              min="-1000"
              max="0"
              value={chargeStrength}
              onChange={e => setChargeStrength(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div>
          <button onClick={addNode}>Add Node</button>
        </div>
        <div>
          <label>
            Connectivity parameter:
            <input
              type="number"
              value={textPar}
              onChange={e => updateTextGraph(parseFloat(e.target.value))}
              min="1"
            />
          </label>
        </div>
        <div>
          <button onClick={downloadGraph}>Download Graph</button>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;







