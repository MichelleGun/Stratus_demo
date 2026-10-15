// About the founders, shown on the About Stratus page.
// Set `photo` to an image URL to replace the initials avatar.
export interface Founder {
  name: string
  degree: string
  contributions: string
  quote: string
  initials: string
  color: string
  photo?: string
}

export const FOUNDERS: Founder[] = [
  {
    name: 'Adrian Martin',
    degree: 'Bachelor of Science',
    contributions: 'Investigation, Writing - Review & Edit, Resources',
    quote: "It's so cool to get to try what applications other industries use",
    initials: 'AM',
    color: 'from-sky-400 to-blue-600',
  },
  {
    name: 'Michael Frederick',
    degree: 'Bachelor of IT',
    contributions: 'Methodology, Writing - Review & Edit, Resources',
    quote: 'Laptop, welcome back',
    initials: 'MF',
    color: 'from-violet-400 to-purple-600',
  },
  {
    name: 'Michelle Gunawan',
    degree: 'Bachelor of AI',
    contributions: 'Project Administration & Data Curation, Software, Direction, Writing - Review & Edit',
    quote: 'Finally, GPUs from my phone!!',
    initials: 'MG',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    name: 'Reuben Schweitzer',
    degree: 'Bachelor of IT',
    contributions: 'Conceptualisation, Visualisation, Direction, Writing - Original Draft, Resources',
    quote: "Why didn't this happen sooner? Cloud computing should be for everyone",
    initials: 'RS',
    color: 'from-amber-400 to-orange-600',
  },
]
