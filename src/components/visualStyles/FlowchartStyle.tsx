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

  let currentY = 80;
  let nodeId = 1;

  // 2. Meeting topic
  nodes.push({
    id: `node-${nodeId}`,
    type: 'default',
    position: { x: 400, y: currentY },
    data: {
      label: summary.title.slice(0, 30),
      description: 'Meeting Topic'
    },
    style: {
      background: '#3b82f6',
      color: 'white',
      border: '2px solid #2563eb',
      borderRadius: '8px',
      padding: '15px',
      fontWeight: 'bold',
      width: 200,
      textAlign: 'center',
    },
  });

  edges.push({
    id: `e-start-${nodeId}`,
    source: 'start',
    target: `node-${nodeId}`,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  });

  currentY += 100;
  nodeId++;

  // 3. Executive summary
  nodes.push({
    id: `node-${nodeId}`,
    type: 'default',
    position: { x: 400, y: currentY },
    data: {
      label: 'Executive Summary',
      description: summary.summary.slice(0, 100) + '...'
    },
    style: {
      background: '#8b5cf6',
      color: 'white',
      border: '2px solid #7c3aed',
      borderRadius: '8px',
      padding: '15px',
      width: 250,
      textAlign: 'center',
    },
  });

  edges.push({
    id: `e-${nodeId-1}-${nodeId}`,
    source: `node-${nodeId-1}`,
    target: `node-${nodeId}`,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6b7280', strokeWidth: 2 },
    label: 'discuss',
  });

  currentY += 120;
  nodeId++;

  // 4. Key decisions - diamond decision nodes
  const decisions = summary.keyDecisions || [];
  decisions.forEach((decision, index) => {
    const decisionId = `decision-${index}`;
    
    nodes.push({
      id: decisionId,
      type: 'default',
      position: { x: 400, y: currentY },
      data: { 
        label: decision.length > 40 ? decision.slice(0, 40) + '...' : decision,
        icon: '🔷'
      },
      style: {
        background: '#f59e0b',
        color: 'white',
        border: '2px solid #d97706',
        padding: '20px',
        width: 180,
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      },
    });
    
    edges.push({
      id: `e-prev-${decisionId}`,
      source: index === 0 ? `node-${nodeId-1}` : `decision-${index-1}`,
      target: decisionId,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 },
      label: index === 0 ? 'decide' : 'next',
    });
    
    currentY += 150;
  });
  
  // 5. Action items - parallel branches
  const actions = summary.actionItems || [];
  if (actions.length > 0) {
    const actionStartId = `node-${nodeId}`;

    nodes.push({
      id: actionStartId,
      type: 'default',
      position: { x: 400, y: currentY },
      data: {
        label: `Action Items (${actions.length})`,
        icon: '⚡'
      },
      style: {
        background: '#6366f1',
        color: 'white',
        border: '2px solid #4f46e5',
        borderRadius: '8px',
        padding: '15px',
        fontWeight: 'bold',
        width: 180,
      },
    });

    edges.push({
      id: `e-to-actions`,
      source: decisions.length > 0 ? `decision-${decisions.length-1}` : `node-${nodeId-1}`,
      target: actionStartId,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 },
    });

    currentY += 100;
    nodeId++;

    // Action item detail nodes - horizontal layout
    const actionSpacing = 220;
    const startX = 400 - ((actions.length - 1) * actionSpacing) / 2;

    actions.forEach((action, index) => {
      const actionId = `action-${index}`;
      const priorityColor = action.priority === 'high' ? '#ef4444' :
                           action.priority === 'medium' ? '#f59e0b' : '#10b981';

      nodes.push({
        id: actionId,
        type: 'default',
        position: { x: startX + index * actionSpacing, y: currentY },
        data: {
          label: action.task.slice(0, 40),
          description: `Owner: ${action.owner}${action.deadline ? ' | Due: ' + action.deadline : ''}`,
          priority: action.priority
        },
        style: {
          background: priorityColor + '20',
          color: priorityColor,
          border: `2px solid ${priorityColor}`,
          borderRadius: '8px',
          padding: '12px',
          width: 200,
          fontSize: '12px',
        },
      });

      edges.push({
        id: `e-action-${index}`,
        source: actionStartId,
        target: actionId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: priorityColor, strokeWidth: 2 },
        label: action.priority,
      });
    });

    currentY += 120;
  }

  // 6. Timeline
  const phases = summary.timeline || [];
  if (phases.length > 0) {
    const timelineId = `node-${nodeId}`;
    
    nodes.push({
      id: timelineId,
      type: 'default',
      position: { x: 400, y: currentY },
      data: { 
        label: 'Timeline',
        icon: '📅'
      },
      style: {
        background: '#06b6d4',
        color: 'white',
        border: '2px solid #0891b2',
        borderRadius: '50px',
        padding: '15px 30px',
        fontWeight: 'bold',
        width: 150,
      },
    });
    
    const lastActionId = actions.length > 0 ? `action-${Math.floor(actions.length/2)}` : 
                        decisions.length > 0 ? `decision-${decisions.length-1}` : `node-${nodeId-1}`;
    
    edges.push({
      id: `e-to-timeline`,
      source: lastActionId,
      target: timelineId,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6b7280', strokeWidth: 2 },
    });
    
    currentY += 100;
    nodeId++;
    
    // Phase nodes - horizontal layout
    const phaseSpacing = 180;
    const startX = 400 - ((phases.length - 1) * phaseSpacing) / 2;

    phases.forEach((phase, index) => {
      const phaseId = `phase-${index}`;

      nodes.push({
        id: phaseId,
        type: 'default',
        position: { x: startX + index * phaseSpacing, y: currentY },
        data: {
          label: phase.name,
          description: `${phase.duration} | ${phase.owner}`
        },
        style: {
          background: `hsl(${200 + index * 40}, 70%, 50%)`,
          color: 'white',
          border: '2px solid white',
          borderRadius: '50%',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
        },
      });

      edges.push({
        id: `e-phase-${index}`,
        source: timelineId,
        target: phaseId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#6b7280', strokeWidth: 2 },
      });

      if (index > 0) {
        edges.push({
          id: `e-phase-conn-${index}`,
          source: `phase-${index-1}`,
          target: phaseId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#9ca3af', strokeWidth: 1 },
        });
      }
    });

    currentY += 120;
  }

  // 7. End node
  nodes.push({
    id: 'end',
    type: 'output',
    position: { x: 400, y: currentY },
    data: { label: 'End', icon: '⏹️' },
    style: {
      background: '#ef4444',
      color: 'white',
      border: '2px solid #dc2626',
      borderRadius: '50px',
      padding: '10px 20px',
      fontWeight: 'bold',
      width: 120,
    },
  });
  
  const lastNodeId = phases.length > 0 ? `phase-${Math.floor(phases.length/2)}` :
                    actions.length > 0 ? `action-${Math.floor(actions.length/2)}` :
                    decisions.length > 0 ? `decision-${decisions.length-1}` : `node-${nodeId-1}`;
  
  edges.push({
    id: `e-to-end`,
    source: lastNodeId,
    target: 'end',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6b7280', strokeWidth: 2 },
  });
  
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
