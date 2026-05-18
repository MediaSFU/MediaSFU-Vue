<template>
  <ModernEntryShell :intro-layout="props.entryShellLayout">
    <template #title>
      <div class="ms-modern-welcome__title-wrap">
        <img
          :src="props.parameters.imgSrc || 'https://mediasfu.com/images/logo192.png'"
          class="ms-modern-welcome__logo"
          alt="MediaSFU"
        >
        <h1 class="ms-modern-welcome__title">
          Welcome to MediaSFU
        </h1>
      </div>
    </template>

    <template #description>
      <p class="ms-modern-welcome__description">
        Enter your event details to join.
      </p>
    </template>

    <form
      class="ms-modern-welcome__form"
      @submit.prevent="handleConfirm"
    >
      <ModernField
        label="Display Name"
        hint="Up to 12 alphanumeric characters."
        placeholder="Event Display Name"
        :value="name"
        @input="handleNameChange"
      />

      <ModernField
        label="Event Token"
        hint="Paste the secret token exactly as provided."
        placeholder="Event Token (Secret)"
        :value="secret"
        @input="handleSecretChange"
      />

      <ModernField
        label="Event ID"
        hint="Use the event identifier associated with the room."
        placeholder="Event ID"
        :value="eventID"
        @input="handleEventIDChange"
      />

      <ModernField
        label="Event Link"
        hint="Optional direct room link when one is available."
        placeholder="Event Link"
        :value="link"
        @input="handleLinkChange"
      />

      <ModernButton
        block
        size="lg"
        type="submit"
      >
        Confirm
      </ModernButton>

      <div class="ms-modern-welcome__help">
        <p>
          Need credentials?
          <a
            href="https://meeting.mediasfu.com/meeting/start/"
            target="_blank"
            rel="noreferrer"
          >
            Get one from mediasfu.com
          </a>
        </p>
      </div>
    </form>
  </ModernEntryShell>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  handleWelcomeRequest,
  validateAlphanumeric,
  validateWelcomeInputs,
} from 'mediasfu-shared';
import type { WelcomePageParameters } from '../../../../SharedTypes';
import { ModernButton, ModernField } from '../primitives';
import ModernEntryShell from './ModernEntryShell.vue';
import type { ModernEntryShellLayout } from './ModernEntryShell.vue';

export interface ModernWelcomePageProps {
  parameters: WelcomePageParameters;
  entryShellLayout?: ModernEntryShellLayout;
}

const props = withDefaults(defineProps<ModernWelcomePageProps>(), {
  entryShellLayout: 'inline',
});

const name = ref('');
const secret = ref('');
const eventID = ref('');
const link = ref('');

const handleNameChange = (e: Event) => {
  const text = (e.target as HTMLInputElement).value;
  if (text.length <= 12 && validateAlphanumeric(text)) {
    name.value = text;
  }
};

const handleSecretChange = (e: Event) => {
  const text = (e.target as HTMLInputElement).value;
  if (text.length <= 64 && validateAlphanumeric(text)) {
    secret.value = text;
  }
};

const handleEventIDChange = (e: Event) => {
  const text = (e.target as HTMLInputElement).value;
  if (text.length <= 32 && validateAlphanumeric(text)) {
    eventID.value = text;
  }
};

const handleLinkChange = (e: Event) => {
  link.value = (e.target as HTMLInputElement).value;
};

const handleConfirm = async () => {
  props.parameters.updateIsLoadingModalVisible(true);

  const validation = validateWelcomeInputs({
    name: name.value,
    secret: secret.value,
    eventID: eventID.value,
    link: link.value,
  });

  if (!validation.valid) {
    props.parameters.showAlert?.({
      message: validation.message || 'Please enter valid details.',
      type: 'danger',
      duration: 3000,
    });

    props.parameters.updateIsLoadingModalVisible(false);
    return;
  }

  await handleWelcomeRequest({
    apiUserName: eventID.value,
    apiToken: secret.value,
    link: link.value,
    userName: name.value,
    parameters: props.parameters as any,
  });

  props.parameters.updateIsLoadingModalVisible(false);
};
</script>

<style scoped>
.ms-modern-welcome__title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ms-modern-spacing-lg);
}

.ms-modern-welcome__logo {
  width: 88px;
  height: 88px;
  border-radius: 26px;
  box-shadow: 0 18px 40px rgba(2, 8, 23, 0.28);
}

.ms-modern-welcome__title {
  margin: 0;
  max-width: none;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-headline-lg);
  line-height: 1.02;
  text-align: center;
}

.ms-modern-welcome__description {
  margin: 0;
  max-width: 24ch;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-body);
  line-height: 1.6;
  text-align: center;
}

.ms-modern-welcome__form {
  display: flex;
  flex-direction: column;
  gap: var(--ms-modern-spacing-md);
}

.ms-modern-welcome__help {
  display: flex;
  flex-direction: column;
  gap: var(--ms-modern-spacing-sm);
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: var(--ms-modern-font-caption);
  line-height: 1.7;
  text-align: center;
}

.ms-modern-welcome__help p {
  margin: 0;
}

.ms-modern-welcome__help a {
  color: #8bdbff;
  font-weight: 700;
}
</style>