import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { MeetingSummary } from '../../types';

interface FlowchartStyleProps {
  summary: MeetingSummary;
}

// Node data type
interface FlowNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  icon?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Parse content to generate flowchart nodes and edges
function parseFlowchart(summary: MeetingSummary): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  const nodes: Node<FlowNodeData>[] = [];
  const edges: Edge[] = [];

  // Check if this is a decision-making meeting
  const text = (summary.summary + ' ' + summary.keyDecisions.join(' ')).toLowerCase();
  const isDecisionFlow = /option\s+[ab]|decide|choose|select|postgresql|mongodb|gcp|azure/i.test(text);

  // 1. Start node
  nodes.push({
    id: 'start',
    type: 'input',
    position: { x: 400, y: 0 },
    data: { label: 'Start', icon: '▶️' },
    style: {
      background: '#10b981',
      color: 'white',
      border: '2px solid #059669',
      borderRadius: '50px',
      padding: '10px 20px',
      fontWeight: 'bold',
      width: 120,
    },
  });

  // If it's a decision flow, create decision tree layout
  if (isDecisionFlow) {
    return parseDecisionFlowchart(summary, nodes, edges);
  }

  // Standard flowchart for non-decision meetings
  return parseStandardFlowchart(summary, nodes, edges);
}

