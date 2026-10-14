// About the founders. Placeholders only: swap in real names, roles and bios
// once each teammate has agreed. Set `photo` to an image URL to replace the
// initials avatar.
export interface Founder {
  name: string
  role: string
  bio: string
  initials: string
  color: string
  photo?: string
}

export const FOUNDERS: Founder[] = [
  {
    name: 'Founder One',
    role: 'Role placeholder, e.g. Product and pitch',
    bio: 'Short bio placeholder. Degree and year at UTS, what they bring to Stratus, and one line on why this problem matters to them.',
    initials: 'F1',
    color: 'from-sky-400 to-blue-600',
  },
  {
    name: 'Founder Two',
    role: 'Role placeholder, e.g. Engineering',
    bio: 'Short bio placeholder. Degree and year at UTS, what they bring to Stratus, and one line on why this problem matters to them.',
    initials: 'F2',
    color: 'from-violet-400 to-purple-600',
  },
  {
    name: 'Founder Three',
    role: 'Role placeholder, e.g. Design and research',
    bio: 'Short bio placeholder. Degree and year at UTS, what they bring to Stratus, and one line on why this problem matters to them.',
    initials: 'F3',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    name: 'Founder Four',
    role: 'Role placeholder, e.g. Business and finance',
    bio: 'Short bio placeholder. Degree and year at UTS, what they bring to Stratus, and one line on why this problem matters to them.',
    initials: 'F4',
    color: 'from-amber-400 to-orange-600',
  },
]
