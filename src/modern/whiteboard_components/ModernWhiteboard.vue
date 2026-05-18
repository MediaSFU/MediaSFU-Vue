<template>
  <div class="ms-modern-whiteboard-shell">
    <ClassicWhiteboard v-bind="props" />
  </div>
</template>

<script setup lang="ts">
import ClassicWhiteboard from '../../components/whiteboardComponents/Whiteboard.vue';
import type { WhiteboardProps } from '../../components/whiteboardComponents/Whiteboard.vue';

const props = defineProps<WhiteboardProps>();
</script>

<style scoped>
.ms-modern-whiteboard-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: var(--ms-modern-text-primary, #f8fafc);
}

.ms-modern-whiteboard-shell :deep(#whiteboard-interface) {
  border: 1px solid var(--ms-modern-panel-border, rgba(148, 163, 184, 0.18)) !important;
  border-radius: 28px !important;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 36%),
    linear-gradient(
      180deg,
      var(--ms-modern-panel-surface-elevated, rgba(15, 27, 49, 0.9)) 0%,
      var(--ms-modern-panel-surface, rgba(10, 18, 33, 0.82)) 100%
    ) !important;
  box-shadow: var(--ms-modern-shadow-elevated, 0 24px 60px rgba(2, 8, 23, 0.36));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden !important;
}

.ms-modern-whiteboard-shell :deep(#whiteboardContent) {
  padding: 12px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(148, 163, 184, 0.12) 0%, rgba(148, 163, 184, 0.04) 100%) !important;
}

.ms-modern-whiteboard-shell :deep(.btnBoard),
.ms-modern-whiteboard-shell :deep(#toolbarToggle) {
  border: 1px solid var(--ms-modern-field-border, rgba(148, 163, 184, 0.26)) !important;
  border-radius: 9999px !important;
  background: var(--ms-modern-field-background, rgba(15, 23, 42, 0.74)) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
  box-shadow: var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ms-modern-whiteboard-shell :deep(.btnBoard:hover),
.ms-modern-whiteboard-shell :deep(#toolbarToggle:hover),
.ms-modern-whiteboard-shell :deep(.btnBoard:focus-visible),
.ms-modern-whiteboard-shell :deep(#toolbarToggle:focus-visible) {
  background: var(--ms-modern-panel-surface-elevated, rgba(15, 27, 49, 0.9)) !important;
  border-color: var(--ms-modern-panel-border-strong, rgba(96, 165, 250, 0.32)) !important;
  outline: none !important;
  box-shadow: var(--ms-modern-shadow-focus, 0 0 0 3px rgba(96, 165, 250, 0.24));
}

.ms-modern-whiteboard-shell :deep(.btnBoard.active),
.ms-modern-whiteboard-shell :deep(.toolbar .btn-group button.active),
.ms-modern-whiteboard-shell :deep(#toggleBackground.active) {
  background: linear-gradient(
    135deg,
    var(--ms-modern-brand-primary, #6366f1) 0%,
    var(--ms-modern-brand-secondary, #3b82f6) 55%,
    var(--ms-modern-accent, #06b6d4) 100%
  ) !important;
  border-color: transparent !important;
  color: #ffffff !important;
}

.ms-modern-whiteboard-shell :deep(.toolbar) {
  border: 1px solid var(--ms-modern-panel-border, rgba(148, 163, 184, 0.18));
  border-radius: 22px;
  background: var(--ms-modern-panel-surface, rgba(10, 18, 33, 0.82)) !important;
  box-shadow: var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 10px !important;
}

.ms-modern-whiteboard-shell :deep(.toolbar .btn-group button),
.ms-modern-whiteboard-shell :deep(.toolbar .dropdown-menu button) {
  color: var(--ms-modern-text-primary, #f8fafc) !important;
}

.ms-modern-whiteboard-shell :deep(.dropdown-menu) {
  border: 1px solid var(--ms-modern-panel-border, rgba(148, 163, 184, 0.18)) !important;
  border-radius: 18px !important;
  background: var(--ms-modern-panel-surface-elevated, rgba(15, 27, 49, 0.9)) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
  box-shadow: var(--ms-modern-shadow-soft, 0 12px 32px rgba(2, 8, 23, 0.22));
  overflow: hidden;
}

.ms-modern-whiteboard-shell :deep(.dropdown-menu button),
.ms-modern-whiteboard-shell :deep(.dropdown-item) {
  color: var(--ms-modern-text-primary, #f8fafc) !important;
  border-radius: 12px;
  background: transparent !important;
}

.ms-modern-whiteboard-shell :deep(.dropdown-menu button:hover),
.ms-modern-whiteboard-shell :deep(.dropdown-item:hover) {
  background: rgba(59, 130, 246, 0.14) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
}

.ms-modern-whiteboard-shell :deep(.custom-select),
.ms-modern-whiteboard-shell :deep(.form-control) {
  border: 1px solid var(--ms-modern-field-border, rgba(148, 163, 184, 0.26)) !important;
  border-radius: 14px !important;
  background: var(--ms-modern-field-background, rgba(15, 23, 42, 0.74)) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
}

.ms-modern-whiteboard-shell :deep(.custom-select:focus-visible),
.ms-modern-whiteboard-shell :deep(.form-control:focus-visible) {
  outline: none !important;
  border-color: var(--ms-modern-field-border-focus, rgba(96, 165, 250, 0.72)) !important;
  box-shadow: var(--ms-modern-shadow-focus, 0 0 0 3px rgba(96, 165, 250, 0.24));
}

.ms-modern-whiteboard-shell :deep(.custom-select option) {
  background: var(--ms-modern-panel-surface-elevated, rgba(15, 27, 49, 0.9));
  color: var(--ms-modern-text-primary, #f8fafc);
}

.ms-modern-whiteboard-shell :deep(#colorPicker) {
  border: 1px solid var(--ms-modern-field-border, rgba(148, 163, 184, 0.26)) !important;
  background: var(--ms-modern-field-background, rgba(15, 23, 42, 0.74)) !important;
}

.ms-modern-whiteboard-shell :deep(#whiteboardCanvas),
.ms-modern-whiteboard-shell :deep(canvas) {
  border: 1px solid var(--ms-modern-panel-border-strong, rgba(96, 165, 250, 0.32)) !important;
  background-color: #ffffff !important;
  border-radius: 18px;
}

.ms-modern-whiteboard-shell :deep(#textInput) {
  border: 1px solid var(--ms-modern-field-border, rgba(148, 163, 184, 0.26)) !important;
  border-radius: 14px !important;
  background: var(--ms-modern-panel-surface-elevated, rgba(15, 27, 49, 0.9)) !important;
  color: var(--ms-modern-text-primary, #f8fafc) !important;
}

</style>