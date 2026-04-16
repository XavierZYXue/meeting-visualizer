import { useMemo } from 'react';
import type { MeetingSummary } from '../../types';

interface ArchitectureStyleProps {
  summary: MeetingSummary;
}

// 实体类型
interface Entity {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'client' | 'external' | 'queue' | 'cache';
  layer: 'presentation' | 'application' | 'domain' | 'infrastructure';
  description?: string;
}

interface Relationship {
  from: string;
  to: string;
  type: 'sync' | 'async' | 'dependency' | 'dataflow';
  label?: string;
}

// 解析架构实体和关系
function parseArchitecture(summary: MeetingSummary): { entities: Entity[]; relationships: Relationship[] } {
  const text = summary.summary + ' ' + summary.keyDecisions.join(' ') + ' ' + 
               summary.actionItems.map(a => a.task).join(' ');
  
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  
  // 1. 识别服务（Service A, B, C... 或 service a, b, c）
  const servicePattern = /(?:service|microservice|component)[\s:]+([A-Za-z][a-zA-Z0-9]*)/gi;
  const foundServices = new Set<string>();
  let match;
  while ((match = servicePattern.exec(text)) !== null) {
    const name = match[1].toUpperCase();
    if (!foundServices.has(name)) {
      foundServices.add(name);
      entities.push({
        id: `service-${name.toLowerCase()}`,
        name: `Service ${name}`,
        type: 'service',
        layer: 'application',
        description: ''
      });
    }
  }
  
  // 2. 识别前端
  if (/front\s*end|frontend|web|mobile|app|user\s*interface/i.test(text)) {
    entities.push({
      id: 'frontend',
      name: 'Frontend',
      type: 'client',
      layer: 'presentation',
      description: 'User Interface'
    });
  }
  
  // 3. 识别数据库
  const dbPattern = /(?:database|db|storage|postgres|mysql|mongo|redis)[\s:]+([A-Za-z][a-zA-Z0-9]*)?/gi;
  while ((match = dbPattern.exec(text)) !== null) {
    const name = match[1] || 'Primary';
    const id = `db-${name.toLowerCase()}`;
    if (!entities.find(e => e.id === id)) {
      entities.push({
        id,
        name: `Database ${name}`,
        type: 'database',
        layer: 'infrastructure',
        description: ''
      });
    }
  }
  
  // 4. 如果没有数据库但有服务，自动添加数据库
  const services = entities.filter(e => e.type === 'service');
  if (services.length > 0 && !entities.find(e => e.type === 'database')) {
    entities.push({
      id: 'db-primary',
      name: 'Database',
      type: 'database',
      layer: 'infrastructure',
      description: 'Data Storage'
    });
  }
  
  // 5. 提取关系
  const depPatterns = [
    { pattern: /([A-Za-z][a-zA-Z0-9]*)\s+(?:depends?\s+on|relies?\s+on)\s+([A-Za-z][a-zA-Z0-9]*)/gi, type: 'dependency' as const },
    { pattern: /([A-Za-z][a-zA-Z0-9]*)\s+(?:calls?|invokes?|uses?)\s+([A-Za-z][a-zA-Z0-9]*)/gi, type: 'sync' as const },
    { pattern: /([A-Za-z][a-zA-Z0-9]*)\s+(?:sends?|publishes?)\s+(?:to|for)\s+([A-Za-z][a-zA-Z0-9]*)/gi, type: 'async' as const },
    { pattern: /between\s+([A-Za-z][a-zA-Z0-9]*)\s+and\s+([A-Za-z][a-zA-Z0-9]*)/gi, type: 'dependency' as const },
  ];
  
  depPatterns.forEach(({ pattern, type }) => {
    while ((match = pattern.exec(text)) !== null) {
      const fromName = match[1].toUpperCase();
      const toName = match[2].toUpperCase();
      
      // 查找对应的服务ID
      const fromEntity = entities.find(e => e.name.includes(fromName));
      const toEntity = entities.find(e => e.name.includes(toName));
      
      if (fromEntity && toEntity) {
        relationships.push({ 
          from: fromEntity.id, 
          to: toEntity.id, 
          type, 
          label: type === 'dependency' ? 'depends' : type 
        });
      }
    }
  });
  
  // 6. 自动创建关系
  // Frontend -> 所有服务
  const frontend = entities.find(e => e.id === 'frontend');
  if (frontend && services.length > 0) {
    services.forEach(service => {
      if (!relationships.find(r => r.from === frontend.id && r.to === service.id)) {
        relationships.push({
          from: frontend.id,
          to: service.id,
          type: 'sync',
          label: 'HTTP/REST'
        });
      }
    });
  }
  
  // 服务之间如果没有关系，创建链式关系
  if (relationships.length === 0 && services.length >= 2) {
    for (let i = 0; i < services.length - 1; i++) {
      relationships.push({
        from: services[i].id,
        to: services[i + 1].id,
        type: 'dependency',
        label: 'depends'
      });
    }
  }
  
  // 所有服务 -> 数据库
  const database = entities.find(e => e.type === 'database');
  if (database) {
    services.forEach(service => {
      if (!relationships.find(r => r.from === service.id && r.to === database!.id)) {
        relationships.push({
          from: service.id,
          to: database.id,
          type: 'sync',
          label: 'SQL/TCP'
        });
      }
    });
  }
  
  return { entities, relationships };
}

