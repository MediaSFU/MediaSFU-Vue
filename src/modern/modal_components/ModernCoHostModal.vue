<template>
  <div
    v-if="isEmbedded"
    class="ms-modern-cohost-panel"
  >
    <div
      class="ms-modern-cohost-panel__header"
      v-bind="mergedProps.headerProps"
    >
      <h2
        class="ms-modern-cohost-panel__title"
        v-bind="mergedProps.titleProps"
      >
        <FontAwesomeIcon :icon="faUserShield" />
        <span><RenderVNode :node="resolvedTitleNode" /></span>
      </h2>
      <button
        type="button"
        class="ms-modern-cohost-panel__close"
        v-bind="buttonAttrs(mergedProps.closeButtonProps)"
        @click="invokeButtonHandler(mergedProps.closeButtonProps?.onClick, $event, props.onCoHostClose)"
      >
        <RenderVNode :node="resolvedCloseIconNode" />
      </button>
    </div>

    <div
      class="ms-modern-cohost-panel__body"
      v-bind="mergedProps.bodyProps"
    >
      <section
        v-if="currentCohostValue"
        class="ms-modern-cohost-panel__section"
        v-bind="mergedProps.currentCoHostFieldProps"
      >
        <label
          class="ms-modern-cohost-panel__label"
          v-bind="mergedProps.currentCoHostLabelProps"
        >
          <RenderVNode :node="resolvedCurrentCoHostLabelNode" />
        </label>
        <div
          class="ms-modern-cohost-panel__current"
          v-bind="mergedProps.currentCoHostInputProps"
        >
          <FontAwesomeIcon :icon="faUserShield" />
          <span>{{ currentCohostValue }}</span>
        </div>
      </section>

      <section
        class="ms-modern-cohost-panel__section"
        v-bind="mergedProps.selectCoHostFieldProps"
      >
        <label
          class="ms-modern-cohost-panel__label"
          v-bind="mergedProps.selectCoHostLabelProps"
        >
          <RenderVNode :node="resolvedSelectCoHostLabelNode" />
        </label>
        <p class="ms-modern-cohost-panel__helper">
          Choose the participant who should handle the delegated room controls.
        </p>
        <div class="ms-modern-cohost-panel__select-shell">
          <select
            v-model="selectedCoHost"
            class="ms-modern-cohost-panel__select"
            aria-label="Select co-host"
            v-bind="mergedProps.selectCoHostSelectProps"
          >
            <option value="">Select a participant</option>
            <option
              v-for="(participant, index) in eligibleParticipants"
              :key="participantKey(participant, index)"
              :value="participant.name"
            >
              {{ participant.name }}
            </option>
          </select>
          <FontAwesomeIcon
            :icon="faChevronDown"
            class="ms-modern-cohost-panel__select-chevron"
          />
        </div>
      </section>

      <section
        class="ms-modern-cohost-panel__responsibilities"
        v-bind="mergedProps.responsibilitiesWrapperProps"
      >
        <div
          class="ms-modern-cohost-panel__responsibility-header"
          v-bind="mergedProps.responsibilitiesHeaderRowProps"
        >
          <span v-bind="mergedProps.responsibilityHeaderLabelProps">
            <RenderVNode :node="resolvedResponsibilityHeaderLabelNode" />
          </span>
          <span v-bind="mergedProps.responsibilitySelectHeaderProps">
            <RenderVNode :node="resolvedResponsibilitySelectLabelNode" />
          </span>
          <span v-bind="mergedProps.responsibilityDedicatedHeaderProps">
            <RenderVNode :node="resolvedResponsibilityDedicatedLabelNode" />
          </span>
        </div>

        <div class="ms-modern-cohost-panel__responsibility-list">
          <div
            v-for="item in responsibilityItemsResolved"
            :key="item.name"
            class="ms-modern-cohost-panel__responsibility-row"
            v-bind="mergedProps.responsibilityRowProps"
          >
            <div
              class="ms-modern-cohost-panel__responsibility-name"
              v-bind="mergedProps.responsibilityNameProps"
            >
              <RenderVNode :node="item.label" />
            </div>

            <div v-bind="mergedProps.responsibilitySelectProps">
              <input
                type="checkbox"
                :checked="getResponsibilityValue(item.name)"
                v-bind="mergedProps.responsibilitySelectCheckboxProps"
                @change="toggleResponsibility(item.name, 'value')"
              >
            </div>

            <div v-bind="mergedProps.responsibilityDedicatedProps">
              <input
                type="checkbox"
                :checked="getResponsibilityDedicated(item.name)"
                :disabled="!getResponsibilityValue(item.name)"
                :class="{
                  'ms-modern-cohost-panel__checkbox--disabled': !getResponsibilityValue(item.name),
                }"
                v-bind="mergedProps.responsibilityDedicatedCheckboxProps"
                @change="toggleResponsibility(item.name, 'dedicated')"
              >
            </div>
          </div>
        </div>
      </section>
    </div>

    <div
      class="ms-modern-cohost-panel__footer"
      v-bind="mergedProps.footerProps"
    >
      <button
        type="button"
        class="ms-modern-cohost-panel__save"
        v-bind="buttonAttrs(mergedProps.saveButtonProps)"
        @click="invokeButtonHandler(mergedProps.saveButtonProps?.onClick, $event, handleSave)"
      >
        <FontAwesomeIcon :icon="faCheck" />
        <RenderVNode :node="resolvedSaveButtonLabelNode" />
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showModal"
      v-bind="modalOverlayProps"
      @click.self="props.onCoHostClose"
    >
      <div v-bind="modalContentProps">
        <div class="ms-modern-cohost-panel ms-modern-cohost-panel--modal">
          <div
            class="ms-modern-cohost-panel__header"
            v-bind="mergedProps.headerProps"
          >
            <h2
              class="ms-modern-cohost-panel__title"
              v-bind="mergedProps.titleProps"
            >
              <FontAwesomeIcon :icon="faUserShield" />
              <span><RenderVNode :node="resolvedTitleNode" /></span>
            </h2>
            <button
              type="button"
              class="ms-modern-cohost-panel__close"
              v-bind="buttonAttrs(mergedProps.closeButtonProps)"
              @click="invokeButtonHandler(mergedProps.closeButtonProps?.onClick, $event, props.onCoHostClose)"
            >
              <RenderVNode :node="resolvedCloseIconNode" />
            </button>
          </div>

          <div
            class="ms-modern-cohost-panel__body"
            v-bind="mergedProps.bodyProps"
          >
            <section
              v-if="currentCohostValue"
              class="ms-modern-cohost-panel__section"
              v-bind="mergedProps.currentCoHostFieldProps"
            >
              <label
                class="ms-modern-cohost-panel__label"
                v-bind="mergedProps.currentCoHostLabelProps"
              >
                <RenderVNode :node="resolvedCurrentCoHostLabelNode" />
              </label>
              <div
                class="ms-modern-cohost-panel__current"
                v-bind="mergedProps.currentCoHostInputProps"
              >
                <FontAwesomeIcon :icon="faUserShield" />
                <span>{{ currentCohostValue }}</span>
              </div>
            </section>

            <section
              class="ms-modern-cohost-panel__section"
              v-bind="mergedProps.selectCoHostFieldProps"
            >
              <label
                class="ms-modern-cohost-panel__label"
                v-bind="mergedProps.selectCoHostLabelProps"
              >
                <RenderVNode :node="resolvedSelectCoHostLabelNode" />
              </label>
              <p class="ms-modern-cohost-panel__helper">
                Choose the participant who should handle the delegated room controls.
              </p>
              <div class="ms-modern-cohost-panel__select-shell">
                <select
                  v-model="selectedCoHost"
                  class="ms-modern-cohost-panel__select"
                  aria-label="Select co-host"
                  v-bind="mergedProps.selectCoHostSelectProps"
                >
                  <option value="">Select a participant</option>
                  <option
                    v-for="(participant, index) in eligibleParticipants"
                    :key="participantKey(participant, index)"
                    :value="participant.name"
                  >
                    {{ participant.name }}
                  </option>
                </select>
                <FontAwesomeIcon
                  :icon="faChevronDown"
                  class="ms-modern-cohost-panel__select-chevron"
                />
              </div>
            </section>

            <section
              class="ms-modern-cohost-panel__responsibilities"
              v-bind="mergedProps.responsibilitiesWrapperProps"
            >
              <div
                class="ms-modern-cohost-panel__responsibility-header"
                v-bind="mergedProps.responsibilitiesHeaderRowProps"
              >
                <span v-bind="mergedProps.responsibilityHeaderLabelProps">
                  <RenderVNode :node="resolvedResponsibilityHeaderLabelNode" />
                </span>
                <span v-bind="mergedProps.responsibilitySelectHeaderProps">
                  <RenderVNode :node="resolvedResponsibilitySelectLabelNode" />
                </span>
                <span v-bind="mergedProps.responsibilityDedicatedHeaderProps">
                  <RenderVNode :node="resolvedResponsibilityDedicatedLabelNode" />
                </span>
              </div>

              <div class="ms-modern-cohost-panel__responsibility-list">
                <div
                  v-for="item in responsibilityItemsResolved"
                  :key="`modal-${item.name}`"
                  class="ms-modern-cohost-panel__responsibility-row"
                  v-bind="mergedProps.responsibilityRowProps"
                >
                  <div
                    class="ms-modern-cohost-panel__responsibility-name"
                    v-bind="mergedProps.responsibilityNameProps"
                  >
                    <RenderVNode :node="item.label" />
                  </div>

                  <div v-bind="mergedProps.responsibilitySelectProps">
                    <input
                      type="checkbox"
                      :checked="getResponsibilityValue(item.name)"
                      v-bind="mergedProps.responsibilitySelectCheckboxProps"
                      @change="toggleResponsibility(item.name, 'value')"
                    >
                  </div>

                  <div v-bind="mergedProps.responsibilityDedicatedProps">
                    <input
                      type="checkbox"
                      :checked="getResponsibilityDedicated(item.name)"
                      :disabled="!getResponsibilityValue(item.name)"
                      :class="{
                        'ms-modern-cohost-panel__checkbox--disabled': !getResponsibilityValue(item.name),
                      }"
                      v-bind="mergedProps.responsibilityDedicatedCheckboxProps"
                      @change="toggleResponsibility(item.name, 'dedicated')"
                    >
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div
            class="ms-modern-cohost-panel__footer"
            v-bind="mergedProps.footerProps"
          >
            <button
              type="button"
              class="ms-modern-cohost-panel__save"
              v-bind="buttonAttrs(mergedProps.saveButtonProps)"
              @click="invokeButtonHandler(mergedProps.saveButtonProps?.onClick, $event, handleSave)"
            >
              <FontAwesomeIcon :icon="faCheck" />
              <RenderVNode :node="resolvedSaveButtonLabelNode" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faChevronDown, faTimes, faUserShield } from '@fortawesome/free-solid-svg-icons';
