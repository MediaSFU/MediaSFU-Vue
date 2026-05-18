<template>
  <ClassicPollModal v-bind="mergedProps">
    <template
      v-for="(_, slotName) in slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps ?? {}"
      />
    </template>
  </ClassicPollModal>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  ref,
  useSlots,
  watch,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FormHTMLAttributes,
  type VNodeChild,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChartBar,
  faCheck,
  faChevronDown,
  faPlus,
  faStop,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import ClassicPollModal from '../../components/pollsComponents/PollModal.vue';
import type { PollModalProps } from '../../components/pollsComponents/PollModal.vue';
import { mergeAttrObjects } from '../display_components/styleUtils';

type ModernPollRenderMode = 'modal' | 'sidebar' | 'inline';
type PollTab = 'active' | 'create' | 'history';
type PollType = PollModalProps['polls'][number];
type NewPollType = '' | 'trueFalse' | 'yesNo' | 'custom';

interface ModernPollModalProps extends PollModalProps {
  renderMode?: ModernPollRenderMode;
  isDarkMode?: boolean;
}

interface NewPollFormState {
  question: string;
  type: NewPollType;
  options: string[];
}

const props = withDefaults(defineProps<ModernPollModalProps>(), {
  renderMode: 'modal',
  isDarkMode: true,
});
const slots = useSlots();

const activeTab = ref<PollTab>('active');
const selectedOption = ref<number | null>(null);
const embeddedNewPoll = ref<NewPollFormState>({
  question: '',
  type: '',
  options: ['', ''],
});

const resolvedRenderMode = computed<ModernPollRenderMode>(() => props.renderMode ?? 'modal');
const isEmbeddedMode = computed(() => resolvedRenderMode.value === 'sidebar' || resolvedRenderMode.value === 'inline');
const isCompactViewport = computed(
  () => !isEmbeddedMode.value && typeof window !== 'undefined' && window.innerWidth <= 640,
);

const joinClassNames = (...classes: Array<string | false | null | undefined>) => {
  const filtered = classes.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ') : undefined;
};

const availableTabs = computed<PollTab[]>(() => (
  props.islevel === '2' ? ['active', 'create', 'history'] : ['active', 'history']
));

const isPollActive = (poll: PollType | null | undefined) => (poll?.status || '').toLowerCase() === 'active';

const getVoteStats = (poll: PollType | null | undefined) => {
  if (!poll) {
    return { totalVotes: 0, rows: [] as Array<{ label: string; count: number; percent: number }> };
  }

  const votes = poll.votes || [];
  const totalVotes = votes.reduce((sum, value) => sum + (value || 0), 0);
  const rows = votes.map((count, index) => {
    const label = poll.options?.[index] ?? `Option ${index + 1}`;
    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { label, count, percent };
  });

  return { totalVotes, rows };
};

const activePollEnded = computed(() => (props.poll ? !isPollActive(props.poll) : false));

const presetOptionsForType = (type: NewPollType): string[] => {
  switch (type) {
    case 'trueFalse':
      return ['True', 'False'];
    case 'yesNo':
      return ['Yes', 'No'];
    case 'custom':
      return ['', ''];
    default:
      return ['', ''];
  }
};

const resetEmbeddedPoll = () => {
  embeddedNewPoll.value = {
    question: '',
    type: '',
    options: ['', ''],
  };
};

const updateEmbeddedPollType = (type: NewPollType) => {
  embeddedNewPoll.value = {
    ...embeddedNewPoll.value,
    type,
    options: presetOptionsForType(type),
  };
};

const updateEmbeddedOption = (index: number, value: string) => {
  const nextOptions = [...embeddedNewPoll.value.options];
  nextOptions[index] = value;
  embeddedNewPoll.value = {
    ...embeddedNewPoll.value,
    options: nextOptions,
  };
};

const addEmbeddedOption = () => {
  embeddedNewPoll.value = {
    ...embeddedNewPoll.value,
    options: [...embeddedNewPoll.value.options, ''],
  };
};