// 架构节点组件
function ArchitectureNode({ entity }: { entity: Entity }) {
  const colors = {
    client: { bg: '#f59e0b', border: '#d97706', icon: '🖥️' },
    api: { bg: '#8b5cf6', border: '#7c3aed', icon: '🔌' },
    service: { bg: '#3b82f6', border: '#2563eb', icon: '⚙️' },
    database: { bg: '#10b981', border: '#059669', icon: '🗄️' },
    external: { bg: '#ef4444', border: '#dc2626', icon: '🔗' },
    queue: { bg: '#ec4899', border: '#db2777', icon: '📬' },
    cache: { bg: '#06b6d4', border: '#0891b2', icon: '⚡' },
  };
  
  const color = colors[entity.type];
  
  // 数据库 - 圆柱形
  if (entity.type === 'database') {
    return (
      <div className="flex flex-col items-center mx-4">
        <div 
          className="w-28 h-8 rounded-full border-2"
          style={{ backgroundColor: color.bg, borderColor: color.border }}
        />
        <div 
          className="w-28 h-20 -mt-4 flex flex-col items-center justify-center border-x-2"
          style={{ backgroundColor: color.bg, borderColor: color.border }}
        >
          <span className="text-3xl">{color.icon}</span>
          <span className="text-white text-sm font-bold mt-1">{entity.name}</span>
        </div>
        <div 
          className="w-28 h-8 -mt-4 rounded-full border-2 bg-white"
          style={{ borderColor: color.border }}
        />
      </div>
    );
  }
  
  // 客户端 - 大圆角
  if (entity.type === 'client') {
    return (
      <div 
        className="w-32 h-28 rounded-2xl flex flex-col items-center justify-center border-3 mx-4"
        style={{ 
          backgroundColor: color.bg, 
          borderColor: color.border,
          boxShadow: `0 8px 30px ${color.bg}50`
        }}
      >
        <span className="text-4xl">{color.icon}</span>
        <span className="text-white text-base font-bold mt-2">{entity.name}</span>
        {entity.description && (
          <span className="text-white/80 text-xs mt-1">{entity.description}</span>
        )}
      </div>
    );
  }
  
  // 标准服务节点
  return (
    <div 
      className="w-36 h-28 rounded-xl flex flex-col items-center justify-center border-2 mx-4"
      style={{ 
        backgroundColor: color.bg, 
        borderColor: color.border,
        boxShadow: `0 6px 24px ${color.bg}40`
      }}
    >
      <span className="text-3xl">{color.icon}</span>
      <span className="text-white text-base font-bold mt-2 text-center px-2">{entity.name}</span>
      {entity.description && (
        <span className="text-white/70 text-xs mt-1">{entity.description}</span>
      )}
    </div>
  );
}

// 连接线组件
function ConnectionLine({ rel }: { rel: Relationship }) {
  const isAsync = rel.type === 'async';
  const isDependency = rel.type === 'dependency';
  const color = isAsync ? '#ec4899' : isDependency ? '#f59e0b' : '#3b82f6';
  
  return (
    <div className="flex flex-col items-center mx-2">
      <div className="relative flex items-center">
        {/* 线条 */}
        <div 
          className="h-1 w-24"
          style={{ 
            backgroundColor: color,
            borderStyle: isAsync ? 'dashed' : 'solid',
          }}
        />
        
        {/* 箭头 */}
        <div 
          className="w-0 h-0 -ml-1"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: `10px solid ${color}`
          }}
        />
      </div>
      
      {/* 标签 */}
      {rel.label && (
        <div 
          className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white border-2"
          style={{ borderColor: color, color }}
        >
          {rel.label}
        </div>
      )}
    </div>
  );
}