import {
  computed,
  defineComponent,
  h,
  isVNode,
  ref,
  watch,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type PropType,
  type SelectHTMLAttributes,
  type VNodeChild,
} from 'vue';
import { modifyCoHostSettings } from 'mediasfu-shared';
import type {
  CoHostModalProps,
  CoHostResponsibility,
  ModifyCoHostSettingsOptions,
  Participant,
} from '../../components/coHostComponents/CoHostModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernCoHostRenderMode = 'modal' | 'sidebar' | 'inline';

export interface ModernCoHostModalProps extends CoHostModalProps {
  renderMode?: ModernCoHostRenderMode;
}

const props = defineProps<ModernCoHostModalProps>();

const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    node: {
      type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>,
      default: null,
    },
  },
  render() {
    if (!this.node) return null;
    if (isVNode(this.node)) return this.node;
    if (typeof this.node === 'function') {
      const result = (this.node as () => VNodeChild)();
      return isVNode(result) ? result : String(result);
    }
    return this.node as VNodeChild;
  },
});

const isEmbedded = computed(() => props.renderMode === 'sidebar' || props.renderMode === 'inline');
const showModal = computed(() => !isEmbedded.value && props.isCoHostModalVisible);

const selectedCoHost = ref('');
const responsibilities = ref<CoHostResponsibility[]>([]);

