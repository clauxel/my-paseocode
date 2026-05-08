export type PlanId = 'solo' | 'studio' | 'scale'

export type Option<T extends string = string> = {
  id: T
  label: string
  summary: string
}

export type MissionSelection = {
  goal: 'patch' | 'feature' | 'research' | 'ops'
  runtime: 'sandbox' | 'managed' | 'private'
  memory: 'session' | 'project'
  safety: 'reviewed' | 'strict'
  channel: 'web' | 'github' | 'cli'
  output: 'brief' | 'pr' | 'package'
}

export type MissionResult = {
  fitScore: number
  fitLabel: string
  headline: string
  recommendedPlanId: PlanId
  architecture: string
  runShape: string
  confidence: string
  reasons: string[]
  watchouts: string[]
  modules: Array<{ label: string; detail: string }>
  nextSteps: string[]
  operatorMessage: string
}

export const goalOptions: Option<MissionSelection['goal']>[] = [
  { id: 'patch', label: 'Bug patch', summary: 'Trace, edit, test, and summarize a contained repository fix.' },
  { id: 'feature', label: 'Feature lane', summary: 'Plan a user-facing change with implementation and verification.' },
  { id: 'research', label: 'Code research', summary: 'Inspect repos, docs, issues, and tradeoffs before writing code.' },
  { id: 'ops', label: 'Release ops', summary: 'Run checks, prepare handoff notes, and keep approval visible.' },
]

export const runtimeOptions: Option<MissionSelection['runtime']>[] = [
  { id: 'sandbox', label: 'Sandbox runner', summary: 'The practical default for code, shell, and browser tools.' },
  { id: 'managed', label: 'Managed cloud', summary: 'Fastest path for teams that want a hosted agent workspace.' },
  { id: 'private', label: 'Private lane', summary: 'For controlled runners, sensitive repos, or API embedding.' },
]

export const memoryOptions: Option<MissionSelection['memory']>[] = [
  { id: 'session', label: 'Session notes', summary: 'Enough for quick trials and one-off repository reviews.' },
  { id: 'project', label: 'Project memory', summary: 'Keeps conventions, decisions, and recurring workflows available.' },
]

export const safetyOptions: Option<MissionSelection['safety']>[] = [
  { id: 'reviewed', label: 'Review gate', summary: 'Human approval before merge, release, or external action.' },
  { id: 'strict', label: 'Strict sandbox', summary: 'Recommended when shell, files, credentials, or deploys are nearby.' },
]

export const channelOptions: Option<MissionSelection['channel']>[] = [
  { id: 'web', label: 'Web workspace', summary: 'Best for focused plan review and paid onboarding.' },
  { id: 'github', label: 'GitHub path', summary: 'Useful when work starts from issues, diffs, and pull requests.' },
  { id: 'cli', label: 'Paseo sh', summary: 'A terminal-first handoff with command review and logs.' },
]

export const outputOptions: Option<MissionSelection['output']>[] = [
  { id: 'brief', label: 'Decision brief', summary: 'A clear technical answer the team can approve.' },
  { id: 'pr', label: 'Pull request', summary: 'A reviewable code change with tests and release notes.' },
  { id: 'package', label: 'Artifact pack', summary: 'Reports, patches, scripts, and workspace files delivered together.' },
]

export const defaultMissionSelection: MissionSelection = {
  goal: 'feature',
  runtime: 'sandbox',
  memory: 'project',
  safety: 'strict',
  channel: 'web',
  output: 'pr',
}

