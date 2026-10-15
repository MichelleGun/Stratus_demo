// Sources for "Behind the ideation". Entries without a url are the team's own
// research or arithmetic and show as a grey label instead of a link.
export interface Source {
  label: string
  title: string
  url?: string
}

export const SOURCES = {
  adii: { label: 'ADII 2023', title: 'Australian Digital Inclusion Index 2023: mobile-only users', url: 'https://digitalinclusionindex.org.au/?p=24' },
  laptop: { label: 'Tech Insider AU', title: 'Tech Insider AU: best laptops in Australia, sensible spend for a design or media course', url: 'https://tech-insider.org/au/best-laptops-australia-2026/' },
  utsSoftware: { label: 'UTS software', title: 'UTS: software available to students (licences end when you are no longer a student)', url: 'https://www.uts.edu.au/for-students/current-students/managing-your-course/using-uts-systems/software-available-students' },
  utsVdi: { label: 'UTS MyApps', title: 'UTS MyApps virtual lab', url: 'https://www.uts.edu.au/for-students/current-students/managing-your-course/using-uts-systems/computer-labs-and-facilities/myapps-virtual-lab' },
  anuVdi: { label: 'ANU VIC', title: 'ANU Virtual Information Commons', url: 'https://services.anu.edu.au/information-technology/software-systems/anu-virtual-information-commons' },
  loanLaptops: { label: 'AFTRS', title: 'AFTRS laptop access form: hardship loans approved semester by semester', url: 'https://www.aftrs.edu.au/wp-content/uploads/2026/02/Laptop-Access-Form-26V1.pdf' },
  loanMq: { label: 'Macquarie', title: 'Macquarie University computer loan scheme (means-tested)', url: 'https://students.mq.edu.au/uni-life/community/diversity-inclusion/digital-inclusion/computer-loan-scheme' },
  unh: { label: 'The New Hampshire', title: 'The New Hampshire (2023): Calling all loaner laptops', url: 'https://tnhdigital.com/22825/news/calling-all-loaner-laptops' },
  dean: { label: 'The New Hampshire', title: 'The New Hampshire (2023): Calling all loaner laptops', url: 'https://tnhdigital.com/22825/news/calling-all-loaner-laptops' },
  stadia: { label: '9to5Google', title: '9to5Google: Stadia data use at 720p (a gaming proxy)', url: 'https://9to5google.com/2021/06/09/stadia-data-optimized-720p-streaming-tier/' },
  prepaid: { label: 'Finder', title: 'Finder: cheap prepaid plans (15 to 20 GB for about $29 a month)', url: 'https://www.finder.com.au/compare-cheap-prepaid-plans' },
  comb: { label: 'Michie et al. 2011', title: 'Michie, van Stralen and West (2011), The behaviour change wheel, Implementation Science', url: 'https://doi.org/10.1186/1748-5908-6-42' },
  winner: { label: 'Winner 1980', title: 'Langdon Winner (1980), Do Artifacts Have Politics? Daedalus 109(1), full text', url: 'https://course.khoury.northeastern.edu/cs5150f14/readings/winner-artifactpolitics.pdf' },
  heidegger: { label: 'Heidegger 1954', title: 'The Question Concerning Technology (Wikipedia): published 1954, English translation 1977', url: 'https://en.wikipedia.org/wiki/The_Question_Concerning_Technology' },
  edgerton: { label: 'OUP interview', title: 'Oxford University Press blog (2007): a few questions with David Edgerton about The Shock of the Old', url: 'https://blog.oup.com/2007/01/a_few_questions_12/' },
  mogensen: { label: 'Mogensen 1992', title: 'Mogensen (1992), Towards a Provotyping Approach in Systems Development, Scandinavian Journal of Information Systems 4(1)', url: 'https://aisel.aisnet.org/sjis/vol4/iss1/5' },
  provotype: { label: 'arXiv 1703.07187', title: 'arXiv:1703.07187, a design research paper that describes provotypes as prototypes that provoke', url: 'https://arxiv.org/pdf/1703.07187' },
  empathyCanvas: { label: 'Empathy Map Canvas', title: 'Empathy Map Canvas by Dave Gray, XPLANE, via Gamestorming', url: 'https://gamestorming.com/empathy-map/' },
  interview: { label: 'Our interview', title: 'Our interview with a student (team research)' },
  log: { label: 'Our 24-hour log', title: 'Our 24-hour disconnection log (team research)' },
  math: { label: 'Our arithmetic', title: 'Our arithmetic: 2.7 to 4.5 GB an hour at about A$1.45 to 1.93 per GB' },
  pricing: { label: 'Our cost model', title: 'Our cost model: A$1.41 of cloud compute per hour' },
} satisfies Record<string, Source>

export type SourceId = keyof typeof SOURCES
