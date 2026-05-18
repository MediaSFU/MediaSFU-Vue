<template>
  <div class="ms-modern-screenboard-shell">
    <ClassicScreenboard v-bind="props" />
  </div>
</template>

<script setup lang="ts">
import ClassicScreenboard from '../../components/screenboardComponents/Screenboard.vue';

interface ModernScreenboardProps {
  customWidth: number;
  customHeight: number;
  parameters: Record<string, unknown>;
  showAspect: boolean;
}

const props = defineProps<ModernScreenboardProps>();
</script>

<style scoped>
.ms-modern-screenboard-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.ms-modern-screenboard-shell :deep(#screenboard-interface) {
  border: 1px solid rgba(148, 163, 184, 0.18) !important;
  border-radius: 28px !important;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.2), transparent 34%),
    linear-gradient(180deg, rgba(15, 27, 49, 0.96) 0%, rgba(8, 17, 32, 0.98) 100%) !important;
  box-shadow: var(--ms-modern-shadow-elevated, 0 24px 60px rgba(2, 8, 23, 0.36));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden !important;
}

.ms-modern-screenboard-shell :deep(#screenboardContent) {
  padding: 12px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.08) 100%) !important;
}

.ms-modern-screenboard-shell :deep(.btnBoardScreen),
.ms-modern-screenboard-shell :deep(#annotateScreen),
.ms-modern-screenboard-shell :deep(#toolbarToggleScreen) {
  border: 1px solid rgba(148, 163, 184, 0.16) !important;
  border-radius: 9999px !important;
  background: rgba(15, 23, 42, 0.8) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
  box-shadow: var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ms-modern-screenboard-shell :deep(.btnBoardScreen:hover),
.ms-modern-screenboard-shell :deep(#annotateScreen:hover),
.ms-modern-screenboard-shell :deep(#toolbarToggleScreen:hover) {
  background: rgba(30, 41, 59, 0.9) !important;
  border-color: rgba(96, 165, 250, 0.28) !important;
}

.ms-modern-screenboard-shell :deep(.toolbarScreen) {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.78) !important;
  box-shadow: var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 10px !important;
}

.ms-modern-screenboard-shell :deep(.dropdown-menu) {
  border: 1px solid rgba(148, 163, 184, 0.16) !important;
  border-radius: 18px !important;
  background: rgba(8, 17, 32, 0.94) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
  box-shadow: var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22));
  overflow: hidden;
}

.ms-modern-screenboard-shell :deep(.dropdown-item) {
  color: var(--ms-modern-text-primary, #f8fafc) !important;
  border-radius: 12px;
}

.ms-modern-screenboard-shell :deep(.dropdown-item:hover) {
  background: rgba(37, 99, 235, 0.18) !important;
}

.ms-modern-screenboard-shell :deep(.custom-select) {
  border: 1px solid rgba(148, 163, 184, 0.16) !important;
  border-radius: 14px !important;
  background: rgba(8, 17, 32, 0.84) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
}

.ms-modern-screenboard-shell :deep(canvas) {
  border-radius: 18px;
}
</style>