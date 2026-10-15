// The values auction: a team spreads 100 points across nine values.
// PLACEHOLDER: these numbers are not our real allocation. Replace `points` with
// the team's numbers (they must add up to 100) and set `PLACEHOLDER` to false.
export const PLACEHOLDER = true
export const TEAM_LABEL = 'Our team'

export interface ValueBid {
  value: string
  points: number
}

export const VALUES: ValueBid[] = [
  { value: 'Privacy', points: 10 },
  { value: 'Accessibility', points: 25 },
  { value: 'Sustainability', points: 5 },
  { value: 'Cultural Sensitivity', points: 0 },
  { value: 'Innovation', points: 5 },
  { value: 'Autonomy', points: 15 },
  { value: 'Transparency', points: 10 },
  { value: 'Community', points: 10 },
  { value: 'Economic Viability', points: 20 },
]
