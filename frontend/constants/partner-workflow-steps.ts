export type WorkflowStepPart = { text: string; bold: boolean }

export type WorkflowStep = {
  number: string
  title: string
  parts: WorkflowStepPart[]
  iconSrc: string
  iconAlt: string
}

export const PARTNER_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: '01',
    title: 'Step 1',
    parts: [
      { text: 'Travel businesses register on ', bold: false },
      { text: 'pirtTrip', bold: true },
      { text: ' and ', bold: false },
      { text: 'create a professional business profile.', bold: true },
    ],
    iconSrc: '/images/how-we-work/step-01-illustration.png',
    iconAlt: 'Travel businesses register on pirtTrip',
  },
  {
    number: '02',
    title: 'Step 2',
    parts: [
      { text: 'Businesses ', bold: false },
      { text: 'publish upcoming trips, packages and itineraries.', bold: true },
    ],
    iconSrc: '/images/how-we-work/step-02-illustration.png',
    iconAlt: 'Businesses publish trips and packages',
  },
  {
    number: '03',
    title: 'Step 3',
    parts: [
      { text: 'Travelers explore destinations, compare options and discover ', bold: true },
      { text: 'suitable trips.', bold: false },
    ],
    iconSrc: '/images/how-we-work/step-03-illustration.png',
    iconAlt: 'Travelers explore and discover trips',
  },
  {
    number: '04',
    title: 'Step 4',
    parts: [
      { text: 'Interested ', bold: false },
      { text: 'travelers connect with businesses through OTP verification.', bold: true },
    ],
    iconSrc: '/images/how-we-work/step-04-illustration.png',
    iconAlt: 'Travelers connect through OTP verification',
  },
  {
    number: '05',
    title: 'Step 5',
    parts: [
      { text: 'Verified travel inquiries ', bold: true },
      { text: 'are ', bold: false },
      { text: 'directly shared only with relevant travel businesses.', bold: true },
    ],
    iconSrc: '/images/how-we-work/step-05-illustration.png',
    iconAlt: 'Verified inquiries shared with businesses',
  },
  {
    number: '06',
    title: 'Step 6',
    parts: [
      { text: 'Businesses directly connect ', bold: true },
      { text: 'with travelers for planning and finalization.', bold: false },
    ],
    iconSrc: '/images/how-we-work/step-06-illustration.png',
    iconAlt: 'Businesses connect with travelers',
  },
  {
    number: '07',
    title: 'Step 7',
    parts: [
      { text: 'Bookings are finalized independently ', bold: true },
      { text: 'without platform interference.', bold: false },
    ],
    iconSrc: '/images/how-we-work/step-07-illustration.png',
    iconAlt: 'Bookings finalized independently',
  },
  {
    number: '08',
    title: 'Step 8',
    parts: [
      { text: 'Businesses grow visibility, receive quality leads and manage inquiries ', bold: true },
      { text: 'from their dashboard', bold: false },
    ],
    iconSrc: '/images/how-we-work/step-08-illustration.png',
    iconAlt: 'Businesses grow visibility and manage inquiries',
  },
]