const syncStateFromProps = () => {
  selectedCoHost.value = props.currentCohost ?? '';
  responsibilities.value = (props.coHostResponsibility ?? []).map((responsibility) => ({ ...responsibility }));
};

watch(
  () => props.currentCohost,
  syncStateFromProps,
  { immediate: true },
);

watch(
  () => props.coHostResponsibility,
  syncStateFromProps,
  { deep: true, immediate: true },
);

const currentCohostValue = computed(() => props.currentCohost?.trim() ?? '');

const eligibleParticipants = computed(() =>
  (props.participants ?? []).filter(
    (participant) => participant?.name && String(participant.islevel ?? '') !== '2',
  ),
);

const participantKey = (participant: Participant, index: number) =>
  `${participant.name ?? 'participant'}-${index}`;

const titleizeResponsibility = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (segment) => segment.toUpperCase());

const responsibilityItemsResolved = computed(() => {
  if (props.responsibilityItems?.length) {
    return props.responsibilityItems;
  }

  return responsibilities.value.map((responsibility) => ({
    name: responsibility.name,
    label: titleizeResponsibility(responsibility.name),
  }));
});

const getResponsibility = (name: string) =>
  responsibilities.value.find((responsibility) => responsibility.name === name);

const getResponsibilityValue = (name: string) => Boolean(getResponsibility(name)?.value);
const getResponsibilityDedicated = (name: string) => {
  const responsibility = getResponsibility(name);
  return Boolean(responsibility?.value && responsibility?.dedicated);
};