// Parse decision-making flowchart with branches
function parseDecisionFlowchart(summary: MeetingSummary, nodes: Node<FlowNodeData>[], edges: Edge[]): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  let currentY = 80;

  // Topic node
  nodes.push({
    id: 'topic',
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: summary.title, description: 'Decision Topic' },
    style: {
      background: '#3b82f6', color: 'white', border: '2px solid #2563eb',
      borderRadius: '8px', padding: '15px', fontWeight: 'bold', width: 220, textAlign: 'center',
    },
  });
  edges.push({ id: 'e-start-topic', source: 'start', target: 'topic', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

  currentY += 100;

  // Decision 1: Database Selection
  nodes.push({
    id: 'decision-db',
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: 'Database\nTechnology?', icon: '🔷' },
    style: {
      background: '#f59e0b', color: 'white', border: '2px solid #d97706',
      width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    },
  });
  edges.push({ id: 'e-topic-db', source: 'topic', target: 'decision-db', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

  currentY += 140;

  // Database Options - horizontal layout
  const dbY = currentY;
  
  // Option A: PostgreSQL
  nodes.push({
    id: 'db-postgres',
    type: 'default',
    position: { x: 250, y: dbY },
    data: { label: 'Option A\nPostgreSQL', description: 'Relational Data' },
    style: {
      background: '#10b981', color: 'white', border: '2px solid #059669',
      borderRadius: '8px', padding: '12px', width: 140, textAlign: 'center', fontSize: '12px',
    },
  });
  edges.push({ id: 'e-db-postgres', source: 'decision-db', target: 'db-postgres', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 }, label: 'Option A' });

  // Option B: MongoDB
  nodes.push({
    id: 'db-mongo',
    type: 'default',
    position: { x: 550, y: dbY },
    data: { label: 'Option B\nMongoDB', description: 'Flexibility' },
    style: {
      background: '#6b7280', color: 'white', border: '2px solid #4b5563',
      borderRadius: '8px', padding: '12px', width: 140, textAlign: 'center', fontSize: '12px',
    },
  });
  edges.push({ id: 'e-db-mongo', source: 'decision-db', target: 'db-mongo', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af', strokeWidth: 2 }, label: 'Option B' });

  currentY += 120;

  // Merge node - Selected PostgreSQL
  nodes.push({
    id: 'selected-db',
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: 'Selected:\nPostgreSQL', icon: '✓' },
    style: {
      background: '#10b981', color: 'white', border: '3px solid #059669',
      borderRadius: '8px', padding: '12px', width: 140, textAlign: 'center', fontWeight: 'bold',
    },
  });
  edges.push({ id: 'e-postgres-selected', source: 'db-postgres', target: 'selected-db', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#10b981', strokeWidth: 3 } });

  currentY += 100;

  // Decision 2: Cloud Provider
  nodes.push({
    id: 'decision-cloud',
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: 'Cloud\nProvider?', icon: '☁️' },
    style: {
      background: '#f59e0b', color: 'white', border: '2px solid #d97706',
      width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    },
  });
  edges.push({ id: 'e-selected-cloud', source: 'selected-db', target: 'decision-cloud', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

  currentY += 140;

  // Cloud Options - horizontal layout
  const cloudY = currentY;

  // Option A: GCP
  nodes.push({
    id: 'cloud-gcp',
    type: 'default',
    position: { x: 250, y: cloudY },
    data: { label: 'Option A\nGCP', description: 'Better Services' },
    style: {
      background: '#3b82f6', color: 'white', border: '2px solid #2563eb',
      borderRadius: '8px', padding: '12px', width: 140, textAlign: 'center', fontSize: '12px',
    },
  });
  edges.push({ id: 'e-cloud-gcp', source: 'decision-cloud', target: 'cloud-gcp', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 }, label: 'Option A' });

  // Option B: Azure
  nodes.push({
    id: 'cloud-azure',
    type: 'default',
    position: { x: 550, y: cloudY },
    data: { label: 'Option B\nAzure', description: 'Enterprise Support' },
    style: {
      background: '#6b7280', color: 'white', border: '2px solid #4b5563',
      borderRadius: '8px', padding: '12px', width: 140, textAlign: 'center', fontSize: '12px',
    },
  });
  edges.push({ id: 'e-cloud-azure', source: 'decision-cloud', target: 'cloud-azure', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#9ca3af', strokeWidth: 2 }, label: 'Option B' });

  currentY += 120;

  // Final Decision
  nodes.push({
    id: 'final-decision',
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: 'Final Decision', description: 'PostgreSQL on GCP' },
    style: {
      background: '#8b5cf6', color: 'white', border: '3px solid #7c3aed',
      borderRadius: '8px', padding: '15px', width: 180, textAlign: 'center', fontWeight: 'bold',
    },
  });
  edges.push({ id: 'e-gcp-final', source: 'cloud-gcp', target: 'final-decision', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#3b82f6', strokeWidth: 3 } });

  currentY += 100;

  // End node
  nodes.push({
    id: 'end',
    type: 'output',
    position: { x: 400, y: currentY },
    data: { label: 'End', icon: '⏹️' },
    style: { background: '#ef4444', color: 'white', border: '2px solid #dc2626', borderRadius: '50px', padding: '10px 20px', fontWeight: 'bold', width: 120 },
  });
  edges.push({ id: 'e-final-end', source: 'final-decision', target: 'end', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

  return { nodes, edges };
}

// Standard flowchart for regular meetings
function parseStandardFlowchart(summary: MeetingSummary, nodes: Node<FlowNodeData>[], edges: Edge[]): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
  let currentY = 80;
  let nodeId = 1;

  // Meeting topic
  nodes.push({
    id: `node-${nodeId}`,
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: summary.title.slice(0, 30), description: 'Meeting Topic' },
    style: {
      background: '#3b82f6', color: 'white', border: '2px solid #2563eb',
      borderRadius: '8px', padding: '15px', fontWeight: 'bold', width: 200, textAlign: 'center',
    },
  });
  edges.push({ id: `e-start-${nodeId}`, source: 'start', target: `node-${nodeId}`, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

  currentY += 100;
  nodeId++;

  // Executive summary
  nodes.push({
    id: `node-${nodeId}`,
    type: 'default',
    position: { x: 400, y: currentY },
    data: { label: 'Executive Summary', description: summary.summary.slice(0, 100) + '...' },
    style: {
      background: '#8b5cf6', color: 'white', border: '2px solid #7c3aed',
      borderRadius: '8px', padding: '15px', width: 250, textAlign: 'center',
    },
  });
  edges.push({ id: `e-${nodeId-1}-${nodeId}`, source: `node-${nodeId-1}`, target: `node-${nodeId}`, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 }, label: 'discuss' });

  currentY += 120;
  nodeId++;

  // Key decisions
  const decisions = summary.keyDecisions || [];
  decisions.forEach((decision, index) => {
    const decisionId = `decision-${index}`;
    nodes.push({
      id: decisionId,
      type: 'default',
      position: { x: 400, y: currentY },
      data: { label: decision.length > 40 ? decision.slice(0, 40) + '...' : decision, icon: '🔷' },
      style: {
        background: '#f59e0b', color: 'white', border: '2px solid #d97706', padding: '20px',
        width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      },
    });
    edges.push({
      id: `e-prev-${decisionId}`,
      source: index === 0 ? `node-${nodeId-1}` : `decision-${index-1}`,
      target: decisionId, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 }, label: index === 0 ? 'decide' : 'next',
    });
    currentY += 150;
  });

  // Action items
  const actions = summary.actionItems || [];
  if (actions.length > 0) {
    const actionStartId = `node-${nodeId}`;
    nodes.push({
      id: actionStartId,
      type: 'default',
      position: { x: 400, y: currentY },
      data: { label: `Action Items (${actions.length})`, icon: '⚡' },
      style: { background: '#6366f1', color: 'white', border: '2px solid #4f46e5', borderRadius: '8px', padding: '15px', fontWeight: 'bold', width: 180 },
    });
    edges.push({ id: 'e-to-actions', source: decisions.length > 0 ? `decision-${decisions.length-1}` : `node-${nodeId-1}`, target: actionStartId, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

    currentY += 100;
    nodeId++;

    const actionSpacing = 220;
    const startX = 400 - ((actions.length - 1) * actionSpacing) / 2;
    actions.forEach((action, index) => {
      const actionId = `action-${index}`;
      const priorityColor = action.priority === 'high' ? '#ef4444' : action.priority === 'medium' ? '#f59e0b' : '#10b981';
      nodes.push({
        id: actionId,
        type: 'default',
        position: { x: startX + index * actionSpacing, y: currentY },
        data: { label: action.task.slice(0, 40), description: `Owner: ${action.owner}${action.deadline ? ' | Due: ' + action.deadline : ''}`, priority: action.priority },
        style: { background: priorityColor + '20', color: priorityColor, border: `2px solid ${priorityColor}`, borderRadius: '8px', padding: '12px', width: 200, fontSize: '12px' },
      });
      edges.push({ id: `e-action-${index}`, source: actionStartId, target: actionId, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: priorityColor, strokeWidth: 2 }, label: action.priority });
    });
    currentY += 120;
  }

  // End node
  nodes.push({
    id: 'end',
    type: 'output',
    position: { x: 400, y: currentY },
    data: { label: 'End', icon: '⏹️' },
    style: { background: '#ef4444', color: 'white', border: '2px solid #dc2626', borderRadius: '50px', padding: '10px 20px', fontWeight: 'bold', width: 120 },
  });

  const lastNodeId = actions.length > 0 ? `action-${Math.floor(actions.length/2)}` : decisions.length > 0 ? `decision-${decisions.length-1}` : `node-${nodeId-1}`;
  edges.push({ id: 'e-to-end', source: lastNodeId, target: 'end', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6b7280', strokeWidth: 2 } });

  return { nodes, edges };
}

export function FlowchartStyle({ summary }: FlowchartStyleProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => parseFlowchart(summary),
    [summary]
  );
  
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => [...eds, { ...params, type: 'smoothstep' }]),
    [setEdges]
  );
  
  return (
    <div className="w-full h-[800px] bg-gray-50 rounded-xl border-2 border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.3}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Flowchart Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Start/End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500" />
            <span className="text-gray-600">Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 transform rotate-45 bg-amber-500" />
            <span className="text-gray-600">Decision</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-100 border border-red-400" />
            <span className="text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-100 border border-green-400" />
            <span className="text-gray-600">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