const createEmbeddedPoll = async () => {
  if (!embeddedNewPoll.value.question.trim() || !embeddedNewPoll.value.type) {
    return;
  }

  const options = embeddedNewPoll.value.type === 'custom'
    ? embeddedNewPoll.value.options.map((option) => option.trim()).filter(Boolean)
    : presetOptionsForType(embeddedNewPoll.value.type);

  if (embeddedNewPoll.value.type === 'custom' && options.length < 2) {
    props.showAlert?.({
      message: 'Please provide at least two options for a custom poll.',
      type: 'danger',
    });
    return;
  }

  await props.handleCreatePoll({
    poll: {
      question: embeddedNewPoll.value.question.trim(),
      type: embeddedNewPoll.value.type,
      options,
    },
    socket: props.socket,
    roomName: props.roomName,
    showAlert: props.showAlert,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });

  resetEmbeddedPoll();
  activeTab.value = 'active';
};

const voteOnEmbeddedPoll = async () => {
  if (selectedOption.value === null || !props.poll) {
    return;
  }

  await props.handleVotePoll({
    pollId: props.poll.id,
    optionIndex: selectedOption.value,
    socket: props.socket,
    showAlert: props.showAlert,
    member: props.member,
    roomName: props.roomName,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });

  selectedOption.value = null;
};

const endEmbeddedPoll = async (pollId?: string) => {
  if (!pollId) {
    return;
  }

  await props.handleEndPoll({
    pollId,
    socket: props.socket,
    showAlert: props.showAlert,
    roomName: props.roomName,
    updateIsPollModalVisible: props.updateIsPollModalVisible,
  });
};

watch(
  () => props.poll?.id,
  () => {
    selectedOption.value = null;
    if (props.poll && isPollActive(props.poll)) {
      activeTab.value = 'active';
    }
  },
);

watch(
  () => props.isPollModalVisible,
  (isVisible) => {
    if (isVisible && props.poll && isPollActive(props.poll)) {
      activeTab.value = 'active';
    }
  },
);

watch(
  () => props.islevel,
  (level) => {
    if (level !== '2' && activeTab.value === 'create') {
      activeTab.value = 'active';
    }
  },
  { immediate: true },
);

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

const embeddedOverlayProps = computed<HTMLAttributes>(() => ({
  class: `ms-modern-poll-modal ms-modern-poll-modal--${resolvedRenderMode.value}`,
  style: {
    position: 'relative',
    inset: 'auto',
    width: '100%',
    height: '100%',
    minHeight: 0,
    display: props.isPollModalVisible ? 'flex' : 'none',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    zIndex: 'auto',
  } satisfies CSSProperties,
}));

const defaultHeaderProps: HTMLAttributes = {
  style: {
    padding: isCompactViewport.value ? '16px 16px 12px' : '20px 22px 16px',
    borderBottom: '1px solid var(--ms-modern-panel-border)',
    background: panelGradientBackground,
  },
};

const defaultTitleProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontSize: isCompactViewport.value ? '0.96rem' : '1rem',
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
};

const defaultCloseButtonProps: ButtonHTMLAttributes = {
  style: {
    width: isCompactViewport.value ? '32px' : '38px',
    height: isCompactViewport.value ? '32px' : '38px',
    borderRadius: isCompactViewport.value ? '12px' : '9999px',
    border: isCompactViewport.value ? 'none' : '1px solid var(--ms-modern-panel-border)',
    background: isCompactViewport.value ? 'transparent' : 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    backdropFilter: isCompactViewport.value ? 'none' : 'blur(12px)',
    WebkitBackdropFilter: isCompactViewport.value ? 'none' : 'blur(12px)',
    cursor: 'pointer',
  },
};

const defaultBodyProps: HTMLAttributes = {
  style: {
    padding: isCompactViewport.value ? '0 16px 16px' : '0 22px 22px',
    display: 'grid',
    gap: isCompactViewport.value ? '12px' : '14px',
  },
};

