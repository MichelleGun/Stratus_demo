export type PlanId = 'free' | 'standard' | 'pro'
export type IndustryId = 'cyber' | 'business' | 'game' | 'science' | 'engineering' | 'social' | 'health' | 'data' | 'notsure'
export type AppId = 'vscode' | 'spreadsheet' | 'studio3d' | 'logs' | 'bi' | 'game' | 'notebook' | 'qualitative' | 'video' | 'cad' | 'arch'

export const PLAN_ORDER: PlanId[] = ['free', 'standard', 'pro']

export const PLANS: Record<PlanId, { name: string; price: number; priceLabel: string; blurb: string; spec: string; perks: string[] }> = {
  free: {
    name: 'Free',
    price: 0,
    priceLabel: '5 hours a month',
    blurb: 'Basic apps for notes, docs and research.',
    spec: '2 vCPU, 4 GB RAM',
    perks: ['Qualitative Research Lab', 'Docs and notes', 'Saves your work'],
  },
  standard: {
    name: 'Standard',
    price: 1.5,
    priceLabel: '$1.50 per hour',
    blurb: 'Study apps for coding, data and business.',
    spec: '8 vCPU, 16 GB RAM',
    perks: ['VS Code and Data Notebook', 'Spreadsheet and BI Dashboard', 'Log Analytics'],
  },
  pro: {
    name: 'Pro',
    price: 3.5,
    priceLabel: '$3.50 per hour',
    blurb: 'A real GPU for 3D, games and video.',
    spec: '8 vCPU, 32 GB RAM, RTX-class GPU',
    perks: ['Everything in Standard', 'Game Engine and 3D Studio', 'Video Editor, GPU model training'],
  },
}

export interface AppDef {
  id: AppId
  name: string
  industry: IndustryId
  plan: PlanId
  gpu: boolean
  like: string
  blurb: string
  color: [string, string]
  launchCopy: string
}

export const APPS: AppDef[] = [
  { id: 'vscode', name: 'VS Code', industry: 'data', plan: 'standard', gpu: false, like: 'Visual Studio Code', blurb: 'Code editor with a terminal and Python ready to go.', color: ['#1E88E5', '#1565C0'], launchCopy: 'Setting up Python 3.12 for VS Code' },
  { id: 'spreadsheet', name: 'Spreadsheet', industry: 'business', plan: 'standard', gpu: false, like: 'Excel', blurb: '50,000 rows that scroll smoothly, with formulas and a pivot.', color: ['#22B573', '#13804F'], launchCopy: 'Opening 50,000 rows in Spreadsheet' },
  { id: 'studio3d', name: '3D Studio', industry: 'game', plan: 'pro', gpu: true, like: 'Blender', blurb: 'Model, light and render 3D scenes on a cloud GPU.', color: ['#FF9F43', '#E8590C'], launchCopy: 'Assigning a GPU for 3D Studio' },
  { id: 'logs', name: 'Log Analytics', industry: 'cyber', plan: 'standard', gpu: false, like: 'Splunk', blurb: 'Search 200,000 security events and spot attacks.', color: ['#FF5C7A', '#C2185B'], launchCopy: 'Indexing 200,000 events for Log Analytics' },
  { id: 'bi', name: 'BI Dashboard', industry: 'business', plan: 'standard', gpu: false, like: 'Power BI and Tableau', blurb: 'Sales dashboards with filters and cross-filtering.', color: ['#F7C948', '#D99A00'], launchCopy: 'Loading the sales model for BI Dashboard' },
  { id: 'game', name: 'Game Engine', industry: 'game', plan: 'pro', gpu: true, like: 'Unity and Unreal', blurb: 'Build a scene, press Play, and test your game.', color: ['#8E7CFF', '#5B3FD9'], launchCopy: 'Assigning a GPU for Game Engine' },
  { id: 'notebook', name: 'Data Notebook', industry: 'data', plan: 'standard', gpu: false, like: 'Jupyter', blurb: 'Load data, chart it and train a model.', color: ['#F37726', '#B9480F'], launchCopy: 'Starting a Python kernel for Data Notebook' },
  { id: 'qualitative', name: 'Qualitative Research Lab', industry: 'social', plan: 'free', gpu: false, like: 'NVivo', blurb: 'Code interview transcripts and find themes.', color: ['#2EC4B6', '#138A80'], launchCopy: 'Loading transcripts for Qualitative Research Lab' },
  { id: 'cad', name: 'CAD Draft', industry: 'engineering', plan: 'standard', gpu: false, like: 'AutoCAD and Fusion', blurb: 'Draft floor plans that snap to a grid, then extrude them to 3D.', color: ['#38BDF8', '#0369A1'], launchCopy: 'Loading drawing sets for CAD Draft' },
  { id: 'arch', name: 'Architecture Studio', industry: 'engineering', plan: 'pro', gpu: true, like: 'Revit and SketchUp', blurb: 'Walk a 3D building model, cut sections and run a sun study.', color: ['#A3E635', '#4D7C0F'], launchCopy: 'Assigning a GPU for Architecture Studio' },
  { id: 'video', name: 'Video Editor', industry: 'game', plan: 'pro', gpu: true, like: 'Premiere Pro', blurb: 'Cut clips on a multi-track timeline and export.', color: ['#5C7CFA', '#3B4FD1'], launchCopy: 'Assigning a GPU for Video Editor' },
]

