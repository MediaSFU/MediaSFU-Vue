<template>
  <ModernWelcomePage v-bind="props" />
</template>

<script setup lang="ts">
import ModernWelcomePage from '../../modern/misc_components/ModernWelcomePage.vue';
import type { ModernWelcomePageProps } from '../../modern/misc_components/ModernWelcomePage.vue';

export interface WelcomePageProps extends ModernWelcomePageProps {}

const props = defineProps<WelcomePageProps>();
</script>