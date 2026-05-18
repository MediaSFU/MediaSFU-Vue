<template>
  <ModernPreJoinPage v-bind="props" />
</template>

<script setup lang="ts">
import ModernPreJoinPage from '../../modern/misc_components/ModernPreJoinPage.vue';
import type { ModernPreJoinPageProps } from '../../modern/misc_components/ModernPreJoinPage.vue';

export interface PreJoinPageProps extends ModernPreJoinPageProps {}

const props = defineProps<PreJoinPageProps>();
</script>