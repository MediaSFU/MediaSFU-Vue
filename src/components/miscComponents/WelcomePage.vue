<!--
/**
 * @fileoverview WelcomePage Component - Event authentication and entry interface
 * @component WelcomePage
 * @module components/miscComponents/WelcomePage
 * 
 * @description
 * The welcome page provides a secure entry interface for joining MediaSFU events.
 * Users enter their display name, event ID, and secret token to authenticate and
 * join an ongoing event. Supports manual entry and QR code scanning for autofill.
 * 
 * Features:
 * - Event authentication with name, ID, and secret token
 * - Input validation (alphanumeric, length limits)
 * - QR code scanning support for autofill
 * - Link to MediaSFU portal for obtaining credentials
 * - Secure token handling
 * - Fully customizable via `uiOverrides.welcomePage`
 * 
 * @example Basic Usage
 * <WelcomePage :parameters="parameters" />
 * 
 * @example Custom Logo
 * // <WelcomePage
 *   // :parameters="{
 *     ...parameters,
 *     imgSrc: 'https://example.com/custom-logo.png'
 *   }"
 * // />
 * 
 * @example Complete Replacement via UI Overrides
 * const uiOverrides = computed(() => ({
 *   // welcomePage: {
 *     component: CustomWelcomePage
 *   }
 * }));
 */
-->
<template>
  <div :style="styles.container">
    <div :style="styles.logoContainer">
      <img
        :src="parameters.imgSrc || 'https://mediasfu.com/images/logo192.png'"
        :style="styles.logoImage"
        alt="Logo"
      />
    </div>
    <div :style="styles.inputContainer">
      <input
        type="text"
        placeholder="Event Display Name"
        :value="name"
        :style="styles.inputField"
        @input="handleNameChange"
      />
      <input
        type="text"
        placeholder="Event Token (Secret)"
        :value="secret"
        :style="styles.inputField"
        @input="handleSecretChange"
      />
      <input
        type="text"
        placeholder="Event ID"
        :value="eventID"
        :style="styles.inputField"
        @input="handleEventIDChange"
      />
      <input
        v-model="link"
        type="text"
        placeholder="Event Link"
        :style="styles.inputField"
      />
    </div>
    <button
      :style="styles.confirmButton"
      @click="handleConfirm"
    >
      Confirm
    </button>

    <div :style="styles.additionalOptionsContainer">
      <p>
        Provide the event details either by typing manually or scanning the QR-code to autofill.
      </p>
      <p>Do not have a secret?</p>
      <a
        href="https://meeting.mediasfu.com/meeting/start/"
        target="_blank"
        rel="noreferrer"
        :style="styles.link"
      >
        Get one from mediasfu.com
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue';
import {
  validateAlphanumeric,
  validateWelcomeInputs,
  handleWelcomeRequest,
} from 'mediasfu-shared';
import type { WelcomePageParameters } from '../../../../SharedTypes';

/**
 * Props for the WelcomePage component
 * @interface WelcomePageProps
 */
export interface WelcomePageProps {
  /**
   * MediaSFU parameters object containing event state and callbacks
   * Includes imgSrc for custom logo and socket connection configuration
   */
  parameters: WelcomePageParameters;
}

const props = defineProps<WelcomePageProps>();

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
    parameters: props.parameters as any, // Cast to resolve socket type incompatibility
  });

  props.parameters.updateIsLoadingModalVisible(false);
};

const styles = computed<{ [key: string]: CSSProperties }>(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#53C6E0',
    overflow: 'auto',
  },
  logoContainer: {
    marginTop: '30px',
    paddingTop: '10px',
    marginBottom: '10px',
  },
  logoImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
  },
  inputContainer: {
    marginBottom: '10px',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    height: '30px',
    borderColor: 'gray',
    borderWidth: '1px',
    marginBottom: '10px',
    padding: '0 5px',
    borderRadius: '5px',
  },
  confirmButton: {
    backgroundColor: 'black',
    color: 'white',
    padding: '5px 5px',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  additionalOptionsContainer: {
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginLeft: '5px',
  },
}));
</script>

<style scoped>
/* Component-specific styles */
</style>
