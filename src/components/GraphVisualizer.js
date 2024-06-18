import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphVisualizer = ({ vertices, edges }) => {
  const svgRef = useRef();

  useEffect(() => {
    console.log('Vertices:', vertices); // Logging vertices for debugging
    console.log('Edges:', edges); // Logging edges for debugging
    if (vertices.length > 0 && edges.length > 0) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      // Define arrow markers for directed edges
      svg.append('defs').selectAll('marker')
        .data(['end']) // You can add different types of markers here
        .enter().append('marker')
        .attr('id', 'end')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15) // Adjust this value based on the size of your nodes
        .attr('refY', 0)
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');

      const simulation = d3.forceSimulation(vertices)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(200)) // Increase link distance
        .force('charge', d3.forceManyBody().strength(-500)) // Increase repulsion
        .force('center', d3.forceCenter(width / 2, height / 2));

      // Process edges to handle bidirectional connections and edge weights
      const processedEdges = [];
      edges.forEach(edge => {
        const reversedEdge = edges.find(e => e.source === edge.target && e.target === edge.source);
        if (reversedEdge) {
          // If bidirectional edge exists, treat as undirected edge
          processedEdges.push({
            source: edge.source,
            target: edge.target,
            weight: edge.weight !== 1 ? edge.weight : null, // Display weight if not equal to 1
            undirected: true
          });
        } else {
          processedEdges.push({
            source: edge.source,
            target: edge.target,
            weight: edge.weight !== 1 ? edge.weight : null // Display weight if not equal to 1
          });
        }
      });

      const link = svg.append('g')
        .selectAll('line')
        .data(processedEdges)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(5) || 2) // Default width for undirected edges
        .attr('marker-end', d => d.undirected ? '' : 'url(#end)'); // Attach the arrow marker for directed edges

      const edgeLabels = svg.append('g')
        .selectAll('text')
        .data(processedEdges.filter(d => d.weight !== null))
        .enter().append('text')
        .attr('dy', -5)
        .attr('dx', 5)
        .attr('font-size', 12)
        .text(d => d.weight);

      const node = svg.append('g')
        .selectAll('circle')
        .data(vertices)
        .enter().append('circle')
        .attr('r', 20)
        .attr('fill', '#69b3a2')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      const text = svg.append('g')
        .selectAll('text')
        .data(vertices)
        .enter().append('text')
        .attr('dy', -15)
        .attr('dx', 15)
        .text(d => d.id);

      simulation.on('tick', () => {
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
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  }, [vertices, edges]);

  return <svg ref={svgRef} width="800" height="600"></svg>;
};

export default GraphVisualizer;