const toggleResponsibility = (name: string, field: 'value' | 'dedicated') => {
  responsibilities.value = responsibilities.value.map((responsibility) => {
    if (responsibility.name !== name) {
      return responsibility;
    }

    const nextValue = field === 'value' ? !responsibility.value : responsibility.value;
    const nextDedicated = field === 'dedicated'
      ? (responsibility.value ? !responsibility.dedicated : responsibility.dedicated)
      : nextValue ? responsibility.dedicated : false;

    return {
      ...responsibility,
      value: nextValue,
      dedicated: nextDedicated,
    };
  });
};

const handleSave = async () => {
  const modifySettings = props.onModifyEventSettings ?? modifyCoHostSettings;

  await Promise.resolve(
    modifySettings({
      roomName: props.roomName,
      showAlert: props.showAlert,
      selectedParticipant: selectedCoHost.value,
      coHost: props.currentCohost ?? '',
      coHostResponsibility: responsibilities.value,
      updateCoHostResponsibility: props.updateCoHostResponsibility,
      updateCoHost: props.updateCoHost,
      updateIsCoHostModalVisible: props.updateIsCoHostModalVisible,
      socket: props.socket,
    } as ModifyCoHostSettingsOptions),
  );

  props.onCoHostClose();
};

const resolvedTitleNode = computed<VNodeChild>(() => props.title ?? 'Co-Host Settings');
const resolvedCloseIconNode = computed<VNodeChild>(() => props.closeIconComponent ?? h(FontAwesomeIcon, { icon: faTimes }));
const resolvedCurrentCoHostLabelNode = computed<VNodeChild>(() => props.currentCoHostLabel ?? 'Current Co-Host');
const resolvedSelectCoHostLabelNode = computed<VNodeChild>(() => props.selectCoHostLabel ?? 'Select Co-Host');
const resolvedResponsibilityHeaderLabelNode = computed<VNodeChild>(() => props.responsibilityHeaderLabel ?? 'Responsibility');
const resolvedResponsibilitySelectLabelNode = computed<VNodeChild>(() => props.responsibilitySelectLabel ?? 'Enabled');
const resolvedResponsibilityDedicatedLabelNode = computed<VNodeChild>(() => props.responsibilityDedicatedLabel ?? 'Dedicated');
const resolvedSaveButtonLabelNode = computed<VNodeChild>(() => props.saveButtonLabel ?? 'Save Changes');

const buttonAttrs = <T extends ButtonHTMLAttributes | undefined>(attrs: T) => {
  if (!attrs) {
    return undefined;
  }

  const { onClick: _onClick, ...rest } = attrs as T & { onClick?: unknown };
  return rest as T;
};

const invokeButtonHandler = (
  handler: unknown,
  event: MouseEvent,
  fallback: () => void | Promise<void>,
) => {
  if (typeof handler === 'function') {
    (handler as (event: MouseEvent) => void)(event);
  }

  if (!event.defaultPrevented) {
    void fallback();
  }
};

const panelGradientBackground =
  'linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%)';

const defaultContentProps = computed<HTMLAttributes>(() => ({
  style: {
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '28px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
  },
}));

