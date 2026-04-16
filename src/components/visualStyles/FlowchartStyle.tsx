import { useMemo } from 'react';
import type { MeetingSummary } from '../../types';

interface FlowchartStyleProps {
  summary: MeetingSummary;
}

// 解析内容中的实体和关系
function parseContent(summary: MeetingSummary) {
  const text = summary.summary + ' ' + summary.keyDecisions.join(' ') + ' ' + 
               summary.actionItems.map(a => a.task).join(' ');
  
  // 提取服务/组件名称（大写字母开头的单词组合）
  const servicePattern = /\b(?:service|component|module|api|system)\s+([A-Z][a-zA-Z]*|[A-Z])/gi;
  const services = new Set<string>();
  let match;
  while ((match = servicePattern.exec(text)) !== null) {
    services.add(match[0].replace(/\s+/g, ' '));
  }
  
  // 如果没找到服务，尝试找其他大写名词
  if (services.size === 0) {
    const nounPattern = /\b([A-Z][a-zA-Z]{1,10})\b/g;
    while ((match = nounPattern.exec(text)) !== null) {
      if (!['The', 'This', 'That', 'There', 'Meeting'].includes(match[1])) {
        services.add(match[1]);
      }
    }
  }
  
  // 提取依赖关系
  const dependencies: Array<{from: string; to: string; type: string}> = [];
  const depPatterns = [
    { pattern: /(\w+)\s+(?:depends?\s+on|relies?\s+on|calls?|uses?)\s+(\w+)/gi, type: 'depends' },
    { pattern: /(\w+)\s+(?:connects?\s+to|talks?\s+to|communicates?\s+with)\s+(\w+)/gi, type: 'connects' },
    { pattern: /(\w+)\s+(?:sends?\s+to|pushes?\s+to|writes?\s+to)\s+(\w+)/gi, type: 'sends' },
    { pattern: /(\w+)\s+(?:receives?\s+from|reads?\s+from|gets?\s+from)\s+(\w+)/gi, type: 'receives' },
    { pattern: /between\s+(\w+)\s+and\s+(\w+)/gi, type: 'relates' },
  ];
  
  depPatterns.forEach(({ pattern, type }) => {
    while ((match = pattern.exec(text)) !== null) {
      dependencies.push({ from: match[1], to: match[2], type });
    }
  });
  
  // 如果没找到依赖，根据提到的顺序创建链式依赖
  const serviceList = Array.from(services);
  if (dependencies.length === 0 && serviceList.length >= 2) {
    for (let i = 0; i < serviceList.length - 1; i++) {
      dependencies.push({ 
        from: serviceList[i], 
        to: serviceList[i + 1], 
        type: 'flow' 
      });
    }
  }
  
  return { services: serviceList, dependencies };
}

// 服务节点 - 圆角矩形
function ServiceNode({ 
  name, 
  index, 
  isEntry = false,
  isExit = false 
}: { 
  name: string; 
  index: number;
  isEntry?: boolean;
  isExit?: boolean;
}) {
  const colors = [
    { bg: '#3b82f6', light: '#dbeafe' }, // blue
    { bg: '#10b981', light: '#d1fae5' }, // emerald
    { bg: '#f59e0b', light: '#fef3c7' }, // amber
    { bg: '#8b5cf6', light: '#ede9fe' }, // violet
    { bg: '#ef4444', light: '#fee2e2' }, // red
    { bg: '#06b6d4', light: '#cffafe' }, // cyan
  ];
  const color = colors[index % colors.length];
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="px-6 py-4 rounded-xl text-center min-w-[140px] relative"
        style={{ 
          backgroundColor: color.bg,
          boxShadow: `0 4px 16px ${color.bg}50`,
          border: `3px solid ${color.bg}`,
        }}
      >
        {/* 入口/出口标记 */}
        {isEntry && (
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ▶
          </div>
        )}
        {isExit && (
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ■
          </div>
        )}
        
        <span className="text-white font-bold text-lg">{name}</span>
        
        {/* 服务编号 */}
        <div 
          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: 'white', color: color.bg, border: `2px solid ${color.bg}` }}
        >
          {index + 1}
        </div>
      </div>
    </div>
  );
}