const defaultSectionProps: HTMLAttributes = {
  style: {
    padding: isCompactViewport.value ? '12px' : '14px',
    borderRadius: '20px',
    border: '1px solid var(--ms-modern-panel-border)',
    background: 'var(--ms-modern-panel-surface)',
    boxShadow: 'var(--ms-modern-shadow-soft)',
  },
};

const defaultSectionHeaderProps: HTMLAttributes = {
  style: {
    color: 'var(--ms-modern-text-primary)',
    fontSize: '0.86rem',
    marginBottom: '10px',
  },
};

const defaultFormProps: FormHTMLAttributes = {
  style: {
    display: 'grid',
    gap: '10px',
  },
};

const defaultInputProps: InputHTMLAttributes = {
  style: {
    width: '100%',
    minHeight: '44px',
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
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '14px',
    border: '1px solid var(--ms-modern-field-border)',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    outline: 'none',
  },
};

const defaultPrimaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '44px',
    borderRadius: '9999px',
    border: 'none',
    paddingInline: '16px',
    background:
      'linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 700,
    boxShadow: 'var(--ms-modern-shadow-soft)',
    cursor: 'pointer',
  },
};

const defaultSecondaryButtonProps: ButtonHTMLAttributes = {
  style: {
    minHeight: '44px',
    borderRadius: '9999px',
    border: '1px solid var(--ms-modern-panel-border)',
    paddingInline: '16px',
    background: 'var(--ms-modern-field-background)',
    color: 'var(--ms-modern-text-primary)',
    fontFamily: 'var(--ms-modern-font-family)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

const getSelectedOption = () => {
  const votedOption = props.poll?.voters && typeof props.poll.voters[props.member] === 'number'
    ? props.poll.voters[props.member]
    : null;
  return selectedOption.value ?? votedOption;
};

const renderActivePane = (): VNodeChild => {
  if (!props.poll) {
    return h('div', { class: 'ms-modern-poll-modal__empty-state' }, 'No active poll');
  }

  if (activePollEnded.value) {
    const stats = getVoteStats(props.poll);

    return h('section', { class: 'ms-modern-poll-modal__pane' }, [
      h('h3', { class: 'ms-modern-poll-modal__question' }, props.poll.question),
      h('div', { class: 'ms-modern-poll-modal__summary-card' }, [
        h('div', { class: 'ms-modern-poll-modal__summary-header' }, [
          h('span', { class: 'ms-modern-poll-modal__status-badge' }, 'Poll ended'),
          h('span', { class: 'ms-modern-poll-modal__summary-total' }, `${stats.totalVotes} votes`),
        ]),
        ...stats.rows.map((row) =>
          h('div', { class: 'ms-modern-poll-modal__summary-row' }, [
            h('span', { class: 'ms-modern-poll-modal__summary-label' }, row.label),
            h('div', { class: 'ms-modern-poll-modal__summary-track' }, [
              h('div', {
                class: 'ms-modern-poll-modal__summary-fill',
                style: { width: `${row.percent}%` },
              }),
            ]),
            h('span', { class: 'ms-modern-poll-modal__summary-count' }, `${row.count} (${row.percent}%)`),
          ]),
        ),
      ]),
    ]);
  }

  const currentSelection = getSelectedOption();

  return h('section', { class: 'ms-modern-poll-modal__pane' }, [
    h('h3', { class: 'ms-modern-poll-modal__question' }, props.poll.question),
    h(
      'div',
      { class: 'ms-modern-poll-modal__options' },
      props.poll.options.map((option, index) =>
        h(
          'button',
          {
            type: 'button',
            class: joinClassNames(
              'ms-modern-poll-modal__option',
              currentSelection === index && 'is-selected',
            ),
            onClick: () => {
              selectedOption.value = index;
            },
          },
          [
            h('span', { class: 'ms-modern-poll-modal__option-label' }, option),
            currentSelection === index
              ? h(FontAwesomeIcon, {
                  icon: faCheck,
                  class: 'ms-modern-poll-modal__option-check',
                })
              : null,
          ],
        ),
      ),
    ),
    h('div', { class: 'ms-modern-poll-modal__actions' }, [
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-poll-modal__primary-button',
          disabled: currentSelection === null,
          onClick: () => {
            void voteOnEmbeddedPoll();
          },
        },
        'Vote',
      ),
      props.islevel === '2'
        ? h(
            'button',
            {
              type: 'button',
              class: 'ms-modern-poll-modal__secondary-button ms-modern-poll-modal__secondary-button--danger',
              onClick: () => {
                void endEmbeddedPoll(props.poll?.id);
              },
            },
            [h(FontAwesomeIcon, { icon: faStop }), h('span', 'End')],
          )
        : null,
    ]),
  ]);
};

