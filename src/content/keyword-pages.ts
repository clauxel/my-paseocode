export type KeywordSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type KeywordFaq = {
  question: string
  answer: string
}

export type KeywordPage = {
  path: string
  eyebrow: string
  title: string
  description: string
  h1: string
  lede: string
  intent: string
  ctaLabel: string
  sections: KeywordSection[]
  faqs: KeywordFaq[]
}

export const keywordPages: KeywordPage[] = [
  {
    path: '/paseo-code',
    eyebrow: 'Paseo Code',
    title: 'Paseo Code Agent Coding Workspace',
    description:
      'Paseo Code helps teams plan, run, review, and ship coding-agent work with project memory, sandboxed tools, and a focused Studio annual checkout path.',
    h1: 'Paseo Code is a supervised workspace for agent coding runs',
    lede:
      'Paseo Code is built for teams that want coding agents to do more than answer questions. It helps shape a repository mission, keep memory and tool boundaries visible, produce review-ready output, and move into a paid workspace without replacing the product page during checkout.',
    intent: 'For buyers comparing agent coding workspaces and deciding whether Paseo Code fits their first serious repository mission.',
    ctaLabel: 'Choose Studio annual',
    sections: [
      {
        heading: 'What Paseo Code is good at',
        paragraphs: [
          'The strongest use case is a bounded engineering task: inspect context, plan the change, run a sandboxed implementation lane, verify the result, and leave a clear handoff for a human reviewer.',
          'That shape is inspired by modern long-horizon agent systems: a lead process coordinates specialist work, memory carries project context forward, and tool access is explicit instead of hidden behind a generic chat box.',
        ],
        bullets: [
          'Repository changes with tests and release notes.',
          'Codebase research that needs citations, files, and tradeoff analysis.',
          'Repeated workflows where project memory prevents cold starts.',
          'Review gates before merges, deploys, messages, or external actions.',
        ],
      },
      {
        heading: 'Why the workspace starts before payment',
        paragraphs: [
          'A buyer should not have to guess whether an agent workspace fits. The homepage planner asks about the mission, runtime, memory, safety, channel, and output so the next step feels earned.',
          'Studio annual is selected by default because most teams need enough room for project memory and sandboxed review, but do not need private runners on the first purchase.',
        ],
      },
      {
        heading: 'How checkout stays focused',
        paragraphs: [
          'Payment opens in a centered Polar popup. The original Paseo Code page stays visible behind a blurred overlay, so the buyer keeps the plan and trust context while finishing checkout.',
          'After payment succeeds, the popup returns control to the homepage. That keeps the product flow calm and avoids sending the buyer away from the domain they chose.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Paseo Code a coding assistant or a workflow product?',
        answer:
          'It is a workflow product for coding-agent runs. The goal is to make planning, execution, review, memory, and payment feel like one clear operating path.',
      },
      {
        question: 'What plan is selected by default?',
        answer:
          'The middle Studio plan is selected by default, with annual billing enabled. Annual billing is 50% cheaper than the monthly run-rate.',
      },
      {
        question: 'Does checkout leave the page?',
        answer:
          'No. Polar checkout opens in a centered popup while the original page stays open with a blurred background.',
      },
    ],
  },
  {
    path: '/paseo-sh',
    eyebrow: 'Paseo sh',
    title: 'Paseo sh Terminal Workflow',
    description:
      'A practical Paseo sh guide for terminal-first coding-agent workflows, command review, sandbox boundaries, logs, and when to use the managed workspace.',
    h1: 'Paseo sh is the terminal-first path for controlled agent coding',
    lede:
      'Teams searching for Paseo sh usually want a shell-friendly way to run coding-agent work without losing control of commands, files, and review. This page explains how to think about terminal-first Paseo Code runs before choosing a plan.',
    intent: 'For technical users who prefer command-line workflows but still need a safer buying and onboarding path.',
    ctaLabel: 'Compare Studio annual',
    sections: [
      {
        heading: 'Where shell access helps',
        paragraphs: [
          'A coding agent becomes more useful when it can inspect files, run tests, generate artifacts, and explain what happened. Shell access makes that possible, but it also raises the stakes.',
          'Paseo sh should be treated as a controlled lane: commands are scoped, logs are preserved, and high-impact actions require review. That is the difference between a useful terminal helper and an unsafe automation shortcut.',
        ],
        bullets: [
          'Use shell access for tests, static checks, local builds, and repeatable scripts.',
          'Keep destructive commands behind explicit review.',
          'Store secrets outside prompts, logs, and generated notes.',
          'Prefer sandboxed execution before exposing a real workstation or production runner.',
        ],
      },
      {
        heading: 'When the managed workspace is better',
        paragraphs: [
          'A terminal is fast for operators, but it is not always the best buying experience for a team. A managed workspace gives non-terminal stakeholders a clearer view of plan choice, payment, memory, and safety.',
          'The best pattern is often both: use the web workspace to choose and onboard, then reserve Paseo sh style runs for repeatable tasks that benefit from command-line speed.',
        ],
      },
      {
        heading: 'A safer first run',
        paragraphs: [
          'Start with one small repository mission. Allow read-only inspection first, then tests, then file edits, then a final review. If the run creates value and the safety boundary feels clear, Studio annual is usually enough to continue.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Paseo sh a public CLI package?',
        answer:
          'This page describes the terminal-first workflow pattern for Paseo Code. Before using any CLI, inspect its source, permissions, and command behavior.',
      },
      {
        question: 'Should shell commands be automatic?',
        answer:
          'Routine checks can be automated after review, but destructive, credential-touching, or production-facing commands should require approval.',
      },
      {
        question: 'Which plan should shell-first teams start with?',
        answer:
          'Studio annual is the default unless private runners, API embedding, or organization-level controls are required immediately.',
      },
    ],
  },
  {
    path: '/paseo-github',
    eyebrow: 'Paseo GitHub',
    title: 'Paseo GitHub Workflow Guide',
    description:
      'Use Paseo GitHub workflows to connect issues, pull requests, code review, agent planning, sandboxed checks, and managed checkout decisions.',
    h1: 'Paseo GitHub workflows turn repository context into agent missions',
    lede:
      'GitHub is where most coding-agent work becomes real: issues define the problem, branches show the change, tests create trust, and reviews decide whether to ship. Paseo Code uses that repository context to make the first agent mission concrete.',
    intent: 'For users who want a GitHub-centered path from repository inspection to a paid Paseo Code workspace.',
    ctaLabel: 'Choose Studio annual',
    sections: [
      {
        heading: 'What to bring from GitHub',
        paragraphs: [
          'A good agent mission starts with specific repository context. Bring the issue, expected behavior, failing test, relevant files, acceptance criteria, and any release constraints.',
          'The agent should not start by guessing. It should ask what it can read, what it can edit, which checks matter, and where human review is required.',
        ],
        bullets: [
          'Issue or task description with expected outcome.',
          'Relevant branch, file paths, and test command.',
          'Review rules for generated code and release notes.',
          'Security boundaries for files, secrets, and external actions.',
        ],
      },
      {
        heading: 'Why GitHub buyers need a product path',
        paragraphs: [
          'Technical buyers may begin on GitHub, but payment decisions usually need a simpler product path. The workspace should explain plan fit, safety, checkout, and onboarding without forcing every stakeholder to read source code.',
          'Paseo Code keeps GitHub-style review discipline while making the Studio annual plan easy to choose from the pricing page.',
        ],
      },
      {
        heading: 'Public source and trust',
        paragraphs: [
          'The public project repository is at github.com/clauxel/my-paseocode. Use it to review the website, Cloudflare worker, sitemap, and checkout routing implementation.',
          'For agent-harness architecture ideas, also inspect serious open-source projects directly before exposing any private repository or credentials.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does Paseo Code replace GitHub?',
        answer:
          'No. It complements GitHub by turning issues, diffs, tests, and reviews into a supervised agent workspace.',
      },
      {
        question: 'Can the agent open pull requests automatically?',
        answer:
          'That should depend on your permissions model. The safer default is to prepare reviewable changes and keep merge authority with humans.',
      },
      {
        question: 'Why does the checkout page mention GitHub context?',
        answer:
          'Because repository context is a strong trust signal. It helps the buyer know what the first paid agent mission will actually do.',
      },
    ],
  },
  {
    path: '/paseo-agent',
    eyebrow: 'Paseo Agent',
    title: 'Paseo Agent Orchestration',
    description:
      'Understand Paseo Agent workflows for planning, coding, verification, memory, tools, and sandboxed execution inside a managed SaaS workspace.',
    h1: 'Paseo Agent workflows split coding work into safer lanes',
    lede:
      'A useful coding agent is not just a bigger prompt. It needs planning, context gathering, implementation, verification, and a human-readable handoff. Paseo Agent workflows make those lanes visible before checkout.',
    intent: 'For teams evaluating whether an agent workflow can handle real engineering tasks without hiding the risk.',
    ctaLabel: 'Start Studio annual',
    sections: [
      {
        heading: 'The lead-agent pattern',
        paragraphs: [
          'The lead agent owns the goal and breaks the job into smaller lanes. One lane can inspect the codebase, another can prepare the change, another can verify tests, and another can write the final handoff.',
          'This pattern is useful because it separates thinking from execution. It also makes review easier: each lane leaves a smaller trail than one giant opaque run.',
        ],
        bullets: [
          'Planner lane for scope and acceptance criteria.',
          'Research lane for repository and dependency context.',
          'Implementation lane for edits and local checks.',
          'Review lane for summary, risks, and next steps.',
        ],
      },
      {
        heading: 'Memory and skills',
        paragraphs: [
          'Project memory lets the workspace remember coding conventions, release preferences, common commands, and decisions that should not be rediscovered every run.',
          'Skills turn repeated operations into reusable procedures. They are only valuable when their permissions and side effects are easy to understand.',
        ],
      },
      {
        heading: 'Why Studio is the default',
        paragraphs: [
          'Solo is fine for a narrow test. Scale is for private runners and heavier automation. Studio is the practical middle: enough memory, sandboxing, and onboarding for a serious team evaluation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is Paseo Agent?',
        answer:
          'It is the agent-workflow layer inside Paseo Code: planning, execution, review, memory, and tool boundaries for coding tasks.',
      },
      {
        question: 'Do sub-agents make work safer by themselves?',
        answer:
          'No. They help organize work, but safety still depends on sandboxing, permissions, approval, and review.',
      },
      {
        question: 'Can I start without project memory?',
        answer:
          'Yes for a small trial. For repeated work, project memory is the main reason Studio annual is selected by default.',
      },
    ],
  },
  {
    path: '/getpaseo-paseo',
    eyebrow: 'GetPaseo',
    title: 'GetPaseo and Paseo Code',
    description:
      'A concise GetPaseo guide for choosing Paseo Code, understanding the workspace, comparing plans, and starting with Studio annual checkout.',
    h1: 'GetPaseo means starting with a clear agent coding mission',
    lede:
      'People searching GetPaseo or Paseo often want the fastest safe path to try the product. The right first step is not a vague demo. It is one named coding mission, one runtime boundary, and one plan that fits the work.',
    intent: 'For navigational searches where the visitor wants to understand what Paseo Code does and how to start.',
    ctaLabel: 'Get Paseo Studio',
    sections: [
      {
        heading: 'Start with the mission',
        paragraphs: [
          'A strong first Paseo Code mission is specific: fix this bug, add this small feature, inspect this dependency, or prepare this release note package.',
          'The homepage planner is designed to make that decision fast. Choose the mission, runtime, memory, safety, channel, and output. Then review the recommended path before opening checkout.',
        ],
      },
      {
        heading: 'Choose the middle plan when unsure',
        paragraphs: [
          'Studio annual is selected because it fits the most common paid evaluation. It is more complete than a solo pilot and less heavy than a private-runner rollout.',
          'Annual billing is enabled by default and cuts the monthly run-rate by 50%. The pricing controls still let buyers compare monthly if they need to.',
        ],
      },
      {
        heading: 'What happens after checkout',
        paragraphs: [
          'Polar checkout opens in a centered popup. After successful payment, the popup returns the buyer to the Paseo Code homepage with the original site still available for context.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is GetPaseo different from Paseo Code?',
        answer:
          'GetPaseo is a natural starting phrase. Paseo Code is the product name used for the managed coding-agent workspace.',
      },
      {
        question: 'Can I review pricing before paying?',
        answer:
          'Yes. The first CTA takes you to pricing with Studio annual selected. Payment starts only when you click Checkout.',
      },
      {
        question: 'Why not default to the cheapest plan?',
        answer:
          'The cheapest plan is useful for a narrow pilot. The middle plan better matches serious coding-agent evaluation because it includes stronger memory and workflow support.',
      },
    ],
  },
  {
    path: '/paseo-codex',
    eyebrow: 'Paseo Codex',
    title: 'Paseo Codex Workflow',
    description:
      'Paseo Codex explains how Codex-style coding agents can be managed with repository context, sandboxed tools, memory, and review gates.',
    h1: 'Paseo Codex brings Codex-style work into a managed review loop',
    lede:
      'Codex-style coding agents are powerful when they can reason over a repository, edit files, run tests, and explain the result. Paseo Code focuses on the workflow around that power: scope, sandboxing, memory, payment, and review.',
    intent: 'For visitors comparing Codex-style terminal agents with a managed SaaS buying path.',
    ctaLabel: 'Choose Studio annual',
    sections: [
      {
        heading: 'What a managed loop adds',
        paragraphs: [
          'A terminal agent can be excellent for a developer who already knows the repo. A managed loop helps teams decide what the agent should do, how risky it is, what plan fits, and how the paid workspace should start.',
          'That does not replace developer judgment. It reduces the gap between a promising coding-agent session and an operational workflow other people can trust.',
        ],
        bullets: [
          'Mission framing before the first command.',
          'Sandboxed execution for files, shell, and browser tools.',
          'Project memory for conventions and repeat tasks.',
          'Reviewable output before merge or release.',
        ],
      },
      {
        heading: 'Good Codex-style tasks',
        paragraphs: [
          'Good tasks have a clear finish line: add a small feature, fix a failing test, document an integration, inspect a dependency, or create a release checklist.',
          'Weak tasks ask the agent to take over an entire product without constraints. Paseo Code intentionally nudges buyers toward bounded work first.',
        ],
      },
      {
        heading: 'Payment without losing context',
        paragraphs: [
          'The Studio annual checkout opens as a Polar popup. The page behind it remains blurred and visible, so the buyer can finish payment without forgetting why the plan was selected.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Paseo Codex an official Codex product?',
        answer:
          'No. It describes a Paseo Code workflow for Codex-style coding-agent work, with the product path, safety model, and checkout handled by Paseo Code.',
      },
      {
        question: 'What is the safest first task?',
        answer:
          'A small repository change with tests and a human review gate is usually the safest first paid task.',
      },
      {
        question: 'Which plan is best for Codex-style work?',
        answer:
          'Studio annual is the default because project memory, sandboxing, and review support matter more than the cheapest pilot once code is involved.',
      },
    ],
  },
  {
    path: '/paseo-opencode',
    eyebrow: 'Paseo OpenCode',
    title: 'Paseo OpenCode Workflow',
    description:
      'Paseo OpenCode covers open coding-agent workflows, self-hosted tradeoffs, sandboxing, project memory, and when a managed SaaS plan is worth it.',
    h1: 'Paseo OpenCode keeps open coding workflows reviewable',
    lede:
      'Open coding-agent workflows are attractive because teams can inspect, adapt, and self-host more of the stack. Paseo Code adds a managed product path for teams that want the value of open workflows without making every buyer operate the infrastructure.',
    intent: 'For users comparing OpenCode-style approaches with a hosted Paseo Code workspace.',
    ctaLabel: 'Start Studio annual',
    sections: [
      {
        heading: 'Open workflow strengths',
        paragraphs: [
          'Open workflows make it easier to inspect prompts, tools, scripts, and generated changes. That matters when an agent can touch code, files, and commands.',
          'The tradeoff is operational complexity. Someone still has to define permissions, memory, runners, logs, checkout, analytics, and onboarding.',
        ],
        bullets: [
          'Inspectable tool and command behavior.',
          'Adaptable prompts and workflow steps.',
          'Better fit for teams that need private infrastructure.',
          'Higher responsibility for security, deployment, and support.',
        ],
      },
      {
        heading: 'Where a managed plan fits',
        paragraphs: [
          'A managed plan is useful when the team already knows the first mission and wants to move quickly. It should not hide how the workflow operates; it should make the path easier to buy, start, and evaluate.',
          'Paseo Code keeps the public product path focused on the first mission, Studio annual pricing, and a payment popup that leaves the original page in place.',
        ],
      },
      {
        heading: 'When to choose Scale',
        paragraphs: [
          'Choose Scale when private runners, heavier GitHub automation, API embedding, or organization controls are already required. Otherwise, Studio annual is the right default starting point.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Paseo OpenCode a separate product?',
        answer:
          'It is a workflow page for people comparing open coding-agent approaches with Paseo Code. Paseo Code is the product.',
      },
      {
        question: 'Can open workflows still use managed checkout?',
        answer:
          'Yes. Teams can keep an open or self-hosted technical posture while using a managed product path for onboarding and payment.',
      },
      {
        question: 'Does annual billing apply to all plans?',
        answer:
          'Yes. Annual billing is available across plans and is selected by default with a 50% discount versus monthly.',
      },
    ],
  },
]

export function findKeywordPageByPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return keywordPages.find((page) => page.path === normalized) ?? null
}