const embeddedContentProps = computed<HTMLAttributes>(() => ({
  style: {
    position: 'relative',
    width: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    height: '100%',
    margin: 0,
    padding: 0,
    background: panelGradientBackground,
    border: '1px solid var(--ms-modern-panel-border)',
    borderRadius: '24px',
    boxShadow: 'var(--ms-modern-shadow-elevated)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    overflow: 'hidden',
    color: 'var(--ms-modern-text-primary)',
    boxSizing: 'border-box',
  },
}));

const defaultHeaderProps: HTMLAttributes = {
  style: {
    padding: '20px 22px 16px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  },
};

const defaultTitleProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    cursor: 'pointer',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    padding: '0 22px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowX: 'hidden',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
  },
};

const defaultFieldProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gap: '8px',
    padding: '16px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border-strong)',
    background: 'linear-gradient(180deg, color-mix(in srgb, var(--ms-modern-panel-surface-elevated) 88%, transparent) 0%, var(--ms-modern-panel-surface) 100%)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
  },
};

const defaultLabelProps: LabelHTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
};

const defaultInputProps: InputHTMLAttributes = {
  style: {
    width: '100%',
    minHeight: '46px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    outline: 'none',
  },
};

const defaultSelectProps: SelectHTMLAttributes = {
  style: {
    width: '100%',
    minHeight: '46px',
    padding: '0 38px 0 14px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    outline: 'none',
    appearance: 'none',
  },
};

const defaultResponsibilitiesWrapperProps: HTMLAttributes = {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    flex: '1 1 260px',
    minHeight: '260px',
    padding: '14px',
    borderRadius: '22px',
    border: '1px solid var(--ms-modern-panel-border-strong)',
    background: 'linear-gradient(180deg, color-mix(in srgb, var(--ms-modern-panel-surface-elevated) 92%, transparent) 0%, var(--ms-modern-panel-surface) 100%)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
    overflowX: 'hidden',
  },
};

const defaultResponsibilitiesHeaderRowProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 54px 72px',
    gap: '6px',
    alignItems: 'center',
    paddingBottom: '10px',
    marginBottom: '10px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
  },
};

const defaultResponsibilityHeaderLabelProps: LabelHTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-secondary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: '0.66rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

const defaultResponsibilityRowProps: HTMLAttributes = {
  style: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 54px 72px',
    gap: '6px',
    alignItems: 'center',
    padding: '12px 10px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.035)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
  },
};

const defaultResponsibilityNameProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
};

const defaultResponsibilityControlProps: HTMLAttributes = {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const defaultCheckboxProps: InputHTMLAttributes = {
  style: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--ms-modern-accent)',
    cursor: 'pointer',
  },
};

const defaultFooterProps: HTMLAttributes = {
  style: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 22px 22px',
  },
};

const defaultSaveButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '46px',
    width: '100%',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '18px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
};

const mergedProps = computed(() => ({
  ...props,
  contentProps: mergeAttrObjects(
    isEmbedded.value ? embeddedContentProps.value : defaultContentProps.value,
    props.contentProps,
  ),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  currentCoHostFieldProps: mergeAttrObjects(defaultFieldProps, props.currentCoHostFieldProps),
  currentCoHostLabelProps: mergeAttrObjects(defaultLabelProps, props.currentCoHostLabelProps),
  currentCoHostInputProps: mergeAttrObjects(defaultInputProps, props.currentCoHostInputProps),
  selectCoHostFieldProps: mergeAttrObjects(defaultFieldProps, props.selectCoHostFieldProps),
  selectCoHostLabelProps: mergeAttrObjects(defaultLabelProps, props.selectCoHostLabelProps),
  selectCoHostSelectProps: mergeAttrObjects(defaultSelectProps, props.selectCoHostSelectProps),
  responsibilitiesWrapperProps: mergeAttrObjects(defaultResponsibilitiesWrapperProps, props.responsibilitiesWrapperProps),
  responsibilitiesHeaderRowProps: mergeAttrObjects(defaultResponsibilitiesHeaderRowProps, props.responsibilitiesHeaderRowProps),
  responsibilityHeaderLabelProps: mergeAttrObjects(defaultResponsibilityHeaderLabelProps, props.responsibilityHeaderLabelProps),
  responsibilitySelectHeaderProps: mergeAttrObjects(defaultResponsibilityHeaderLabelProps, props.responsibilitySelectHeaderProps),
  responsibilityDedicatedHeaderProps: mergeAttrObjects(defaultResponsibilityHeaderLabelProps, props.responsibilityDedicatedHeaderProps),
  responsibilityRowProps: mergeAttrObjects(defaultResponsibilityRowProps, props.responsibilityRowProps),
  responsibilityNameProps: mergeAttrObjects(defaultResponsibilityNameProps, props.responsibilityNameProps),
  responsibilitySelectProps: mergeAttrObjects(defaultResponsibilityControlProps, props.responsibilitySelectProps),
  responsibilityDedicatedProps: mergeAttrObjects(defaultResponsibilityControlProps, props.responsibilityDedicatedProps),
  responsibilitySelectCheckboxProps: mergeAttrObjects(defaultCheckboxProps, props.responsibilitySelectCheckboxProps),
  responsibilityDedicatedCheckboxProps: mergeAttrObjects(defaultCheckboxProps, props.responsibilityDedicatedCheckboxProps),
  footerProps: mergeAttrObjects(defaultFooterProps, props.footerProps),
  saveButtonProps: mergeAttrObjects(defaultSaveButtonProps, props.saveButtonProps),
}));

const modalOverlayProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-cohost-dialog__overlay',
      style: {
        position: 'fixed',
        inset: 0,
        display: 'block',
        background: 'var(--ms-modern-overlay-backdrop)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999,
      },
    },
    props.overlayProps,
  ),
);

const modalPositionStyles = computed(() => {
  const position = props.position ?? 'topRight';
  return {
    top: position.includes('top') ? '16px' : 'auto',
    bottom: position.includes('bottom') ? '16px' : 'auto',
    left: position.includes('Left') ? '16px' : 'auto',
    right: position.includes('Right') ? '16px' : 'auto',
  };
});

const modalContentProps = computed<HTMLAttributes>(() =>
  mergeAttrObjects(
    {
      class: 'ms-modern-cohost-dialog__panel',
      style: {
        position: 'fixed',
        width: 'min(460px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '28px',
        border: '1px solid var(--ms-modern-panel-border)',
        background: panelGradientBackground,
        boxShadow: 'var(--ms-modern-shadow-elevated)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--ms-modern-text-primary)',
        ...modalPositionStyles.value,
      },
    },
    mergedProps.value.contentProps,
  ),
);
</script>

<style scoped>
.ms-modern-cohost-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: linear-gradient(180deg, var(--ms-modern-panel-surface-elevated) 0%, var(--ms-modern-panel-surface) 100%);
  color: var(--ms-modern-text-primary);
}

.ms-modern-cohost-panel--modal {
  min-height: min(620px, calc(100vh - 32px));
}

.ms-modern-cohost-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ms-modern-cohost-panel__title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ms-modern-cohost-panel__close,
.ms-modern-cohost-panel__save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ms-modern-cohost-panel__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.ms-modern-cohost-panel__section {
  min-width: 0;
}

.ms-modern-cohost-panel__helper {
  margin: -2px 0 2px;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 12px;
  line-height: 1.45;
}

.ms-modern-cohost-panel__label {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.ms-modern-cohost-panel__current {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ms-modern-cohost-panel__select-shell {
  position: relative;
}

.ms-modern-cohost-panel__select {
  box-sizing: border-box;
}

.ms-modern-cohost-panel__responsibilities {
  min-height: 0;
}

.ms-modern-cohost-panel__responsibility-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ms-modern-cohost-panel__select-chevron {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--ms-modern-text-secondary);
}

.ms-modern-cohost-panel__responsibility-header,
.ms-modern-cohost-panel__responsibility-row {
  box-sizing: border-box;
}

.ms-modern-cohost-panel__responsibility-name {
  min-width: 0;
}

.ms-modern-cohost-panel__checkbox--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ms-modern-cohost-panel__footer {
  margin-top: auto;
}

.ms-modern-cohost-panel__save {
  width: 100%;
}

@media (max-width: 640px) {
  .ms-modern-cohost-panel__body {
    padding: 0 16px 16px !important;
  }

  .ms-modern-cohost-panel__responsibility-header,
  .ms-modern-cohost-panel__responsibility-row {
    grid-template-columns: minmax(0, 1fr) 48px 60px !important;
  }

  .ms-modern-cohost-panel__responsibility-row {
    padding: 10px 8px !important;
  }
}
</style>