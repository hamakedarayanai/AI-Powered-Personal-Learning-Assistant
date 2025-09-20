import React, { useRef, useEffect, memo } from 'react';
import type { GraphData } from '../types';

// D3 is loaded from a CDN, so we declare it as a global
declare const d3: any;

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // FIX: Initialize useRef with null to satisfy the requirement of passing an argument.
  const zoomRef = useRef<any>(null); // To store zoom behavior instance

  // Effect to build and simulate the graph, runs only when data changes
  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    // Clear previous graph
    svg.selectAll('*').remove();

    const links = data.links.map(d => ({...d}));
    const nodes = data.nodes.map(d => ({...d}));
    
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(0, 0))
        .force("x", d3.forceX())
        .force("y", d3.forceY());
        
    const g = svg.append('g');

    const link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", (d: any) => Math.sqrt(d.value));

    const node = g.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr('class', 'node-group')
      .attr('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
        onNodeClick(d.id);
        
        // Pan and zoom to the clicked node
        if (zoomRef.current) {
          const scale = 1.5;
          const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(scale)
            .translate(-d.x, -d.y);

          svg.transition()
            .duration(750)
            .call(zoomRef.current.transform, transform);
        }
      })
      .call(drag(simulation));

    node.append("circle")
        .attr("r", 10)
        .attr("fill", (d: any) => color(d.group));
        
    node.append("text")
        .attr("x", 15)
        .attr("y", "0.31em")
        .text((d: any) => d.id)
        .attr("fill", "#ddd")
        .attr("stroke", "none")
        .style("font-size", "14px")
        .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

      node
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom().on('zoom', (event: any) => {
        g.attr('transform', event.transform);
    });
    
    svg.call(zoom as any);
    zoomRef.current = zoom; // Save zoom instance to ref

  }, [data, onNodeClick]);

  // Effect to update node selection style, runs when selectedNodeId changes
  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll('.node-group')
      .classed('selected', (d: any) => d.id === selectedNodeId);

  }, [selectedNodeId]);


  const drag = (simulation: any) => {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <svg ref={svgRef}></svg>
    </div>
  );
};

export default memo(KnowledgeGraph);