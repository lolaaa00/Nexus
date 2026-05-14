export interface AgentTask {
  id: string;
  agentName: string;
  agentColor: string;
  agentIcon: string;
  task: string;
  status: 'waiting' | 'running' | 'done' | 'paying';
  output?: string;
  rloCost: number;
  startTime?: number;
  endTime?: number;
}

export interface OrchestrationPlan {
  goal: string;
  tasks: AgentTask[];
  totalRlo: number;
}

export function buildPlan(goal: string): OrchestrationPlan {
  const lower = goal.toLowerCase();
  let tasks: Omit<AgentTask, 'id' | 'status'>[] = [];

  if (lower.includes('quiz') || lower.includes('learn') || lower.includes('teach') || lower.includes('education')) {
    tasks = [
      { agentName: 'Research Agent', agentColor: '#a78bfa', agentIcon: '🔬', task: `Research "${goal}" thoroughly`, rloCost: 12 },
      { agentName: 'Content Engine', agentColor: '#60a5fa', agentIcon: '✍️', task: 'Turn research into structured content', rloCost: 8 },
      { agentName: 'Quiz Builder',   agentColor: '#f472b6', agentIcon: '🧠', task: 'Build interactive quiz from content', rloCost: 10 },
    ];
  } else if (lower.includes('game') || lower.includes('play') || lower.includes('build')) {
    tasks = [
      { agentName: 'Research Agent', agentColor: '#a78bfa', agentIcon: '🔬', task: `Research context for "${goal}"`, rloCost: 12 },
      { agentName: 'Game Builder',   agentColor: '#fb923c', agentIcon: '🎮', task: 'Build interactive game from brief', rloCost: 15 },
      { agentName: 'Content Engine', agentColor: '#60a5fa', agentIcon: '✍️', task: 'Write launch thread for the game', rloCost: 8 },
    ];
  } else if (lower.includes('crypto') || lower.includes('token') || lower.includes('wallet') || lower.includes('defi') || lower.includes('blockchain')) {
    tasks = [
      { agentName: 'Crypto Analyst', agentColor: '#4ade80', agentIcon: '📊', task: `Analyze "${goal}" with on-chain data`, rloCost: 11 },
      { agentName: 'Research Agent', agentColor: '#a78bfa', agentIcon: '🔬', task: 'Deep research on the topic', rloCost: 12 },
      { agentName: 'Content Engine', agentColor: '#60a5fa', agentIcon: '✍️', task: 'Create viral X thread from analysis', rloCost: 8 },
    ];
  } else if (lower.includes('debate') || lower.includes('vs') || lower.includes('versus') || lower.includes('better')) {
    tasks = [
      { agentName: 'Research Agent', agentColor: '#a78bfa', agentIcon: '🔬', task: `Research both sides of "${goal}"`, rloCost: 12 },
      { agentName: 'Debate Agent',   agentColor: '#34d399', agentIcon: '⚡', task: 'Structure debate with proposition and opposition', rloCost: 9 },
      { agentName: 'Content Engine', agentColor: '#60a5fa', agentIcon: '✍️', task: 'Distill debate into shareable thread', rloCost: 8 },
    ];
  } else {
    tasks = [
      { agentName: 'Research Agent', agentColor: '#a78bfa', agentIcon: '🔬', task: `Deep research: "${goal}"`, rloCost: 12 },
      { agentName: 'Content Engine', agentColor: '#60a5fa', agentIcon: '✍️', task: 'Create structured content from research', rloCost: 8 },
      { agentName: 'Quiz Builder',   agentColor: '#f472b6', agentIcon: '🧠', task: 'Build quiz to test understanding', rloCost: 10 },
    ];
  }

  return {
    goal,
    tasks: tasks.map((t, i) => ({ ...t, id: `task-${i}-${Date.now()}`, status: 'waiting' })),
    totalRlo: tasks.reduce((sum, t) => sum + t.rloCost, 0),
  };
}

export function getAgentPrompt(agentName: string, task: string, previousOutput?: string): string {
  const context = previousOutput
    ? `\n\nPrevious agent output to build upon:\n${previousOutput.slice(0, 1500)}`
    : '';

  const prompts: Record<string, string> = {
    'Research Agent': `You are a senior research analyst. Task: ${task}${context}\n\nNEVER invent facts. Format as: ## Executive Summary, ## Key Findings, ## Implications. Be thorough and factual.`,
    'Content Engine': `You are a top content strategist. Task: ${task}${context}\n\nWrite a sharp X thread. Format: bold hook, numbered tweets (1/, 2/...), CTA. Under 280 chars each. Separate with ---`,
    'Game Builder': `You are an expert game developer. Task: ${task}${context}\n\nReturn ONLY complete HTML game code wrapped in \`\`\`html then brief explanation. Inline CSS/JS, modern UI, score tracking, restart button. No external libraries.`,
    'Quiz Builder': `You are an educational game designer. Task: ${task}${context}\n\nReturn ONLY complete HTML quiz wrapped in \`\`\`html then brief explanation. 5 questions, green/red feedback, score tracking, modern UI. No external libraries.`,
    'Debate Agent': `You are a master debater. Task: ${task}${context}\n\nStructure: ## PROPOSITION, ## OPPOSITION, ## KEY TENSIONS, ## VERDICT. Be sharp and intellectual.`,
    'Crypto Analyst': `You are a senior crypto analyst. Task: ${task}${context}\n\nNEVER invent tokenomics or partnerships. Only use provided info. Format: ## Overview, ## Key Findings, ## Risk Assessment, ## Opportunities.`,
  };

  return prompts[agentName] ?? `Complete this task: ${task}${context}`;
}