const renderCreatePane = (): VNodeChild => {
  if (props.islevel !== '2') {
    return null;
  }

  const customOptions = embeddedNewPoll.value.type === 'custom' && embeddedNewPoll.value.options.length > 0
    ? embeddedNewPoll.value.options
    : embeddedNewPoll.value.type === 'custom'
      ? ['', '']
      : embeddedNewPoll.value.options;

  return h('section', { class: 'ms-modern-poll-modal__pane' }, [
    h('textarea', {
      class: 'ms-modern-poll-modal__textarea',
      rows: 3,
      placeholder: 'Enter your question...',
      value: embeddedNewPoll.value.question,
      onInput: (event: Event) => {
        embeddedNewPoll.value = {
          ...embeddedNewPoll.value,
          question: (event.target as HTMLTextAreaElement).value,
        };
      },
    }),
    h('div', { class: 'ms-modern-poll-modal__select-wrapper' }, [
      h(
        'select',
        {
          class: 'ms-modern-poll-modal__select',
          value: embeddedNewPoll.value.type,
          onChange: (event: Event) => {
            updateEmbeddedPollType((event.target as HTMLSelectElement).value as NewPollType);
          },
        },
        [
          h('option', { value: '' }, 'Select poll type'),
          h('option', { value: 'trueFalse' }, 'True / False'),
          h('option', { value: 'yesNo' }, 'Yes / No'),
          h('option', { value: 'custom' }, 'Custom Options'),
        ],
      ),
      h(FontAwesomeIcon, {
        icon: faChevronDown,
        class: 'ms-modern-poll-modal__select-chevron',
      }),
    ]),
    embeddedNewPoll.value.type === 'custom'
      ? h('div', { class: 'ms-modern-poll-modal__custom-options' }, [
          ...customOptions.map((option, index) =>
            h('input', {
              type: 'text',
              class: 'ms-modern-poll-modal__input',
              placeholder: `Option ${index + 1}`,
              value: option,
              onInput: (event: Event) => {
                updateEmbeddedOption(index, (event.target as HTMLInputElement).value);
              },
            }),
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'ms-modern-poll-modal__secondary-button',
              onClick: addEmbeddedOption,
            },
            [h(FontAwesomeIcon, { icon: faPlus }), h('span', 'Add Option')],
          ),
        ])
      : null,
    h(
      'button',
      {
        type: 'button',
        class: 'ms-modern-poll-modal__primary-button',
        disabled: !embeddedNewPoll.value.question.trim() || !embeddedNewPoll.value.type,
        onClick: () => {
          void createEmbeddedPoll();
        },
      },
      'Create Poll',
    ),
  ]);
};