export const appById = (id: string) => APPS.find((a) => a.id === id)

export const INDUSTRIES: { id: IndustryId; name: string; field: string; plan: PlanId; apps: AppId[] }[] = [
  { id: 'cyber', name: 'Cybersecurity', field: 'Cybersecurity', plan: 'standard', apps: ['logs', 'vscode', 'notebook'] },
  { id: 'business', name: 'Business', field: 'Business', plan: 'standard', apps: ['spreadsheet', 'bi', 'notebook'] },
  { id: 'game', name: 'Game and Design', field: 'Game design', plan: 'pro', apps: ['game', 'studio3d', 'video'] },
  { id: 'science', name: 'Science', field: 'Science', plan: 'standard', apps: ['notebook', 'spreadsheet', 'vscode'] },
  { id: 'engineering', name: 'Engineering and Architecture', field: 'Engineering', plan: 'pro', apps: ['cad', 'arch', 'studio3d', 'vscode'] },
  { id: 'social', name: 'Social science', field: 'Social science', plan: 'free', apps: ['qualitative', 'spreadsheet', 'notebook'] },
  { id: 'health', name: 'Health', field: 'Health', plan: 'standard', apps: ['notebook', 'qualitative', 'spreadsheet'] },
  { id: 'data', name: 'Data and AI', field: 'AI', plan: 'pro', apps: ['notebook', 'vscode', 'bi'] },
  { id: 'notsure', name: 'Not sure', field: 'Everyone', plan: 'free', apps: ['vscode', 'spreadsheet', 'studio3d', 'video'] },
]

export const industryById = (id: string | null | undefined) => INDUSTRIES.find((i) => i.id === id)

export const CORE_DOCK: AppId[] = ['vscode', 'spreadsheet', 'studio3d', 'video']

export function dockFor(industry: IndustryId | null, extra: AppId[] = []): AppId[] {
  const base = industry ? industryById(industry)!.apps : CORE_DOCK
  const out = [...base]
  for (const a of extra) if (!out.includes(a)) out.push(a)
  return out
}

export function planAllows(plan: PlanId, needed: PlanId) {
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(needed)
}