// 箭头连接线
function ArrowLine({ 
  label, 
  direction = 'down',
  color = '#9ca3af'
}: { 
  label?: string; 
  direction?: 'down' | 'right' | 'left' | 'up';
  color?: string;
}) {
  const rotations = {
    down: 0,
    right: -90,
    left: 90,
    up: 180,
  };
  
  return (
    <div 
      className="flex flex-col items-center justify-center py-2"
      style={{ minHeight: direction === 'down' || direction === 'up' ? '60px' : '40px' }}
    >
      <div className="relative" style={{ transform: `rotate(${rotations[direction]}deg)` }}>
        {/* 线 */}
        <div 
          className="w-0.5 h-12 mx-auto"
          style={{ backgroundColor: color }}
        />
        {/* 箭头 */}
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
        <span className="text-xs text-gray-500 mt-1 bg-white px-2 py-0.5 rounded border border-gray-200">
          {label}
        </span>
      )}
    </div>
  );
}

// 水平连接线（带箭头）
function HorizontalArrow({ label, reverse = false }: { label?: string; reverse?: boolean }) {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="flex items-center">
        {reverse && label && <span className="text-xs text-gray-500 mr-2">{label}</span>}
        <div className="h-0.5 w-16 bg-gray-400" />
        <div 
          className="w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '8px solid #9ca3af'
          }}
        />
        {!reverse && label && <span className="text-xs text-gray-500 ml-2">{label}</span>}
      </div>
    </div>
  );
}

// 菱形决策节点
function DecisionNode({ text }: { text: string }) {
  return (
    <div className="flex justify-center my-2">
      <div 
        className="w-32 h-32 flex items-center justify-center relative"
        style={{ 
          background: '#f59e0b',
          transform: 'rotate(45deg)',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
        }}
      >
        <span 
          className="text-white font-medium text-center text-sm px-2"
          style={{ transform: 'rotate(-45deg)' }}
        >
          {text.length > 30 ? text.slice(0, 30) + '...' : text}
        </span>
      </div>
    </div>
  );
}

export function FlowchartStyle({ summary }: FlowchartStyleProps) {
  const { services, dependencies } = useMemo(() => parseContent(summary), [summary]);
  
  // 如果没有识别到服务，使用默认的会议流程
  const hasServices = services.length >= 2;
  
  return (
    <div className="p-8 bg-gray-50 min-h-full">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{summary.title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {hasServices ? 'Service Architecture Diagram' : 'Meeting Process Flow'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {hasServices ? (
          // 服务架构流程图
          <div className="space-y-6">
            {/* 服务层 */}
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {services.map((service, index) => (
                <div key={service} className="flex items-center">
                  <ServiceNode 
                    name={service} 
                    index={index}
                    isEntry={index === 0}
                    isExit={index === services.length - 1}
                  />
                  {index < services.length - 1 && (
                    <HorizontalArrow label={dependencies[index]?.type || 'calls'} />
                  )}
                </div>
              ))}
            </div>
            
            {/* 依赖关系说明 */}
            {dependencies.length > 0 && (
              <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Dependencies</h3>
                <div className="space-y-2">
                  {dependencies.map((dep, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                        {dep.from}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium">
                        {dep.to}
                      </span>
                      <span className="text-gray-500 text-xs">({dep.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // 默认会议流程图
          <div className="space-y-4">
            {/* 开始 */}
            <div className="flex justify-center">
              <div className="px-8 py-3 rounded-full bg-emerald-500 text-white font-bold">
                START
              </div>
            </div>
            
            <ArrowLine />
            
            {/* 会议主题 */}
            <ServiceNode name={summary.title.slice(0, 30)} index={0} />
            
            <ArrowLine label="discuss" />
            
            {/* 决策点 */}
            {summary.keyDecisions.slice(0, 2).map((decision, i) => (
              <div key={i}>
                <DecisionNode text={decision} />
                <ArrowLine />
              </div>
            ))}
            
            {/* 行动项 */}
            {summary.actionItems.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="px-6 py-3 rounded-lg bg-indigo-500 text-white font-semibold">
                    Action Items ({summary.actionItems.length})
                  </div>
                </div>
                <ArrowLine />
              </>
            )}
            
            {/* 结束 */}
            <div className="flex justify-center">
              <div className="px-8 py-3 rounded-full bg-red-500 text-white font-bold">
                END
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-xs bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-8 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Start/End</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-8 rounded-lg bg-blue-500" />
            <span className="text-gray-600">Service</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 transform rotate-45 bg-amber-500" />
            <span className="text-gray-600">Decision</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-6 rounded-full bg-cyan-500" style={{ borderRadius: '50% / 20%' }} />
            <span className="text-gray-600">Database</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-8 bg-orange-500" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
            <span className="text-gray-600">API</span>
          </div>
        </div>
      </div>
    </div>
  );
}