const renderHistoryPane = (): VNodeChild => {
  if (props.polls.length === 0) {
    return h('div', { class: 'ms-modern-poll-modal__empty-state' }, 'No previous polls');
  }

  return h(
    'div',
    { class: 'ms-modern-poll-modal__history-list' },
    props.polls.map((pollItem) => {
      const stats = getVoteStats(pollItem);
      const pollIsActive = isPollActive(pollItem);

      return h('section', { class: 'ms-modern-poll-modal__history-card' }, [
        h('div', { class: 'ms-modern-poll-modal__history-card-header' }, [
          h('h3', { class: 'ms-modern-poll-modal__history-card-title' }, pollItem.question),
          h(
            'span',
            {
              class: joinClassNames(
                'ms-modern-poll-modal__status-badge',
                pollIsActive && 'is-active',
              ),
            },
            pollIsActive ? 'Active' : 'Ended',
          ),
        ]),
        h('div', { class: 'ms-modern-poll-modal__history-meta' }, `${stats.totalVotes} ${stats.totalVotes === 1 ? 'vote' : 'votes'}`),
        h(
          'div',
          { class: 'ms-modern-poll-modal__history-results' },
          stats.rows.map((row) =>
            h('div', { class: 'ms-modern-poll-modal__summary-row' }, [
              h('span', { class: 'ms-modern-poll-modal__summary-label' }, row.label),
              h('div', { class: 'ms-modern-poll-modal__summary-track' }, [
                h('div', {
                  class: 'ms-modern-poll-modal__summary-fill',
                  style: { width: `${row.percent}%` },
                }),
              ]),
              h('span', { class: 'ms-modern-poll-modal__summary-count' }, `${row.percent}%`),
            ]),
          ),
        ),
      ]);
    }),
  );
};

const renderEmbeddedContent = (): VNodeChild => {
  const titleContent = props.title === false || props.title == null ? 'Polls' : props.title;

  return h('div', { class: 'ms-modern-poll-modal__embedded' }, [
    h('div', { class: 'ms-modern-poll-modal__embedded-header' }, [
      h('h2', { class: 'ms-modern-poll-modal__embedded-title' }, [
        h(FontAwesomeIcon, {
          icon: faChartBar,
          class: 'ms-modern-poll-modal__embedded-title-icon',
        }),
        titleContent,
      ]),
      h(
        'button',
        {
          type: 'button',
          class: 'ms-modern-poll-modal__embedded-close',
          onClick: props.onClose,
          'aria-label': 'Close polls panel',
        },
        [h(FontAwesomeIcon, { icon: faTimes })],
      ),
    ]),
    h(
      'div',
      { class: 'ms-modern-poll-modal__embedded-tabs' },
      availableTabs.value.map((tab) =>
        h(
          'button',
          {
            type: 'button',
            class: joinClassNames(
              'ms-modern-poll-modal__tab',
              activeTab.value === tab && 'is-active',
            ),
            onClick: () => {
              activeTab.value = tab;
            },
          },
          tab === 'active' ? 'Active' : tab === 'create' ? 'Create' : 'History',
        ),
      ),
    ),
    h('div', { class: 'ms-modern-poll-modal__embedded-body' }, [
      activeTab.value === 'active' ? renderActivePane() : null,
      activeTab.value === 'create' ? renderCreatePane() : null,
      activeTab.value === 'history' ? renderHistoryPane() : null,
    ]),
  ]);
};

const renderTabbedBody = (options: { defaultBody: VNodeChild }) => {
  if (isEmbeddedMode.value) {
    return props.renderBody ? props.renderBody(options) : options.defaultBody;
  }

  const defaultBody = h('div', { class: 'ms-modern-poll-modal__modal-body' }, [
    h(
      'div',
      { class: 'ms-modern-poll-modal__embedded-tabs' },
      availableTabs.value.map((tab) =>
        h(
          'button',
          {
            type: 'button',
            class: joinClassNames(
              'ms-modern-poll-modal__tab',
              activeTab.value === tab && 'is-active',
            ),
            onClick: () => {
              activeTab.value = tab;
            },
          },
          tab === 'active' ? 'Active' : tab === 'create' ? 'Create' : 'History',
        ),
      ),
    ),
    h('div', { class: 'ms-modern-poll-modal__embedded-body' }, [
      activeTab.value === 'active' ? renderActivePane() : null,
      activeTab.value === 'create' ? renderCreatePane() : null,
      activeTab.value === 'history' ? renderHistoryPane() : null,
    ]),
  ]);

  return props.renderBody ? props.renderBody({ ...options, defaultBody }) : defaultBody;
};