export function analyzeMissionSelection(selection: MissionSelection): MissionResult {
  let score = 73
  const reasons: string[] = []
  const watchouts: string[] = []

  if (selection.runtime === 'sandbox') {
    score += 8
    reasons.push('A sandbox runner matches coding-agent work that needs shell, files, browser tools, and a review trail.')
  } else if (selection.runtime === 'managed') {
    score += 5
    reasons.push('Managed cloud is the fastest way to evaluate Paseo Code without owning the full runtime on day one.')
  } else {
    score += 2
    watchouts.push('Private lanes should define which commands, repositories, and secrets the agent can touch.')
  }

  if (selection.memory === 'project') {
    score += 7
    reasons.push('Project memory keeps conventions and decisions available across repeated agent runs.')
  } else {
    score -= 3
    watchouts.push('Session-only memory works for trials, but repeat engineering workflows usually need durable context.')
  }

  if (selection.safety === 'strict') {
    score += 6
    reasons.push('Strict sandboxing is the right default before an agent edits files or runs commands.')
  } else {
    score += selection.goal === 'research' ? 1 : -4
    watchouts.push('Review gates should stay explicit before merges, deploys, messages, or payment-triggered onboarding.')
  }

  if (selection.goal === 'feature' || selection.goal === 'patch') {
    score += 4
    reasons.push('Paseo Code fits code work best when planning, execution, testing, and handoff are kept in one lane.')
  }

  if (selection.goal === 'ops') {
    score += 1
    watchouts.push('Release operations need named approval points before the agent changes production-facing systems.')
  }

  if (selection.channel === 'github') {
    score += 3
    reasons.push('GitHub-centered work gives the agent concrete diffs, issues, and tests to reason about.')
  } else if (selection.channel === 'cli') {
    score += 1
    watchouts.push('Terminal-first runs should preserve command logs and make dangerous commands reviewable.')
  }

  if (selection.output === 'pr') score += 3
  if (selection.output === 'package') score += 1

  score = Math.max(44, Math.min(96, score))

  const recommendedPlanId: PlanId =
    selection.runtime === 'private' || selection.channel === 'github' || selection.goal === 'ops' ? 'scale' : 'studio'
  const fitLabel = score >= 86 ? 'Strong fit' : score >= 72 ? 'Good fit' : score >= 58 ? 'Pilot first' : 'Needs scoping'
  const confidence = score >= 86 ? 'High' : score >= 72 ? 'Moderate' : 'Cautious'
  const architecture =
    selection.runtime === 'managed'
      ? 'Managed Paseo Code workspace with hosted checkout'
      : selection.runtime === 'private'
        ? 'Private execution lane with managed planning and review'
        : 'Sandbox-backed Paseo Code workspace with project memory'
  const runShape =
    selection.goal === 'patch'
      ? 'Trace -> edit -> test -> handoff'
      : selection.goal === 'feature'
        ? 'Plan -> implement -> verify -> review'
        : selection.goal === 'ops'
          ? 'Check -> approve -> act -> report'
          : 'Inspect -> compare -> decide -> brief'

  const modules = [
    { label: 'Agent lane', detail: 'Planner coordinates coding, research, and verification sub-tasks.' },
    { label: 'Execution', detail: architecture },
    {
      label: 'Memory',
      detail: selection.memory === 'project' ? 'Project memory is included in the default Studio setup.' : 'Session notes keep the first run lightweight.',
    },
    {
      label: 'Safety',
      detail: selection.safety === 'strict' ? 'Sandbox-first with explicit review moments.' : 'Human approval before high-impact actions.',
    },
  ]

  const nextSteps = [
    'Name the first repository mission and the commands the agent may run.',
    'Keep Studio annual selected unless private runners or heavy GitHub automation already require Scale.',
    'Open Creem checkout in the centered popup, then return to the homepage for onboarding.',
    'Move only repeatable, reviewable workflows into scheduled or terminal-first runs.',
  ]

  return {
    fitScore: score,
    fitLabel,
    headline:
      score >= 72
        ? 'This mission is ready for a supervised Paseo Code workspace.'
        : 'Tighten the repository, command, and approval boundaries before paying.',
    recommendedPlanId,
    architecture,
    runShape,
    confidence,
    reasons,
    watchouts: watchouts.length ? watchouts : ['Keep external actions behind approval until the workflow is proven.'],
    modules,
    nextSteps,
    operatorMessage:
      recommendedPlanId === 'scale'
        ? 'Studio annual is still the right first checkout unless private runners or heavy GitHub automation are already required.'
        : 'Studio annual is the cleanest default for a serious Paseo Code evaluation.',
  }
}