// "Help me pick" keyword rules, matched case-insensitively. Highest tier wins.
const RULES: { plan: PlanId; words: string[] }[] = [
  { plan: 'pro', words: ['3d', 'blender', 'unity', 'unreal', 'game', 'render', 'video', 'edit', 'cad', 'simulation', 'simulat', 'matlab', 'molecule', 'protein', 'genomics', 'ct scan', 'mri', 'deep learning', 'heavy machine learning', 'gpu', 'heat flow', 'fluid', 'architect', 'building', 'revit', 'sketchup', 'bim'] },
  { plan: 'standard', words: ['code', 'coding', 'python', 'vs code', 'notebook', 'spreadsheet', 'excel', 'power bi', 'tableau', 'report', 'pivot', 'slides', 'splunk', 'siem', 'logs', 'login', 'security', 'packet', 'wireshark', 'spss', 'regression', 'statistic', 'circuit', 'arduino', 'robot', 'floor plan', 'autocad', 'drafting', 'sales', 'data', 'machine learning'] },
  { plan: 'free', words: ['brows', 'notes', 'docs', 'essay', 'interview', 'transcript', 'qualitative', 'nvivo', 'writing'] },
]

const UNLOCKS: Record<PlanId, AppId[]> = {
  pro: ['arch', 'game', 'studio3d', 'video'],
  standard: ['cad', 'vscode', 'spreadsheet', 'logs', 'bi', 'notebook'],
  free: ['qualitative'],
}

export function recommend(text: string): { plan: PlanId; reason: string; apps: AppId[] } {
  const t = ' ' + text.toLowerCase() + ' '
  for (const rule of RULES) {
    const hit = rule.words.find((w) => (w.length <= 3 ? new RegExp(`\\b${w}\\b`).test(t) : t.includes(w)))
    if (hit) {
      const label = hit === '3d' ? '3D work' : `"${hit}"`
      const reason =
        rule.plan === 'pro'
          ? `${label} needs a GPU, so Pro is the one that keeps it smooth.`
          : rule.plan === 'standard'
            ? `${label} runs well on study power, no GPU needed, so you save money.`
            : `${label} is light work. Free covers it.`
      return { plan: rule.plan, reason, apps: matchApps(t, rule.plan) }
    }
  }
  return { plan: 'standard', reason: 'Standard covers most study work. You can switch any time.', apps: UNLOCKS.standard.slice(0, 3) }
}

function matchApps(t: string, plan: PlanId): AppId[] {
  const map: [string, AppId][] = [
    ['architect', 'arch'], ['building', 'arch'], ['revit', 'arch'], ['sketchup', 'arch'], ['floor plan', 'cad'], ['autocad', 'cad'], ['drafting', 'cad'], ['cad', 'cad'], ['3d', 'studio3d'], ['blender', 'studio3d'], ['render', 'studio3d'], ['unity', 'game'], ['unreal', 'game'], ['game', 'game'],
    ['video', 'video'], ['edit', 'video'], ['login', 'logs'], ['log', 'logs'], ['security', 'logs'], ['sales', 'bi'], ['report', 'bi'], ['excel', 'spreadsheet'],
    ['spreadsheet', 'spreadsheet'], ['python', 'vscode'], ['code', 'vscode'], ['interview', 'qualitative'], ['transcript', 'qualitative'], ['notebook', 'notebook'],
    ['machine learning', 'notebook'], ['heat', 'notebook'], ['simulat', 'notebook'], ['data', 'notebook'],
  ]
  const out: AppId[] = []
  for (const [k, a] of map) if (t.includes(k) && !out.includes(a)) out.push(a)
  for (const a of UNLOCKS[plan]) if (out.length < 3 && !out.includes(a)) out.push(a)
  return out.slice(0, 3)
}

export const HELP_CHIPS = ['Designing a building', 'Drafting a floor plan', '3D modelling for uni', 'Investigating failed logins', 'Quarterly sales report', 'Making a game in Unity', 'Analysing interview data', 'Simulating heat flow']

export const REGIONS = ['Sydney', 'Melbourne', 'Singapore'] as const
export const REGION_LATENCY: Record<string, number> = { Sydney: 18, Melbourne: 24, Singapore: 61 }
