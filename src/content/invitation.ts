import type { InvitationContent } from '@/types/invitation'
import capriPhoto from '@/assets/images/capri.jpg'
import cairoPhoto from '@/assets/images/cairo.jpg'
import amorPhoto from '@/assets/images/amor.jpg'

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
      'un momento especial juntos, una cita que hace tiempo no tenemos',
      'y con fotos lindas.',
      'PD: Tranquila, incluye comida 😬',
    ],
    signature: 'Con cariño David',
  },

  photos: [
    {
      src: capriPhoto,
      alt: 'Foto de nosotros en Capri',
    },
    {
      src: cairoPhoto,
      alt: 'Foto de nosotros en Cairo',
    },
    {
      src: amorPhoto,
      alt: 'Foto mi amor',
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