const mergedProps = computed(() => ({
  ...props,
  backgroundColor: props.backgroundColor ?? 'var(--ms-modern-panel-surface-elevated)',
  title: props.title ?? h('span', { class: 'ms-modern-poll-modal__title-shell' }, [
    h(FontAwesomeIcon, { icon: faChartBar, class: 'ms-modern-poll-modal__title-icon' }),
    h('span', 'Polls'),
  ]),
  overlayProps: isEmbeddedMode.value
    ? mergeAttrObjects(embeddedOverlayProps.value, props.overlayProps)
    : props.overlayProps,
  contentProps: mergeAttrObjects(defaultContentProps.value, props.contentProps),
  headerProps: mergeAttrObjects(defaultHeaderProps, props.headerProps),
  titleProps: mergeAttrObjects(defaultTitleProps, props.titleProps),
  closeButtonProps: mergeAttrObjects(defaultCloseButtonProps, props.closeButtonProps),
  bodyProps: mergeAttrObjects(defaultBodyProps, props.bodyProps),
  sectionsWrapperProps: mergeAttrObjects({
    style: { display: 'grid', gap: isCompactViewport.value ? '12px' : '14px' },
  }, props.sectionsWrapperProps),
  previousPollsWrapperProps: mergeAttrObjects(defaultSectionProps, props.previousPollsWrapperProps),
  previousPollsHeaderProps: mergeAttrObjects(defaultSectionHeaderProps, props.previousPollsHeaderProps),
  createPollWrapperProps: mergeAttrObjects(defaultSectionProps, props.createPollWrapperProps),
  createPollFormProps: mergeAttrObjects(defaultFormProps, props.createPollFormProps),
  activePollWrapperProps: mergeAttrObjects(defaultSectionProps, props.activePollWrapperProps),
  pollQuestionInputProps: mergeAttrObjects(defaultInputProps, props.pollQuestionInputProps),
  pollTypeSelectProps: mergeAttrObjects(defaultSelectProps, props.pollTypeSelectProps),
  pollOptionInputProps: mergeAttrObjects(defaultInputProps, props.pollOptionInputProps),
  voteButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.voteButtonProps),
  endPollButtonProps: mergeAttrObjects(defaultSecondaryButtonProps, props.endPollButtonProps),
  submitPollButtonProps: mergeAttrObjects(defaultPrimaryButtonProps, props.submitPollButtonProps),
  renderBody: renderTabbedBody,
  renderContent: isEmbeddedMode.value
    ? () => {
        const defaultContent = renderEmbeddedContent();
        return props.renderContent ? props.renderContent({ defaultContent }) : defaultContent;
      }
    : props.renderContent,
}));
</script>

<style scoped>
:deep(.ms-modern-poll-modal__title-shell) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

:deep(.ms-modern-poll-modal__title-icon) {
  color: #22c55e;
}

:deep(.ms-modern-poll-modal__embedded) {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-poll-modal__embedded-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.ms-modern-poll-modal__embedded-title) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 1.05rem;
  font-weight: 700;
}

:deep(.ms-modern-poll-modal__embedded-title-icon) {
  color: #22c55e;
}

:deep(.ms-modern-poll-modal__embedded-close) {
  width: 36px;
  height: 36px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 999px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
}

:deep(.ms-modern-poll-modal__embedded-tabs) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background: var(--ms-modern-field-background);
  border: 1px solid var(--ms-modern-panel-border);
}

:deep(.ms-modern-poll-modal__tab) {
  min-height: 38px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--ms-modern-text-secondary);
  font-family: var(--ms-modern-font-family);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

:deep(.ms-modern-poll-modal__tab.is-active) {
  background: var(--ms-modern-panel-surface-elevated);
  color: var(--ms-modern-text-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);
}

:deep(.ms-modern-poll-modal__embedded-body) {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 4px;
}

:deep(.ms-modern-poll-modal__modal-body) {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

:deep(.ms-modern-poll-modal__pane) {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.ms-modern-poll-modal__question) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.45;
}

:deep(.ms-modern-poll-modal__options),
:deep(.ms-modern-poll-modal__custom-options),
:deep(.ms-modern-poll-modal__history-list),
:deep(.ms-modern-poll-modal__history-results) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.ms-modern-poll-modal__option) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 14px;
  background: var(--ms-modern-panel-surface);
  color: var(--ms-modern-text-primary);
  cursor: pointer;
  text-align: left;
}

