import type { InvitationContent } from '@/types/invitation'

/**
 * Única fuente de copy y datos de la invitación. Edita este archivo para
 * personalizar la app — ningún componente debe tener texto visible hardcodeado.
 * Reemplaza los `{PLACEHOLDER}` y las fotos de placehold.co por las reales.
 */
export const invitation: InvitationContent = {
  eyebrow: 'Amor, Hay un plan listo para nosotros',
  recipientName: 'Sara B.',
  subtitle: 'spoiler: solo hay una respuesta buena 👀',
  envelopeOpenLabel: 'Abre el sobre',
  envelopeOpenedLabel: 'Sobre abierto',

  letter: {
    greeting: 'Hola Amor mio,',
    body: [
      'Esta es una invitación para que compartamos',
      'una foto y noche especial',
      'PD: Tranquila, incluye cena 😬',
    ],
    signature: 'Con cariño David',
  },

  photos: [
    {
      src: 'https://placehold.co/600x760/EFE9DC/4B0E14?text=Nosotros+1',
      alt: 'Foto de nosotros dos, número uno',
    },
    {
      src: 'https://placehold.co/600x760/EFE9DC/4B0E14?text=Nosotros+2',
      alt: 'Foto de nosotros dos, número dos',
    },
  ],

  date: {
    day: '12 de Septiembre 2026',
    time: '4:00 PM',
    place: 'Chia',
    city: '',
  },

  actions: {
    accept: 'Sí, va',
    decline: 'Paso, gracias',
  },

  declineModal: {
    title: '¿Es en serio?',
    body: 'Te vas a perder una noche diferente, con comida rica y tal vez fotos lindas ¿Segura?',
    confirmLabel: 'Sí, en serio',
    escapeHatch: 'Mejor sí voy',
    surrenderLabel: 'Ya, va, digo que sí.',
    surrenderNote: 'El botón se rindió antes que tú. A lo mejor es una señal.',
    evasiveButtonHint: 'Este botón es broma: no lo vas a poder pulsar.',
  },

  accepted: {
    title: '¡Sabía que dirías que sí!',
    note: 'Guarda la fecha, ya casi es real.',
  },
}
