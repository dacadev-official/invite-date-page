export interface PhotoRef {
  src: string
  alt: string
}

export interface LetterContent {
  greeting: string
  body: string[]
  signature: string
}

export interface DateDetails {
  day: string
  time: string
  place: string
  city: string
}

export interface RsvpActionsContent {
  accept: string
  decline: string
}

export interface DeclineModalContent {
  title: string
  body: string
  confirmLabel: string
  escapeHatch: string
  surrenderLabel: string
  surrenderNote: string
  evasiveButtonHint: string
}

export interface AcceptedContent {
  title: string
  note: string
}

export interface InvitationContent {
  eyebrow: string
  recipientName: string
  subtitle: string
  envelopeOpenLabel: string
  envelopeOpenedLabel: string
  letter: LetterContent
  photos: [PhotoRef, PhotoRef, PhotoRef]
  date: DateDetails
  actions: RsvpActionsContent
  declineModal: DeclineModalContent
  accepted: AcceptedContent
}