// 垂直连接线
function VerticalConnector({ label, color = '#9ca3af' }: { label?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center my-4">
      <div 
        className="w-1 h-16 relative"
        style={{ backgroundColor: color }}
      >
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `10px solid ${color}`
          }}
        />
      </div>
      {label && (
        <span 
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-white border"
          style={{ borderColor: color, color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function ArchitectureStyle({ summary }: ArchitectureStyleProps) {
  const { entities, relationships } = useMemo(() => parseArchitecture(summary), [summary]);
  
  // 按层分组
  const byLayer = {
    presentation: entities.filter(e => e.layer === 'presentation'),
    application: entities.filter(e => e.layer === 'application'),
    infrastructure: entities.filter(e => e.layer === 'infrastructure'),
  };
  
  return (
    <div className="p-8 bg-gray-50 min-h-full">
      {/* 标题 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">{summary.title}</h1>
        <p className="text-gray-500 mt-2">System Architecture Diagram</p>
      </div>

      {/* 架构图 - 分层布局 */}
      <div className="max-w-6xl mx-auto">
        
        {/* Presentation Layer */}
        {byLayer.presentation.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                Presentation Layer
              </span>
            </div>
            <div className="flex justify-center items-center flex-wrap">
              {byLayer.presentation.map((entity) => (
                <ArchitectureNode key={entity.id} entity={entity} />
              ))}
            </div>
          </div>
        )}
        
        {/* 连接到应用层 */}
        {byLayer.presentation.length > 0 && byLayer.application.length > 0 && (
          <VerticalConnector label="HTTP/REST" color="#f59e0b" />
        )}
        
        {/* Application Layer */}
        {byLayer.application.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Application Layer
              </span>
            </div>
            <div className="flex justify-center items-center flex-wrap">
              {byLayer.application.map((entity, idx) => (
                <div key={entity.id} className="flex items-center">
                  <ArchitectureNode entity={entity} />
                  {idx < byLayer.application.length - 1 && (
                    <ConnectionLine 
                      rel={relationships.find(r => 
                        r.from === entity.id && byLayer.application.some(e => e.id === r.to)
                      ) || { from: entity.id, to: byLayer.application[idx + 1].id, type: 'dependency', label: 'depends' }} 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 连接到基础设施层 */}
        {byLayer.application.length > 0 && byLayer.infrastructure.length > 0 && (
          <VerticalConnector label="SQL/TCP" color="#3b82f6" />
        )}
        
        {/* Infrastructure Layer */}
        {byLayer.infrastructure.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Infrastructure Layer
              </span>
            </div>
            <div className="flex justify-center items-center flex-wrap">
              {byLayer.infrastructure.map((entity) => (
                <ArchitectureNode key={entity.id} entity={entity} />
              ))}
            </div>
          </div>
        )}
        
      </div>

      {/* 依赖关系列表 */}
      {relationships.length > 0 && (
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Service Dependencies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relationships.map((rel, i) => {
                const fromEntity = entities.find(e => e.id === rel.from);
                const toEntity = entities.find(e => e.id === rel.to);
                if (!fromEntity || !toEntity) return null;
                
                const color = rel.type === 'async' ? '#ec4899' : rel.type === 'dependency' ? '#f59e0b' : '#3b82f6';
                
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="px-3 py-1 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#3b82f6' }}>
                      {fromEntity.name}
                    </span>
                    <span style={{ color }}>→</span>
                    <span className="px-3 py-1 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#10b981' }}>
                      {toEntity.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">({rel.type})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="mt-10 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Architecture Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Frontend', icon: '🖥️', color: '#f59e0b', desc: 'User Interface' },
              { type: 'Service', icon: '⚙️', color: '#3b82f6', desc: 'Business Logic' },
              { type: 'Database', icon: '🗄️', color: '#10b981', desc: 'Data Storage' },
              { type: 'Cache', icon: '⚡', color: '#06b6d4', desc: 'Fast Access' },
            ].map(({ type, icon, color, desc }) => (
              <div key={type} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color }}>{type}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* 连接线图例 */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500" />
              <span className="text-sm text-gray-600">Sync Call</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-pink-500" style={{ background: 'repeating-linear-gradient(90deg, #ec4899, #ec4899 3px, transparent 3px, transparent 6px)' }} />
              <span className="text-sm text-gray-600">Async Message</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-amber-500" />
              <span className="text-sm text-gray-600">Dependency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