:deep(.ms-modern-poll-modal__option.is-selected) {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.12);
}

:deep(.ms-modern-poll-modal__option-label) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.ms-modern-poll-modal__option-check) {
  color: #22c55e;
}

:deep(.ms-modern-poll-modal__summary-card),
:deep(.ms-modern-poll-modal__history-card) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--ms-modern-panel-border);
  border-radius: 16px;
  background: var(--ms-modern-panel-surface);
}

:deep(.ms-modern-poll-modal__summary-header),
:deep(.ms-modern-poll-modal__history-card-header) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

:deep(.ms-modern-poll-modal__history-card-title) {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.45;
}

:deep(.ms-modern-poll-modal__history-meta),
:deep(.ms-modern-poll-modal__summary-total),
:deep(.ms-modern-poll-modal__summary-count) {
  color: var(--ms-modern-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

:deep(.ms-modern-poll-modal__status-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  color: var(--ms-modern-text-secondary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

:deep(.ms-modern-poll-modal__status-badge.is-active) {
  background: rgba(34, 197, 94, 0.16);
  color: #4ade80;
}

:deep(.ms-modern-poll-modal__summary-row) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.ms-modern-poll-modal__summary-label) {
  flex: 1;
  min-width: 0;
  color: var(--ms-modern-text-primary);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.ms-modern-poll-modal__summary-track) {
  flex: 2;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.16);
}

:deep(.ms-modern-poll-modal__summary-fill) {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%);
}

:deep(.ms-modern-poll-modal__actions) {
  display: flex;
  gap: 10px;
}

:deep(.ms-modern-poll-modal__primary-button),
:deep(.ms-modern-poll-modal__secondary-button) {
  min-height: 42px;
  border-radius: 999px;
  padding: 0 16px;
  font-family: var(--ms-modern-font-family);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

:deep(.ms-modern-poll-modal__primary-button) {
  flex: 1;
  border: none;
  background: linear-gradient(135deg, var(--ms-modern-brand-primary) 0%, var(--ms-modern-brand-secondary) 55%, var(--ms-modern-accent) 100%);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-poll-modal__primary-button:disabled) {
  cursor: not-allowed;
  opacity: 0.55;
}

:deep(.ms-modern-poll-modal__secondary-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--ms-modern-panel-border);
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
}

:deep(.ms-modern-poll-modal__secondary-button--danger) {
  color: #fca5a5;
}

:deep(.ms-modern-poll-modal__textarea),
:deep(.ms-modern-poll-modal__input),
:deep(.ms-modern-poll-modal__select) {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid var(--ms-modern-field-border);
  border-radius: 14px;
  background: var(--ms-modern-field-background);
  color: var(--ms-modern-text-primary);
  font-family: var(--ms-modern-font-family);
  outline: none;
}

:deep(.ms-modern-poll-modal__textarea) {
  min-height: 96px;
  padding: 12px 14px;
  resize: vertical;
}

:deep(.ms-modern-poll-modal__select-wrapper) {
  position: relative;
}

:deep(.ms-modern-poll-modal__select) {
  appearance: none;
  padding-right: 40px;
  cursor: pointer;
}

:deep(.ms-modern-poll-modal__select-chevron) {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--ms-modern-text-secondary);
}

:deep(.ms-modern-poll-modal__empty-state) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: 20px;
  border: 1px dashed var(--ms-modern-panel-border);
  border-radius: 16px;
  color: var(--ms-modern-text-secondary);
  text-align: center;
}

@media (max-width: 640px) {
  :deep(.ms-modern-poll-modal__actions) {
    gap: 8px;
  }

  :deep(.ms-modern-poll-modal__primary-button),
  :deep(.ms-modern-poll-modal__secondary-button) {
    min-height: 40px;
    padding: 0 14px;
  }

  :deep(.ms-modern-poll-modal__option) {
    padding: 11px 12px;
  }

  :deep(.ms-modern-poll-modal__empty-state) {
    min-height: 150px;
    padding: 16px;
  }
}
</style>