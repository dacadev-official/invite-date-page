<script setup lang="ts">
import { computed } from 'vue'
import { invitation } from '@/content/invitation'
import { useInvitationFlow } from '@/composables/useInvitationFlow'
import InvitationHero from '@/components/invitation/InvitationHero.vue'
import EnvelopeCard from '@/components/invitation/EnvelopeCard.vue'
import RsvpActions from '@/components/invitation/RsvpActions.vue'
import DeclineModal from '@/components/invitation/DeclineModal.vue'
import AcceptedScene from '@/components/invitation/AcceptedScene.vue'

const { state, openEnvelope, decline, dismissDecline, accept } = useInvitationFlow()

// El sobre visualmente se queda "open" tanto mientras se decide declinar
// (modal encima) como una vez aceptada la invitación.
const envelopeState = computed(() => (state.value === 'sealed' || state.value === 'opening' ? state.value : 'open'))
</script>

<template>
  <main class="page">
    <div class="page__content">
      <AcceptedScene v-if="state === 'accepted'" :content="invitation.accepted" :date="invitation.date" />

      <template v-else>
        <InvitationHero
          :eyebrow="invitation.eyebrow"
          :recipient-name="invitation.recipientName"
          :subtitle="invitation.subtitle"
        />

        <EnvelopeCard
          :state="envelopeState"
          :letter="invitation.letter"
          :photos="invitation.photos"
          :date-day="invitation.date.day"
          :open-label="invitation.envelopeOpenLabel"
          :opened-label="invitation.envelopeOpenedLabel"
          @open="openEnvelope"
        />

        <RsvpActions
          v-if="state === 'open' || state === 'declining'"
          :accept-label="invitation.actions.accept"
          :decline-label="invitation.actions.decline"
          @accept="accept"
          @decline="decline"
        />
      </template>
    </div>

    <DeclineModal
      :open="state === 'declining'"
      :content="invitation.declineModal"
      @dismiss="dismissDecline"
    />
  </main>
</template>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-7) var(--space-4);
}

.page__content {
  width: 100%;
  max-width: var(--content-max-width);
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}

@media (min-width: 48rem) {
  .page__content {
    max-width: var(--content-max-width-desktop);
  }
}
</style>
