<template>
  <div
    class="ms-audit"
    :class="[`ms-audit--${theme}`, { 'ms-audit--capture': hideChrome }]"
  >
    <aside
      v-if="!hideChrome"
      class="ms-audit__controls"
    >
      <div class="ms-audit__controls-block">
        <p class="ms-audit__eyebrow">
          Vue Modern UI Audit
        </p>
        <h1 class="ms-audit__title">
          Deterministic parity harness
        </h1>
        <p class="ms-audit__copy">
          Use this page to render one modern element at a time with stable query-driven scenarios.
        </p>
      </div>

      <label class="ms-audit__field-group">
        <span>Component</span>
        <select v-model="componentId">
          <option
            v-for="option in componentOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="ms-audit__field-group">
        <span>Scenario</span>
        <select v-model="scenarioId">
          <option
            v-for="option in scenarioOptions"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="ms-audit__field-group">
        <span>Theme</span>
        <select v-model="theme">
          <option value="dark">
            Dark
          </option>
          <option value="light">
            Light
          </option>
        </select>
      </label>

      <label class="ms-audit__field-group">
        <span>Viewport</span>
        <select v-model="viewport">
          <option value="desktop">
            Desktop 1440x900
          </option>
          <option value="mobile">
            Mobile 390x844
          </option>
        </select>
      </label>

      <label class="ms-audit__toggle">
        <input
          v-model="hideChrome"
          type="checkbox"
        >
        <span>Hide controls for capture</span>
      </label>

      <div class="ms-audit__query">
        <span>Query</span>
        <code>{{ queryPreview }}</code>
      </div>
    </aside>

    <main class="ms-audit__stage">
      <div
        id="audit-preview"
        ref="previewRoot"
        class="ms-audit__viewport"
        :class="[`ms-audit__viewport--${viewport}`]"
        :style="themeVariables"
      >
        <div
          v-if="componentId === 'button'"
          :key="`${renderKey}-button`"
          class="ms-audit-example-card"
        >
          <p class="ms-audit-example-card__kicker">
            ModernButton / {{ activeScenarioLabel }}
          </p>
          <h2 class="ms-audit-example-card__title">
            Button primitive snapshot
          </h2>
          <p class="ms-audit-example-card__copy">
            Baseline call-to-action treatment for modern flows.
          </p>
          <ModernButton
            :variant="buttonVariant"
            :disabled="scenarioId === 'disabled'"
            size="lg"
          >
            {{ scenarioId === 'ghost' ? 'View details' : 'Join room' }}
          </ModernButton>
        </div>

        <div
          v-else-if="componentId === 'field'"
          :key="`${renderKey}-field`"
          class="ms-audit-example-card ms-audit-example-card--field"
        >
          <p class="ms-audit-example-card__kicker">
            ModernField / {{ activeScenarioLabel }}
          </p>
          <h2 class="ms-audit-example-card__title">
            Input primitive snapshot
          </h2>
          <ModernField
            label="Display Name"
            :hint="fieldHint"
            :error="fieldError"
            :invalid="scenarioId === 'error'"
            placeholder="Enter your display name"
            :value="fieldValue"
            :disabled="scenarioId === 'disabled'"
          />
        </div>

        <div
          v-else-if="componentId === 'surface'"
          :key="`${renderKey}-surface`"
          class="ms-audit-surface-wrap"
        >
          <ModernSurface
            class="ms-audit-surface"
            :tone="surfaceTone"
            :interactive="scenarioId === 'interactive'"
          >
            <p class="ms-audit-surface__eyebrow">
              ModernSurface / {{ activeScenarioLabel }}
            </p>
            <h2 class="ms-audit-surface__title">
              Shared shell surface
            </h2>
            <p class="ms-audit-surface__copy">
              Used for panels, onboarding cards, and embedded modal shells.
            </p>
          </ModernSurface>
        </div>

        <div
          v-else-if="componentId === 'alert'"
          :key="`${renderKey}-alert`"
          class="ms-audit-overlay-stage"
        >
          <ModernAlertComponent
            :visible="true"
            :type="alertType"
            :duration="0"
            :message="alertType === 'danger' ? 'Unable to save request settings.' : 'Request approved successfully.'"
            :on-hide="noOp"
            :overlay-props="alertOverlayProps"
          />
        </div>

        <div
          v-else-if="componentId === 'loading'"
          :key="`${renderKey}-loading`"
          class="ms-audit-overlay-stage"
        >
          <ModernLoadingModal
            :is-visible="true"
            :loading-text="loadingText"
            :show-spinner="scenarioId !== 'text-only'"
          />
        </div>

        <div
          v-else-if="componentId === 'timer'"
          :key="`${renderKey}-timer`"
          :style="timerStageStyle"
        >
          <ModernMeetingProgressTimer v-bind="timerProps" />
        </div>

        <div
          v-else-if="componentId === 'pagination'"
          :key="`${renderKey}-pagination`"
          :style="paginationStageStyle"
        >
          <ModernPagination v-bind="paginationProps" />
        </div>

        <div
          v-else-if="componentId === 'control-buttons'"
          :key="`${renderKey}-control-buttons`"
          :style="controlButtonsStageStyle"
        >
          <ModernControlButtonsComponent v-bind="controlButtonsProps" />
        </div>

        <div
          v-else-if="componentId === 'touch-controls'"
          :key="`${renderKey}-touch-controls`"
          :style="touchControlsStageStyle"
        >
          <ModernControlButtonsComponentTouch v-bind="touchControlsProps" />
        </div>

        <div
          v-else-if="componentId === 'main-container'"
          :key="`${renderKey}-main-container`"
        >
          <ModernMainContainer v-bind="mainContainerProps">
            <div :style="mainContainerContentStyle">
              <AuditGridTile
                v-for="(tile, index) in mainContainerTiles"
                :key="`main-container-${scenarioId}-${index}`"
                :label="tile.label"
                :detail="tile.detail"
                :tone="tile.tone"
                :is-dark-mode="theme === 'dark'"
              />
            </div>
          </ModernMainContainer>
        </div>

        <div
          v-else-if="componentId === 'main-aspect'"
          :key="`${renderKey}-main-aspect`"
        >
          <ModernMainAspect v-bind="mainAspectProps">
            <div :style="mainAspectContentStyle">
              <AuditGridTile
                v-for="(tile, index) in mainAspectTiles"
                :key="`main-aspect-${scenarioId}-${index}`"
                :label="tile.label"
                :detail="tile.detail"
                :tone="tile.tone"
                :is-dark-mode="theme === 'dark'"
              />
            </div>
          </ModernMainAspect>
        </div>

        <div
          v-else-if="componentId === 'main-grid'"
          :key="`${renderKey}-main-grid`"
          :style="mainGridStageStyle"
        >
          <ModernMainGrid v-bind="mainGridProps">
            <div :style="mainGridContentStyle">
              <AuditGridTile
                v-for="(tile, index) in mainGridTiles"
                :key="`main-grid-${scenarioId}-${index}`"
                :label="tile.label"
                :detail="tile.detail"
                :tone="tile.tone"
                :is-dark-mode="theme === 'dark'"
              />
            </div>
          </ModernMainGrid>
        </div>

        <div
          v-else-if="componentId === 'other-grid'"
          :key="`${renderKey}-other-grid`"
          :style="otherGridStageStyle"
        >
          <ModernOtherGrid v-bind="otherGridProps">
            <div :style="otherGridContentStyle">
              <AuditGridTile
                v-for="(tile, index) in otherGridTiles"
                :key="`other-grid-${scenarioId}-${index}`"
                :label="tile.label"
                :detail="tile.detail"
                :tone="tile.tone"
                :is-dark-mode="theme === 'dark'"
              />
            </div>
          </ModernOtherGrid>
        </div>

        <div
          v-else-if="componentId === 'sub-aspect'"
          :key="`${renderKey}-sub-aspect`"
          :style="subAspectStageStyle"
        >
          <ModernSubAspect v-bind="subAspectProps">
            <div :style="subAspectContentStyle">
              <AuditGridTile
                v-for="(tile, index) in subAspectTiles"
                :key="`sub-aspect-${scenarioId}-${index}`"
                :label="tile.label"
                :detail="tile.detail"
                :tone="tile.tone"
                :is-dark-mode="theme === 'dark'"
              />
            </div>
          </ModernSubAspect>
        </div>

        <div
          v-else-if="componentId === 'flexible-grid'"
          :key="`${renderKey}-flexible-grid`"
          :style="flexibleGridStageStyle"
        >
          <ModernFlexibleGrid v-bind="flexibleGridProps" />
        </div>

        <div
          v-else-if="componentId === 'flexible-video'"
          :key="`${renderKey}-flexible-video`"
          :style="flexibleVideoStageStyle"
        >
          <ModernFlexibleVideo v-bind="flexibleVideoProps">
            <template
              v-if="scenarioId === 'screenboard'"
              #Screenboard
            >
              <div
                :style="{
                  width: '100%',
                  height: '100%',
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(59, 130, 246, 0.1))'
                    : 'linear-gradient(135deg, rgba(191, 219, 254, 0.82), rgba(224, 242, 254, 0.74))',
                  border: theme === 'dark'
                    ? '1px solid rgba(125, 211, 252, 0.34)'
                    : '1px solid rgba(59, 130, 246, 0.24)',
                  boxShadow: theme === 'dark'
                    ? '0 18px 36px rgba(2, 8, 23, 0.24)'
                    : '0 18px 36px rgba(148, 163, 184, 0.18)',
                }"
              >
                <span
                  :style="{
                    fontSize: '0.68rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: theme === 'dark' ? '#bae6fd' : '#1d4ed8',
                    fontWeight: 700,
                  }"
                >
                  Screenboard
                </span>

                <div
                  :style="{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginTop: '4px',
                  }"
                >
                  <strong
                    :style="{
                      fontSize: '1.02rem',
                      lineHeight: 1.2,
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      fontWeight: 700,
                    }"
                  >
                    Shared Screen Overlay
                  </strong>
                  <span
                    :style="{
                      fontSize: '0.78rem',
                      lineHeight: 1.35,
                      color: theme === 'dark' ? 'rgba(224, 242, 254, 0.78)' : 'rgba(15, 23, 42, 0.68)',
                    }"
                  >
                    Annotation-ready layer for guides, pointers, and highlights.
                  </span>
                </div>

                <div
                  :style="{
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }"
                >
                  <span
                    :style="{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: theme === 'dark' ? '#e0f2fe' : '#1e3a8a',
                      opacity: 0.76,
                    }"
                  >
                    Annotation mode
                  </span>
                </div>
              </div>
            </template>
          </ModernFlexibleVideo>
        </div>

        <div
          v-else-if="componentId === 'video-card'"
          :key="`${renderKey}-video-card`"
          :style="cardStageStyle"
        >
          <ModernVideoCard v-bind="videoCardProps" />
        </div>

        <div
          v-else-if="componentId === 'audio-card'"
          :key="`${renderKey}-audio-card`"
          :style="cardStageStyle"
        >
          <ModernAudioCard v-bind="audioCardProps" />
        </div>

        <div
          v-else-if="componentId === 'breakout-rooms'"
          :key="`${renderKey}-breakout-rooms`"
          class="ms-audit-modal-shell"
        >
          <ModernBreakoutRoomsModal v-bind="breakoutRoomsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'configure-whiteboard'"
          :key="`${renderKey}-configure-whiteboard`"
          class="ms-audit-modal-shell"
        >
          <ModernConfigureWhiteboardModal v-bind="configureWhiteboardModalProps" />
        </div>

        <div
          v-else-if="componentId === 'messages'"
          :key="`${renderKey}-messages`"
          class="ms-audit-modal-shell"
        >
          <ModernMessagesModal
            :is-messages-modal-visible="true"
            :on-messages-close="noOp"
            :messages="messagesFixture"
            event-type="conference"
            member="Host"
            islevel="2"
            :co-host-responsibility="[]"
            co-host="Maya"
            :start-direct-message="scenarioId === 'direct'"
            :direct-message-details="directMessageDetails"
            :update-start-direct-message="noOp"
            :update-direct-message-details="noOp"
            room-name="audit-room"
            :socket="auditSocket"
            chat-setting="allow"
            :render-mode="messagesRenderMode"
          />
        </div>

        <div
          v-else-if="componentId === 'participants'"
          :key="`${renderKey}-participants`"
          class="ms-audit-modal-shell"
        >
          <ModernParticipantsModal
            :is-participants-modal-visible="true"
            :on-participants-close="noOp"
            :on-participants-filter-change="noOp"
            :participants-counter="participantsFixture.length"
            :parameters="participantsModalParameters"
            :render-mode="participantsRenderMode"
          />
        </div>

        <div
          v-else-if="componentId === 'permissions'"
          :key="`${renderKey}-permissions`"
          class="ms-audit-modal-shell"
        >
          <ModernPermissionsModal v-bind="permissionsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'panelists'"
          :key="`${renderKey}-panelists`"
          class="ms-audit-modal-shell"
        >
          <ModernPanelistsModal v-bind="panelistsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'poll'"
          :key="`${renderKey}-poll`"
          class="ms-audit-modal-shell"
        >
          <ModernPollModal v-bind="pollModalProps" />
        </div>

        <div
          v-else-if="componentId === 'recording'"
          :key="`${renderKey}-recording`"
          class="ms-audit-modal-shell"
        >
          <ModernRecordingModal v-bind="recordingModalProps" />
        </div>

        <div
          v-else-if="componentId === 'whiteboard'"
          :key="`${renderKey}-whiteboard`"
          :style="whiteboardStageStyle"
        >
          <ModernWhiteboard v-bind="whiteboardProps" />
        </div>

        <div
          v-else-if="componentId === 'translation'"
          :key="`${renderKey}-translation`"
          class="ms-audit-modal-shell"
        >
          <ModernTranslationSettingsModal v-bind="translationModalProps" />
        </div>

        <div
          v-else-if="componentId === 'event-settings'"
          :key="`${renderKey}-event-settings`"
          class="ms-audit-modal-shell"
        >
          <ModernEventSettingsModal v-bind="eventSettingsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'media-settings'"
          :key="`${renderKey}-media-settings`"
          class="ms-audit-modal-shell"
        >
          <ModernMediaSettingsModal v-bind="mediaSettingsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'menu'"
          :key="`${renderKey}-menu`"
          class="ms-audit-modal-shell"
        >
          <ModernMenuModal v-bind="menuModalProps" />
        </div>

        <div
          v-else-if="componentId === 'display-settings'"
          :key="`${renderKey}-display-settings`"
          class="ms-audit-modal-shell"
        >
          <ModernDisplaySettingsModal v-bind="displaySettingsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'requests'"
          :key="`${renderKey}-requests`"
          class="ms-audit-modal-shell"
        >
          <ModernRequestsModal v-bind="requestsModalProps" />
        </div>

        <div
          v-else-if="componentId === 'waiting'"
          :key="`${renderKey}-waiting`"
          class="ms-audit-modal-shell"
        >
          <ModernWaitingModal v-bind="waitingModalProps" />
        </div>

        <div
          v-else-if="componentId === 'share-event'"
          :key="`${renderKey}-share-event`"
          class="ms-audit-modal-shell"
        >
          <ModernShareEventModal v-bind="shareEventModalProps" />
        </div>

        <div
          v-else-if="componentId === 'confirm-exit'"
          :key="`${renderKey}-confirm-exit`"
          class="ms-audit-modal-shell"
        >
          <ModernConfirmExitModal v-bind="confirmExitModalProps" />
        </div>

        <div
          v-else-if="componentId === 'confirm-here'"
          :key="`${renderKey}-confirm-here`"
          class="ms-audit-modal-shell"
        >
          <ModernConfirmHereModal v-bind="confirmHereModalProps" />
        </div>

        <ModernPreJoinPage
          v-else-if="componentId === 'prejoin'"
          :key="`${renderKey}-prejoin`"
          v-bind="preJoinProps"
        />

        <ModernWelcomePage
          v-else-if="componentId === 'welcome'"
          :key="`${renderKey}-welcome`"
          :entry-shell-layout="scenarioId === 'split' ? 'split' : 'inline'"
          :parameters="welcomeParameters"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, markRaw, nextTick, onMounted, ref, watch } from 'vue';
import {
  faComments,
  faCog,
  faMicrophone,
  faMicrophoneSlash,
  faUsers,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import type {
  Credentials,
  Message,
  Participant,
  PreJoinPageParameters,
  Request,
  WaitingRoomParticipant,
  WelcomePageParameters,
} from '../SharedTypes';
import ModernAlertComponent from '../modern/display_components/ModernAlertComponent.vue';
import ModernAudioCard from '../modern/display_components/ModernAudioCard.vue';
import ModernControlButtonsComponent from '../modern/display_components/ModernControlButtonsComponent.vue';
import ModernControlButtonsComponentTouch from '../modern/display_components/ModernControlButtonsComponentTouch.vue';
import ModernFlexibleGrid from '../modern/display_components/ModernFlexibleGrid.vue';
import ModernFlexibleVideo from '../modern/display_components/ModernFlexibleVideo.vue';
import ModernLoadingModal from '../modern/display_components/ModernLoadingModal.vue';
import ModernMainContainer from '../modern/display_components/ModernMainContainer.vue';
import ModernMainAspect from '../modern/display_components/ModernMainAspect.vue';
import ModernMainGrid from '../modern/display_components/ModernMainGrid.vue';
import ModernMeetingProgressTimer from '../modern/display_components/ModernMeetingProgressTimer.vue';
import ModernOtherGrid from '../modern/display_components/ModernOtherGrid.vue';
import ModernPagination from '../modern/display_components/ModernPagination.vue';
import ModernSubAspect from '../modern/display_components/ModernSubAspect.vue';
import ModernVideoCard from '../modern/display_components/ModernVideoCard.vue';
import ModernConfirmExitModal from '../modern/modal_components/ModernConfirmExitModal.vue';
import ModernConfirmHereModal from '../modern/modal_components/ModernConfirmHereModal.vue';
import ModernBreakoutRoomsModal from '../modern/modal_components/ModernBreakoutRoomsModal.vue';
import ModernConfigureWhiteboardModal from '../modern/modal_components/ModernConfigureWhiteboardModal.vue';
import ModernDisplaySettingsModal from '../modern/modal_components/ModernDisplaySettingsModal.vue';
import ModernEventSettingsModal from '../modern/modal_components/ModernEventSettingsModal.vue';
import ModernMediaSettingsModal from '../modern/modal_components/ModernMediaSettingsModal.vue';
import ModernMenuModal from '../modern/modal_components/ModernMenuModal.vue';
import ModernMessagesModal from '../modern/modal_components/ModernMessagesModal.vue';
import ModernPanelistsModal from '../modern/modal_components/ModernPanelistsModal.vue';
import ModernParticipantsModal from '../modern/modal_components/ModernParticipantsModal.vue';
import ModernPermissionsModal from '../modern/modal_components/ModernPermissionsModal.vue';
import ModernPollModal from '../modern/modal_components/ModernPollModal.vue';
import ModernRecordingModal from '../modern/modal_components/ModernRecordingModal.vue';
import ModernRequestsModal from '../modern/modal_components/ModernRequestsModal.vue';
import ModernShareEventModal from '../modern/modal_components/ModernShareEventModal.vue';
import ModernTranslationSettingsModal from '../modern/modal_components/ModernTranslationSettingsModal.vue';
import ModernWaitingModal from '../modern/modal_components/ModernWaitingModal.vue';
import { ModernButton, ModernField, ModernSurface } from '../modern/primitives';
import ModernPreJoinPage from '../modern/misc_components/ModernPreJoinPage.vue';
import ModernWelcomePage from '../modern/misc_components/ModernWelcomePage.vue';
import ModernWhiteboard from '../modern/whiteboard_components/ModernWhiteboard.vue';
import type { RenderableComponent } from '../types/renderable-component';

type ComponentId =
  | 'button'
  | 'field'
  | 'surface'
  | 'alert'
  | 'loading'
  | 'timer'
  | 'pagination'
  | 'control-buttons'
  | 'touch-controls'
  | 'main-container'
  | 'main-aspect'
  | 'main-grid'
  | 'other-grid'
  | 'sub-aspect'
  | 'flexible-grid'
  | 'flexible-video'
  | 'video-card'
  | 'audio-card'
  | 'breakout-rooms'
  | 'configure-whiteboard'
  | 'messages'
  | 'participants'
  | 'permissions'
  | 'panelists'
  | 'poll'
  | 'recording'
  | 'whiteboard'
  | 'translation'
  | 'event-settings'
  | 'media-settings'
  | 'menu'
  | 'display-settings'
  | 'requests'
  | 'waiting'
  | 'share-event'
  | 'confirm-exit'
  | 'confirm-here'
  | 'prejoin'
  | 'welcome';
type ThemeId = 'dark' | 'light';
type ViewportId = 'desktop' | 'mobile';
type GridTone = 'primary' | 'accent' | 'emerald' | 'amber' | 'indigo' | 'slate';

type ScenarioOption = { id: string; label: string };
type AuditParameterBag = Record<string, unknown> & { getUpdatedAllParams?: () => AuditParameterBag };

const resolveGridTilePalette = (tone: GridTone, isDarkMode: boolean) => {
  const palettes: Record<GridTone, { background: string; border: string; kicker: string; label: string; detail: string }> = {
    primary: isDarkMode
      ? {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.32), rgba(14, 165, 233, 0.18))',
          border: 'rgba(96, 165, 250, 0.42)',
          kicker: '#93c5fd',
          label: '#eff6ff',
          detail: 'rgba(219, 234, 254, 0.78)',
        }
      : {
          background: 'linear-gradient(135deg, rgba(191, 219, 254, 0.96), rgba(224, 242, 254, 0.92))',
          border: 'rgba(96, 165, 250, 0.32)',
          kicker: '#1d4ed8',
          label: '#0f172a',
          detail: 'rgba(30, 41, 59, 0.72)',
        },
    accent: isDarkMode
      ? {
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.28), rgba(34, 197, 94, 0.16))',
          border: 'rgba(45, 212, 191, 0.34)',
          kicker: '#67e8f9',
          label: '#ecfeff',
          detail: 'rgba(204, 251, 241, 0.76)',
        }
      : {
          background: 'linear-gradient(135deg, rgba(207, 250, 254, 0.94), rgba(220, 252, 231, 0.9))',
          border: 'rgba(20, 184, 166, 0.26)',
          kicker: '#0f766e',
          label: '#0f172a',
          detail: 'rgba(15, 23, 42, 0.7)',
        },
    emerald: isDarkMode
      ? {
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.26), rgba(74, 222, 128, 0.14))',
          border: 'rgba(74, 222, 128, 0.34)',
          kicker: '#86efac',
          label: '#f0fdf4',
          detail: 'rgba(220, 252, 231, 0.76)',
        }
      : {
          background: 'linear-gradient(135deg, rgba(220, 252, 231, 0.94), rgba(240, 253, 244, 0.9))',
          border: 'rgba(34, 197, 94, 0.24)',
          kicker: '#166534',
          label: '#0f172a',
          detail: 'rgba(15, 23, 42, 0.68)',
        },
    amber: isDarkMode
      ? {
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(251, 191, 36, 0.14))',
          border: 'rgba(251, 191, 36, 0.34)',
          kicker: '#fcd34d',
          label: '#fffbeb',
          detail: 'rgba(254, 243, 199, 0.76)',
        }
      : {
          background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.96), rgba(255, 251, 235, 0.92))',
          border: 'rgba(245, 158, 11, 0.24)',
          kicker: '#92400e',
          label: '#0f172a',
          detail: 'rgba(15, 23, 42, 0.68)',
        },
    indigo: isDarkMode
      ? {
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(129, 140, 248, 0.16))',
          border: 'rgba(129, 140, 248, 0.34)',
          kicker: '#c7d2fe',
          label: '#eef2ff',
          detail: 'rgba(224, 231, 255, 0.76)',
        }
      : {
          background: 'linear-gradient(135deg, rgba(224, 231, 255, 0.96), rgba(238, 242, 255, 0.92))',
          border: 'rgba(99, 102, 241, 0.24)',
          kicker: '#3730a3',
          label: '#0f172a',
          detail: 'rgba(15, 23, 42, 0.68)',
        },
    slate: isDarkMode
      ? {
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.42), rgba(30, 41, 59, 0.3))',
          border: 'rgba(148, 163, 184, 0.2)',
          kicker: '#cbd5e1',
          label: '#f8fafc',
          detail: 'rgba(226, 232, 240, 0.76)',
        }
      : {
          background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.96), rgba(226, 232, 240, 0.92))',
          border: 'rgba(148, 163, 184, 0.24)',
          kicker: '#475569',
          label: '#0f172a',
          detail: 'rgba(30, 41, 59, 0.68)',
        },
  };

  return palettes[tone];
};

const AuditGridTile = markRaw(defineComponent({
  name: 'AuditGridTile',
  props: {
    label: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    tone: {
      type: String as () => GridTone,
      required: true,
    },
    isDarkMode: {
      type: Boolean,
      default: true,
    },
  },
  setup(tileProps) {
    return () => {
      const palette = resolveGridTilePalette(tileProps.tone, tileProps.isDarkMode);

      return h('div', {
        style: {
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: palette.background,
          border: `1px solid ${palette.border}`,
          boxShadow: tileProps.isDarkMode
            ? '0 18px 36px rgba(2, 8, 23, 0.22)'
            : '0 18px 36px rgba(148, 163, 184, 0.2)',
        },
      }, [
        h('span', {
          style: {
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: palette.kicker,
            fontWeight: 700,
          },
        }, 'Audit Tile'),
        h('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          },
        }, [
          h('strong', {
            style: {
              fontSize: '1rem',
              lineHeight: 1.2,
              color: palette.label,
              fontWeight: 700,
            },
          }, tileProps.label),
          h('span', {
            style: {
              fontSize: '0.78rem',
              lineHeight: 1.35,
              color: palette.detail,
            },
          }, tileProps.detail),
        ]),
      ]);
    };
  },
}));

const auditGridTiles: Array<{ label: string; detail: string; tone: GridTone }> = [
  { label: 'Host Feed', detail: 'Spotlight-ready primary tile', tone: 'primary' },
  { label: 'Panel A', detail: 'Secondary participant feed', tone: 'accent' },
  { label: 'Panel B', detail: 'Support speaker tile', tone: 'emerald' },
  { label: 'Screen', detail: 'Shared content placeholder', tone: 'amber' },
  { label: 'Guest 1', detail: 'Audience promotion slot', tone: 'indigo' },
  { label: 'Guest 2', detail: 'Reserve participant slot', tone: 'slate' },
];

const componentRegistry: Record<ComponentId, { label: string; scenarios: ScenarioOption[] }> = {
  button: {
    label: 'ModernButton',
    scenarios: [
      { id: 'primary', label: 'Primary' },
      { id: 'secondary', label: 'Secondary' },
      { id: 'ghost', label: 'Ghost' },
      { id: 'disabled', label: 'Disabled' },
    ],
  },
  field: {
    label: 'ModernField',
    scenarios: [
      { id: 'empty', label: 'Empty' },
      { id: 'filled', label: 'Filled' },
      { id: 'focused', label: 'Focused' },
      { id: 'error', label: 'Error' },
      { id: 'disabled', label: 'Disabled' },
    ],
  },
  surface: {
    label: 'ModernSurface',
    scenarios: [
      { id: 'base', label: 'Base' },
      { id: 'elevated', label: 'Elevated' },
      { id: 'interactive', label: 'Interactive' },
    ],
  },
  alert: {
    label: 'ModernAlertComponent',
    scenarios: [
      { id: 'success', label: 'Success' },
      { id: 'danger', label: 'Danger' },
    ],
  },
  loading: {
    label: 'ModernLoadingModal',
    scenarios: [
      { id: 'spinner', label: 'Spinner' },
      { id: 'text-only', label: 'Text Only' },
    ],
  },
  timer: {
    label: 'ModernMeetingProgressTimer',
    scenarios: [
      { id: 'default', label: 'Default' },
      { id: 'long', label: 'Long Elapsed' },
      { id: 'compact', label: 'Compact Width' },
    ],
  },
  pagination: {
    label: 'ModernPagination',
    scenarios: [
      { id: 'single', label: 'Single Page' },
      { id: 'multiple', label: 'Multiple Pages' },
      { id: 'narrow', label: 'Narrow Width' },
    ],
  },
  'control-buttons': {
    label: 'ModernControlButtonsComponent',
    scenarios: [
      { id: 'default', label: 'Default' },
      { id: 'compact', label: 'Compact Width' },
      { id: 'disabled', label: 'Disabled Action' },
    ],
  },
  'touch-controls': {
    label: 'ModernControlButtonsComponentTouch',
    scenarios: [
      { id: 'vertical-right', label: 'Vertical Right' },
      { id: 'vertical-left', label: 'Vertical Left' },
      { id: 'horizontal', label: 'Horizontal Bottom' },
    ],
  },
  'main-container': {
    label: 'ModernMainContainer',
    scenarios: [
      { id: 'normal', label: 'Normal Room' },
      { id: 'sidebar', label: 'Sidebar Open' },
      { id: 'mobile', label: 'Mobile Stack' },
    ],
  },
  'main-aspect': {
    label: 'ModernMainAspect',
    scenarios: [
      { id: 'non-shared', label: 'Non-shared' },
      { id: 'shared-screen', label: 'Shared Screen' },
      { id: 'sidebar', label: 'Sidebar Open' },
    ],
  },
  'main-grid': {
    label: 'ModernMainGrid',
    scenarios: [
      { id: 'host', label: 'Grid With Host' },
      { id: 'shared-screen', label: 'Grid With Shared Screen' },
      { id: 'theme-switch', label: 'Theme Switch' },
    ],
  },
  'other-grid': {
    label: 'ModernOtherGrid',
    scenarios: [
      { id: 'multi-user', label: 'Multi-user' },
      { id: 'pagination', label: 'Pagination' },
      { id: 'sidebar', label: 'Sidebar Open' },
    ],
  },
  'sub-aspect': {
    label: 'ModernSubAspect',
    scenarios: [
      { id: 'compact', label: 'Compact' },
      { id: 'shared-screen', label: 'Shared Screen' },
      { id: 'alternate', label: 'Alternate Card Arrangement' },
    ],
  },
  'flexible-grid': {
    label: 'ModernFlexibleGrid',
    scenarios: [
      { id: 'sparse', label: 'Sparse Layout' },
      { id: 'filled', label: 'Filled Layout' },
      { id: 'compact', label: 'Compact Layout' },
    ],
  },
  'flexible-video': {
    label: 'ModernFlexibleVideo',
    scenarios: [
      { id: 'filled', label: 'Filled Cells' },
      { id: 'empty', label: 'Empty Cells' },
      { id: 'screenboard', label: 'Screenboard Overlay' },
    ],
  },
  'video-card': {
    label: 'ModernVideoCard',
    scenarios: [
      { id: 'live', label: 'Live Speaker' },
      { id: 'muted', label: 'Muted Tile' },
      { id: 'subtitle', label: 'Subtitle Overlay' },
    ],
  },
  'audio-card': {
    label: 'ModernAudioCard',
    scenarios: [
      { id: 'speaking', label: 'Speaking Avatar' },
      { id: 'muted', label: 'Muted Avatar' },
      { id: 'subtitle', label: 'Subtitle Overlay' },
    ],
  },
  'breakout-rooms': {
    label: 'ModernBreakoutRoomsModal',
    scenarios: [
      { id: 'default', label: 'Default' },
    ],
  },
  'configure-whiteboard': {
    label: 'ModernConfigureWhiteboardModal',
    scenarios: [
      { id: 'default', label: 'Default' },
    ],
  },
  messages: {
    label: 'ModernMessagesModal',
    scenarios: [
      { id: 'group', label: 'Group Inline' },
      { id: 'direct', label: 'Direct Inline' },
      { id: 'empty', label: 'Empty Inline' },
      { id: 'sidebar', label: 'Sidebar' },
    ],
  },
  participants: {
    label: 'ModernParticipantsModal',
    scenarios: [
      { id: 'populated', label: 'Populated Inline' },
      { id: 'empty', label: 'Empty Inline' },
      { id: 'sidebar', label: 'Sidebar' },
    ],
  },
  permissions: {
    label: 'ModernPermissionsModal',
    scenarios: [
      { id: 'config', label: 'Capability Rules' },
      { id: 'users', label: 'Participant Levels' },
    ],
  },
  panelists: {
    label: 'ModernPanelistsModal',
    scenarios: [
      { id: 'focused', label: 'Focused List' },
      { id: 'available', label: 'Available List' },
    ],
  },
  poll: {
    label: 'ModernPollModal',
    scenarios: [
      { id: 'active', label: 'Active Poll' },
    ],
  },
  recording: {
    label: 'ModernRecordingModal',
    scenarios: [
      { id: 'standard', label: 'Standard Panel' },
    ],
  },
  whiteboard: {
    label: 'Whiteboard',
    scenarios: [
      { id: 'default', label: 'Default' },
    ],
  },
  translation: {
    label: 'ModernTranslationSettingsModal',
    scenarios: [
      { id: 'supported', label: 'Supported' },
      { id: 'unsupported', label: 'Unsupported' },
      { id: 'personal', label: 'Personal Translation' },
      { id: 'pending', label: 'Pending Personal Translation' },
      { id: 'clone', label: 'Clone Enabled' },
      { id: 'sidebar', label: 'Sidebar' },
    ],
  },
  'event-settings': {
    label: 'ModernEventSettingsModal',
    scenarios: [
      { id: 'modal', label: 'Modal' },
    ],
  },
  'media-settings': {
    label: 'ModernMediaSettingsModal',
    scenarios: [
      { id: 'devices', label: 'Devices' },
    ],
  },
  menu: {
    label: 'ModernMenuModal',
    scenarios: [
      { id: 'modal', label: 'Modal' },
      { id: 'sidebar', label: 'Sidebar' },
      { id: 'inline', label: 'Inline' },
    ],
  },
  'display-settings': {
    label: 'ModernDisplaySettingsModal',
    scenarios: [
      { id: 'modal', label: 'Modal' },
      { id: 'sidebar', label: 'Sidebar' },
      { id: 'inline', label: 'Inline' },
    ],
  },
  requests: {
    label: 'ModernRequestsModal',
    scenarios: [
      { id: 'populated', label: 'Populated Modal' },
      { id: 'empty', label: 'Empty Modal' },
      { id: 'sidebar', label: 'Sidebar' },
    ],
  },
  waiting: {
    label: 'ModernWaitingModal',
    scenarios: [
      { id: 'populated', label: 'Populated Modal' },
      { id: 'empty', label: 'Empty Modal' },
      { id: 'sidebar', label: 'Sidebar' },
    ],
  },
  'share-event': {
    label: 'ModernShareEventModal',
    scenarios: [
      { id: 'modal', label: 'Modal' },
      { id: 'sidebar', label: 'Sidebar' },
      { id: 'inline', label: 'Inline' },
    ],
  },
  'confirm-exit': {
    label: 'ModernConfirmExitModal',
    scenarios: [
      { id: 'host', label: 'Host Exit' },
      { id: 'guest', label: 'Guest Exit' },
    ],
  },
  'confirm-here': {
    label: 'ModernConfirmHereModal',
    scenarios: [
      { id: 'default', label: 'Default' },
    ],
  },
  prejoin: {
    label: 'ModernPreJoinPage',
    scenarios: [
      { id: 'join', label: 'Join' },
      { id: 'create', label: 'Create' },
    ],
  },
  welcome: {
    label: 'ModernWelcomePage',
    scenarios: [
      { id: 'default', label: 'Default' },
      { id: 'split', label: 'Split Layout' },
    ],
  },
};

const searchParams = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search)
  : new URLSearchParams();

const resolveComponentId = (value: string | null): ComponentId => {
  if (value && value in componentRegistry) {
    return value as ComponentId;
  }

  return 'button';
};

const componentId = ref<ComponentId>(resolveComponentId(searchParams.get('component')));
const theme = ref<ThemeId>(searchParams.get('theme') === 'light' ? 'light' : 'dark');
const viewport = ref<ViewportId>(searchParams.get('viewport') === 'mobile' ? 'mobile' : 'desktop');
const hideChrome = ref(searchParams.get('chrome') === '0');

const resolveScenarioId = (component: ComponentId, value: string | null) => {
  const scenario = componentRegistry[component].scenarios.find((option) => option.id === value);
  return scenario?.id ?? componentRegistry[component].scenarios[0].id;
};

const scenarioId = ref(resolveScenarioId(componentId.value, searchParams.get('scenario')));

watch(componentId, (nextComponent) => {
  scenarioId.value = resolveScenarioId(nextComponent, scenarioId.value);
});

const componentOptions = computed(() => Object.entries(componentRegistry).map(([id, value]) => ({
  id: id as ComponentId,
  label: value.label,
})));

const scenarioOptions = computed(() => componentRegistry[componentId.value].scenarios);
const activeScenarioLabel = computed(() => scenarioOptions.value.find((option) => option.id === scenarioId.value)?.label ?? scenarioId.value);
const renderKey = computed(() => `${componentId.value}-${scenarioId.value}-${theme.value}-${viewport.value}`);

const queryPreview = computed(() => {
  const params = new URLSearchParams();
  params.set('audit', '1');
  params.set('component', componentId.value);
  params.set('scenario', scenarioId.value);
  params.set('theme', theme.value);
  params.set('viewport', viewport.value);
  if (hideChrome.value) {
    params.set('chrome', '0');
  }
  return `?${params.toString()}`;
});

watch([componentId, scenarioId, theme, viewport, hideChrome], () => {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  params.set('audit', '1');
  params.set('component', componentId.value);
  params.set('scenario', scenarioId.value);
  params.set('theme', theme.value);
  params.set('viewport', viewport.value);

  if (hideChrome.value) {
    params.set('chrome', '0');
  } else {
    params.delete('chrome');
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', nextUrl);
  document.title = `Vue Audit • ${componentRegistry[componentId.value].label} • ${activeScenarioLabel.value}`;
});

const previewRoot = ref<HTMLElement | null>(null);

const lightThemeVariables: Record<string, string> = {
  '--ms-modern-page-background': '#eef4ff',
  '--ms-modern-page-background-accent': '#d8e3f4',
  '--ms-modern-panel-surface': 'rgba(255, 255, 255, 0.88)',
  '--ms-modern-panel-surface-elevated': 'rgba(255, 255, 255, 0.96)',
  '--ms-modern-panel-border': 'rgba(148, 163, 184, 0.32)',
  '--ms-modern-panel-border-strong': 'rgba(59, 130, 246, 0.28)',
  '--ms-modern-text-primary': '#0f172a',
  '--ms-modern-text-secondary': 'rgba(51, 65, 85, 0.82)',
  '--ms-modern-text-muted': 'rgba(100, 116, 139, 0.9)',
  '--ms-modern-field-background': 'rgba(248, 250, 252, 0.96)',
  '--ms-modern-field-border': 'rgba(148, 163, 184, 0.32)',
  '--ms-modern-field-border-focus': 'rgba(59, 130, 246, 0.56)',
  '--ms-modern-overlay-backdrop': 'rgba(15, 23, 42, 0.18)',
  '--ms-modern-overlay-scrim': 'rgba(15, 23, 42, 0.08)',
  '--ms-modern-shadow-soft': '0 18px 44px rgba(148, 163, 184, 0.22)',
  '--ms-modern-shadow-elevated': '0 28px 64px rgba(148, 163, 184, 0.28)',
  '--ms-modern-shadow-floating': '0 18px 44px rgba(15, 23, 42, 0.12)',
  '--ms-modern-shadow-focus': '0 0 0 3px rgba(59, 130, 246, 0.18)',
};

const themeVariables = computed(() => (theme.value === 'light' ? lightThemeVariables : {}));
const buttonVariant = computed<'primary' | 'secondary' | 'ghost'>(() => {
  if (scenarioId.value === 'secondary') {
    return 'secondary';
  }

  if (scenarioId.value === 'ghost') {
    return 'ghost';
  }

  return 'primary';
});

const fieldValue = computed(() => {
  if (scenarioId.value === 'filled') {
    return 'Audit runner';
  }

  if (scenarioId.value === 'error') {
    return 'x';
  }

  return '';
});

const fieldHint = computed(() => {
  if (scenarioId.value === 'focused') {
    return 'Focus ring parity check';
  }

  return 'Used across entry and settings flows.';
});

const fieldError = computed(() => (
  scenarioId.value === 'error'
    ? 'Display Name must be at least 2 characters.'
    : undefined
));

const surfaceTone = computed<'base' | 'elevated'>(() => (scenarioId.value === 'elevated' ? 'elevated' : 'base'));
const alertType = computed<'success' | 'danger'>(() => (scenarioId.value === 'danger' ? 'danger' : 'success'));
const loadingText = computed(() => (scenarioId.value === 'text-only' ? 'Preparing room shell...' : 'Syncing participant state...'));
const messagesRenderMode = computed<'inline' | 'sidebar'>(() => (scenarioId.value === 'sidebar' ? 'sidebar' : 'inline'));
const participantsRenderMode = computed<'inline' | 'sidebar'>(() => (scenarioId.value === 'sidebar' ? 'sidebar' : 'inline'));
const translationRenderMode = computed<'modal' | 'sidebar'>(() => (scenarioId.value === 'sidebar' ? 'sidebar' : 'modal'));
const menuRenderMode = computed<'modal' | 'sidebar' | 'inline'>(() => (
  scenarioId.value === 'sidebar'
    ? 'sidebar'
    : scenarioId.value === 'inline'
      ? 'inline'
      : 'modal'
));
const displaySettingsRenderMode = computed<'modal' | 'sidebar' | 'inline'>(() => (
  scenarioId.value === 'sidebar'
    ? 'sidebar'
    : scenarioId.value === 'inline'
      ? 'inline'
      : 'modal'
));
const requestsRenderMode = computed<'modal' | 'sidebar'>(() => (scenarioId.value === 'sidebar' ? 'sidebar' : 'modal'));
const waitingRenderMode = computed<'modal' | 'sidebar'>(() => (scenarioId.value === 'sidebar' ? 'sidebar' : 'modal'));
const shareEventRenderMode = computed<'modal' | 'sidebar' | 'inline'>(() => (
  scenarioId.value === 'sidebar'
    ? 'sidebar'
    : scenarioId.value === 'inline'
      ? 'inline'
      : 'modal'
));

const credentials: Credentials = {
  apiUserName: 'audit-user',
  apiKey: 'audit-key',
};

const noOpAsync = async () => ({ id: 'audit-socket' } as never);
const noOpAsyncVoid = async () => undefined;
const noOp = () => undefined;
const auditSocket = {
  emit: noOp,
  on: noOp,
  off: noOp,
} as never;

const auditParticipants = [
  {
    id: 'participant-host',
    name: 'Host',
    islevel: '2',
    muted: false,
  } as Participant,
  {
    id: 'participant-maya',
    name: 'Maya',
    islevel: '1',
    muted: false,
  } as Participant,
  {
    id: 'participant-jordan',
    name: 'Jordan',
    islevel: '0',
    muted: true,
  } as Participant,
] as Participant[];

const auditMessages = [
  {
    sender: 'Host',
    receivers: ['All'],
    timestamp: '10:42',
    group: true,
    message: 'Welcome to the audit room.',
  } as Message,
  {
    sender: 'Maya',
    receivers: ['Host'],
    timestamp: '10:43',
    group: false,
    message: 'Need a quick review on the latest settings panel.',
  } as Message,
] as Message[];

const auditRequests = [
  {
    id: 'request-audio',
    icon: 'fa-microphone',
    name: 'Maya',
  },
  {
    id: 'request-video',
    icon: 'fa-video',
    name: 'Jordan',
  },
  {
    id: 'request-screen',
    icon: 'fa-desktop',
    name: 'Taylor',
  },
] as Request[];

const auditWaitingRoom = [
  {
    id: 'waiting-1',
    name: 'Taylor',
  },
  {
    id: 'waiting-2',
    name: 'Sam',
  },
  {
    id: 'waiting-3',
    name: 'Riley',
  },
] as WaitingRoomParticipant[];

const auditPanelists = auditParticipants.filter((participant) => participant.name !== 'Host').slice(0, 2);

const auditTranslationChannels = new Map([
  ['participant-maya', { languages: ['fr', 'es'], originalProducerId: 'producer-maya' }],
  ['participant-jordan', { languages: ['de'], originalProducerId: 'producer-jordan' }],
]);

const auditUserVoiceClones = [
  {
    id: 'clone-elevenlabs-primary',
    providerVoiceId: 'clone-elevenlabs-primary',
    voiceId: 'clone-elevenlabs-primary',
    name: 'Audit Narrator',
    provider: 'elevenlabs',
    isDefault: true,
  },
  {
    id: 'clone-cartesia-secondary',
    providerVoiceId: 'clone-cartesia-secondary',
    voiceId: 'clone-cartesia-secondary',
    name: 'Orbit Cartesia',
    provider: 'cartesia',
    isDefault: false,
  },
];

const auditPermissionConfig = {
  level0: {
    useMic: 'approval',
    useCamera: 'approval',
    useScreen: 'disallow',
    useChat: 'allow',
  },
  level1: {
    useMic: 'allow',
    useCamera: 'allow',
    useScreen: 'approval',
    useChat: 'allow',
  },
};

const auditPolls = [
  {
    id: 'poll-1',
    question: 'Should breakout rooms open after the agenda review?',
    type: 'yesNo',
    options: ['Yes', 'No'],
    votes: [4, 1],
    status: 'active',
    voters: {},
  },
  {
    id: 'poll-2',
    question: 'Which Q&A format should we default to?',
    type: 'custom',
    options: ['Chat', 'Live queue', 'Hybrid'],
    votes: [3, 2, 1],
    status: 'inactive',
    voters: {},
  },
];

const previewBreakoutRooms = [
  [
    { name: auditParticipants[1]?.name ?? 'Maya', breakRoom: 0 },
  ],
  [
    { name: auditParticipants[2]?.name ?? 'Jordan', breakRoom: 1 },
  ],
];

const previewWhiteboardUsers = auditParticipants
  .filter((participant) => participant.name !== 'Host')
  .slice(0, 2)
  .map((participant) => ({ name: participant.name, useBoard: true }));

const createPreviewWhiteboardShapes = () => ([
  {
    type: 'rectangle',
    x1: 120,
    y1: 120,
    x2: 540,
    y2: 320,
    color: '#2563eb',
    thickness: 4,
    lineType: 'solid',
  },
  {
    type: 'text',
    x: 180,
    y: 220,
    text: 'Storyboard ideas',
    color: '#0f172a',
    font: 'Georgia',
    fontSize: 34,
  },
  {
    type: 'freehand',
    color: '#dc2626',
    thickness: 5,
    points: [
      { x: 620, y: 210 },
      { x: 690, y: 180 },
      { x: 760, y: 240 },
      { x: 860, y: 200 },
    ],
  },
]);

const auditVideoInputs = [
  { deviceId: 'camera-front', label: 'Front Camera' },
  { deviceId: 'camera-rear', label: 'Rear Camera' },
];

const auditAudioInputs = [
  { deviceId: 'mic-default', label: 'Default Microphone' },
  { deviceId: 'mic-usb', label: 'USB Microphone' },
];

const createMeetingAuditParameters = () => {
  const parameters = {
    imgSrc: 'https://mediasfu.com/images/logo192.png',
    showAlert: noOp,
    updateIsLoadingModalVisible: noOp,
    connectSocket: noOpAsync,
    connectLocalSocket: async () => ({ socket: auditSocket, data: undefined }),
    updateSocket: noOp,
    updateLocalSocket: noOp,
    updateValidated: noOp,
    updateApiUserName: noOp,
    updateApiToken: noOp,
    updateLink: noOp,
    updateRoomName: noOp,
    updateMember: noOp,
    updateAudioPreference: noOp,
    updateVideoPreference: noOp,
    updateAudioOutputPreference: noOp,
    updateIsDarkMode: noOp,
    updateEventType: noOp,
    updateVirtualBackground: noOp,
    updateCurrentFacingMode: noOp,
    updateKeepBackground: noOp,
    updateAppliedBackground: noOp,
    updateSelfieSegmentation: noOp,
    roomName: 'audit-room',
    member: 'Host',
    coHost: 'Maya',
    islevel: '2',
    eventType: 'conference',
    socket: auditSocket,
    localSocket: auditSocket,
    participants: auditParticipants,
    filteredParticipants: auditParticipants,
    coHostResponsibility: [],
    updateIsMessagesModalVisible: noOp,
    updateDirectMessageDetails: noOp,
    updateStartDirectMessage: noOp,
    updateParticipants: noOp,
    filteredRequestList: auditRequests,
    updateRequestList: noOp,
    filteredWaitingRoomList: auditWaitingRoom,
    updateWaitingList: noOp,
    videoInputs: auditVideoInputs,
    audioInputs: auditAudioInputs,
    userDefaultVideoInputDevice: auditVideoInputs[0].deviceId,
    userDefaultAudioInputDevice: auditAudioInputs[0].deviceId,
    isBackgroundModalVisible: false,
    updateIsBackgroundModalVisible: noOp,
    meetingDisplayType: 'video',
    autoWave: false,
    forceFullDisplay: false,
    meetingVideoOptimized: true,
    updateMeetingDisplayType: noOp,
    mainRoomsLength: 1,
    memberRoom: 0,
    hostNewRoom: 0,
    itemPageLimit: 6,
    canStartBreakout: true,
    breakoutRooms: [],
    updateBreakoutRooms: noOp,
    updateCanStartBreakout: noOp,
    shareScreenStarted: false,
    shared: false,
    newParticipantAction: 'autoAssignNewRoom',
    breakOutRoomStarted: false,
    breakOutRoomEnded: false,
    updateBreakOutRoomStarted: noOp,
    updateBreakOutRoomEnded: noOp,
    prevMeetingDisplayType: 'video',
    whiteboardStarted: false,
    whiteboardEnded: true,
    whiteboardUsers: [],
    updateWhiteboardUsers: noOp,
    updateWhiteboardStarted: noOp,
    updateWhiteboardEnded: noOp,
    updateCanStartWhiteboard: noOp,
    updateIsConfigureWhiteboardModalVisible: noOp,
    onScreenChanges: noOpAsyncVoid,
    prepopulateUserMedia: noOpAsyncVoid,
    rePort: noOpAsyncVoid,
    captureCanvasStream: noOpAsyncVoid,
    mainHeightWidth: 100,
    updateMainHeightWidth: noOp,
    hostLabel: 'Host',
    recordStarted: false,
    recordResumed: false,
    recordPaused: false,
    recordStopped: false,
    recordingMediaOptions: 'all',
    recordingAudioOptions: 'all',
    recordingVideoOptions: 'all',
    recordingAddHLS: false,
    updateRecordingMediaOptions: noOp,
    updateRecordingAudioOptions: noOp,
    updateRecordingVideoOptions: noOp,
    updateRecordingAddHLS: noOp,
    recordingVideoType: 'camera',
    recordingDisplayType: 'all',
    recordingBackgroundColor: '#0f172a',
    recordingNameTagsColor: '#ffffff',
    recordingOrientationVideo: 'landscape',
    recordingNameTags: true,
    recordingAddText: true,
    recordingCustomText: 'MediaSFU Audit',
    recordingCustomTextPosition: 'bottom',
    recordingCustomTextColor: '#ffffff',
    updateRecordingVideoType: noOp,
    updateRecordingDisplayType: noOp,
    updateRecordingBackgroundColor: noOp,
    updateRecordingNameTagsColor: noOp,
    updateRecordingOrientationVideo: noOp,
    updateRecordingNameTags: noOp,
    updateRecordingAddText: noOp,
    updateRecordingCustomText: noOp,
    updateRecordingCustomTextPosition: noOp,
    updateRecordingCustomTextColor: noOp,
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
};

const createPreviewMeetingParameters = () => {
  const parameters = createMeetingAuditParameters();
  parameters.breakoutRooms = previewBreakoutRooms;
  parameters.whiteboardUsers = previewWhiteboardUsers;
  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
};

const alertOverlayProps = computed(() => ({
  style: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '0',
    minHeight: '100%',
  },
}));

const timerMeetingProgress = computed(() => {
  if (scenarioId.value === 'long') {
    return '56:12';
  }

  if (scenarioId.value === 'compact') {
    return '03:08';
  }

  return '12:18';
});

const timerStageStyle = computed(() => ({
  position: 'relative',
  minHeight: '220px',
  width: scenarioId.value === 'compact' ? '160px' : '320px',
  margin: '72px auto',
}));

const timerProps = computed(() => ({
  meetingProgressTime: timerMeetingProgress.value,
  position: 'topLeft' as const,
  variant: scenarioId.value === 'compact' ? 'minimal' as const : 'badge' as const,
  showIcon: scenarioId.value !== 'compact',
  isDarkMode: theme.value === 'dark',
  enableGlow: scenarioId.value === 'long',
  showTimer: true,
}));

const paginationTotalPages = computed(() => (scenarioId.value === 'single' ? 1 : 8));
const paginationCurrentPage = computed(() => (scenarioId.value === 'single' ? 1 : 4));

const paginationParameters = computed(() => {
  const parameters = createMeetingAuditParameters();
  parameters.mainRoomsLength = paginationTotalPages.value;
  parameters.memberRoom = paginationCurrentPage.value;
  parameters.hostNewRoom = 0;
  parameters.breakoutRooms = [];
  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const paginationStageStyle = computed(() => ({
  width: scenarioId.value === 'narrow' ? '272px' : scenarioId.value === 'single' ? '220px' : '420px',
  margin: '120px auto 0',
  display: 'flex',
  justifyContent: 'center',
}));

const paginationProps = computed(() => ({
  totalPages: paginationTotalPages.value,
  currentUserPage: paginationCurrentPage.value,
  parameters: paginationParameters.value,
  showAspect: true,
  paginationHeight: 52,
  direction: 'horizontal' as const,
  position: 'middle' as const,
  location: 'middle' as const,
}));

const controlButtonsStageStyle = computed(() => ({
  width: scenarioId.value === 'compact' ? '360px' : '560px',
  margin: '140px auto 0',
  display: 'flex',
  justifyContent: 'center',
}));

const controlButtonsButtons = computed(() => ([
  {
    name: 'Microphone',
    tooltip: 'Microphone',
    icon: faMicrophone,
    alternateIcon: faMicrophoneSlash,
    active: true,
  },
  {
    name: 'Camera',
    tooltip: 'Camera',
    icon: faVideo,
    alternateIcon: faVideoSlash,
    active: true,
  },
  {
    name: 'Chat',
    tooltip: 'Open chat',
    icon: faComments,
    active: scenarioId.value !== 'compact',
  },
  {
    name: 'People',
    tooltip: 'View participants',
    icon: faUsers,
    active: false,
  },
  {
    name: 'Settings',
    tooltip: 'Open settings',
    icon: faCog,
    active: false,
    disabled: scenarioId.value === 'disabled',
  },
]));

const controlButtonsProps = computed(() => ({
  buttons: controlButtonsButtons.value,
  alignment: 'center' as const,
  vertical: false,
  isDarkMode: theme.value === 'dark',
  animateOnMount: false,
}));

// ── Touch controls ────────────────────────────────────────────────────────
const touchControlsStageStyle = computed(() => ({
  position: 'relative' as const,
  width: '420px',
  height: '360px',
  margin: '40px auto 0',
  background: theme.value === 'dark'
    ? 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.85))'
    : 'linear-gradient(135deg, rgba(200,210,230,0.82), rgba(220,230,250,0.72))',
  borderRadius: '18px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const touchControlsButtons = [
  { name: 'Microphone', icon: faMicrophone, alternateIcon: faMicrophoneSlash, active: true, activeColor: '#60a5fa', inActiveColor: '#94a3b8', color: '#60a5fa', onPress: () => {} },
  { name: 'Camera', icon: faVideo, alternateIcon: faVideoSlash, active: true, activeColor: '#34d399', inActiveColor: '#94a3b8', color: '#34d399', onPress: () => {} },
  { name: 'Chat', icon: faComments, active: false, activeColor: '#f472b6', inActiveColor: '#94a3b8', color: '#94a3b8', onPress: () => {} },
  { name: 'Participants', icon: faUsers, active: false, activeColor: '#fb923c', inActiveColor: '#94a3b8', color: '#94a3b8', onPress: () => {} },
];

const touchControlsProps = computed(() => ({
  buttons: touchControlsButtons,
  position: scenarioId.value === 'vertical-left' ? 'left' as const : 'right' as const,
  location: 'bottom' as const,
  direction: scenarioId.value === 'horizontal' ? 'horizontal' as const : 'vertical' as const,
  showAspect: true,
}));

const mainContainerLayout = computed(() => {
  if (scenarioId.value === 'sidebar') {
    return {
      widthFraction: viewport.value === 'mobile' ? 0.94 : 0.82,
      heightFraction: viewport.value === 'mobile' ? 0.78 : 0.74,
      columns: viewport.value === 'mobile' ? '1fr' : 'minmax(0, 2.2fr) minmax(260px, 1fr)',
      padding: viewport.value === 'mobile' ? 16 : 24,
      marginTop: viewport.value === 'mobile' ? 24 : 32,
    };
  }

  if (scenarioId.value === 'mobile') {
    return {
      widthFraction: 0.94,
      heightFraction: 0.82,
      columns: '1fr',
      padding: 16,
      marginTop: 20,
    };
  }

  return {
    widthFraction: viewport.value === 'mobile' ? 0.94 : 0.86,
    heightFraction: viewport.value === 'mobile' ? 0.8 : 0.74,
    columns: viewport.value === 'mobile' ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    padding: viewport.value === 'mobile' ? 16 : 24,
    marginTop: viewport.value === 'mobile' ? 24 : 32,
  };
});

const mainContainerTiles = computed<Array<{ label: string; detail: string; tone: GridTone }>>(() => {
  if (scenarioId.value === 'sidebar') {
    return [
      {
        label: 'Primary room canvas',
        detail: 'Main stage stays dominant while a docked helper panel remains visible.',
        tone: 'primary',
      },
      {
        label: 'Docked sidebar rail',
        detail: 'Participants, messages, or settings can stay open without covering the stage.',
        tone: 'slate',
      },
    ];
  }

  if (scenarioId.value === 'mobile') {
    return [
      {
        label: 'Mobile room shell',
        detail: 'Single-column layout keeps the room content readable on narrow viewports.',
        tone: 'primary',
      },
      {
        label: 'Support actions',
        detail: 'Secondary actions and state summaries collapse beneath the main content.',
        tone: 'accent',
      },
    ];
  }

  return [
    {
      label: 'Primary column',
      detail: 'Main presentation content fills the wider room lane.',
      tone: 'primary',
    },
    {
      label: 'Support column',
      detail: 'Room notes, pinned context, or auxiliary tools share the same modern shell.',
      tone: 'accent',
    },
  ];
});

const mainContainerProps = computed(() => ({
  backgroundColor: theme.value === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
  containerWidthFraction: mainContainerLayout.value.widthFraction,
  containerHeightFraction: mainContainerLayout.value.heightFraction,
  marginLeft: 0,
  marginRight: 0,
  marginTop: mainContainerLayout.value.marginTop,
  marginBottom: 0,
  padding: mainContainerLayout.value.padding,
}));

const mainContainerContentStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: mainContainerLayout.value.columns,
  gap: viewport.value === 'mobile' || scenarioId.value === 'mobile' ? '12px' : '16px',
  height: '100%',
  minHeight: '100%',
  boxSizing: 'border-box',
  alignContent: 'stretch',
}));

const mainAspectLayout = computed(() => {
  if (scenarioId.value === 'shared-screen') {
    return {
      widthFraction: viewport.value === 'mobile' ? 0.94 : 0.82,
      heightFraction: viewport.value === 'mobile' ? 0.76 : 0.72,
      columns: viewport.value === 'mobile' ? '1fr' : 'minmax(0, 2.4fr) minmax(260px, 1fr)',
      gap: viewport.value === 'mobile' ? '12px' : '16px',
    };
  }

  if (scenarioId.value === 'sidebar') {
    return {
      widthFraction: viewport.value === 'mobile' ? 0.94 : 0.8,
      heightFraction: viewport.value === 'mobile' ? 0.78 : 0.72,
      columns: viewport.value === 'mobile' ? '1fr' : 'minmax(0, 2fr) minmax(240px, 1fr)',
      gap: viewport.value === 'mobile' ? '12px' : '16px',
    };
  }

  return {
    widthFraction: viewport.value === 'mobile' ? 0.94 : 0.82,
    heightFraction: viewport.value === 'mobile' ? 0.78 : 0.72,
    columns: '1fr',
    gap: viewport.value === 'mobile' ? '12px' : '16px',
  };
});

const mainAspectTiles = computed<Array<{ label: string; detail: string; tone: GridTone }>>(() => {
  if (scenarioId.value === 'shared-screen') {
    return [
      {
        label: 'Shared screen focus',
        detail: 'Presentation content takes the dominant lane while room context remains adjacent.',
        tone: 'primary',
      },
      {
        label: 'Support stack',
        detail: 'Pinned notes, speaker queue, or room tools stay visible beside the main stage.',
        tone: 'indigo',
      },
    ];
  }

  if (scenarioId.value === 'sidebar') {
    return [
      {
        label: 'Primary presentation',
        detail: 'The main room canvas preserves width even with a sidebar docked nearby.',
        tone: 'primary',
      },
      {
        label: 'Sidebar context',
        detail: 'Helper content remains visually separated but still inside the shared main area.',
        tone: 'slate',
      },
    ];
  }

  return [
    {
      label: 'Main presentation surface',
      detail: 'Primary room content scales responsively without extra docked panels.',
      tone: 'accent',
    },
  ];
});

const mainAspectProps = computed(() => ({
  backgroundColor: theme.value === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(248, 250, 252, 0.92)',
  showControls: true,
  containerWidthFraction: mainAspectLayout.value.widthFraction,
  containerHeightFraction: mainAspectLayout.value.heightFraction,
  updateIsWideScreen: noOp,
  updateIsMediumScreen: noOp,
  updateIsSmallScreen: noOp,
}));

const mainAspectContentStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: mainAspectLayout.value.columns,
  gap: mainAspectLayout.value.gap,
  height: '100%',
  minHeight: '100%',
  padding: viewport.value === 'mobile' ? '16px' : '24px',
  boxSizing: 'border-box',
}));

const mainGridLayout = computed(() => {
  if (scenarioId.value === 'shared-screen') {
    return {
      width: viewport.value === 'mobile' ? 340 : 980,
      height: viewport.value === 'mobile' ? 360 : 420,
      columns: viewport.value === 'mobile' ? '1fr' : 'minmax(0, 2.4fr) minmax(280px, 1fr)',
      tiles: [
        {
          label: 'Shared screen stage',
          detail: 'Screenboard or screen-share content holds the dominant main grid position.',
          tone: 'primary' as GridTone,
        },
        {
          label: 'Host context',
          detail: 'Speaker or room metadata remains anchored in the secondary lane.',
          tone: 'indigo' as GridTone,
        },
      ],
    };
  }

  if (scenarioId.value === 'theme-switch') {
    return {
      width: viewport.value === 'mobile' ? 340 : 980,
      height: viewport.value === 'mobile' ? 360 : 420,
      columns: viewport.value === 'mobile' ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      tiles: [
        {
          label: 'Theme-aware stage',
          detail: 'Main grid chrome should stay coherent when the room toggles between light and dark.',
          tone: 'emerald' as GridTone,
        },
        {
          label: 'Secondary context',
          detail: 'Auxiliary content keeps the same spacing and framing across theme flips.',
          tone: 'slate' as GridTone,
        },
      ],
    };
  }

  return {
    width: viewport.value === 'mobile' ? 340 : 980,
    height: viewport.value === 'mobile' ? 360 : 420,
    columns: viewport.value === 'mobile' ? '1fr' : 'minmax(0, 2fr) minmax(240px, 1fr)',
    tiles: [
      {
        label: 'Host spotlight',
        detail: 'The host or active speaker remains the dominant first-class grid item.',
        tone: 'primary' as GridTone,
      },
      {
        label: 'Context panel',
        detail: 'Pinned notes, queue state, or room tools sit beside the spotlighted content.',
        tone: 'accent' as GridTone,
      },
    ],
  };
});

const mainGridStageStyle = computed(() => ({
  width: `${mainGridLayout.value.width}px`,
  margin: '72px auto 0',
}));

const mainGridTiles = computed(() => mainGridLayout.value.tiles);

const mainGridProps = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#020617' : '#e2e8f0',
  mainSize: 68,
  height: mainGridLayout.value.height,
  width: mainGridLayout.value.width,
  showAspect: true,
  timeBackgroundColor: theme.value === 'dark' ? 'rgba(59, 130, 246, 0.85)' : 'rgba(37, 99, 235, 0.78)',
  showTimer: true,
  meetingProgressTime: '00:24:18',
  stackDirection: 'row' as const,
  isDarkMode: theme.value === 'dark',
}));

const mainGridContentStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: mainGridLayout.value.columns,
  gap: viewport.value === 'mobile' ? '12px' : '16px',
  height: '100%',
  padding: viewport.value === 'mobile' ? '16px' : '24px',
  boxSizing: 'border-box',
}));

const otherGridLayout = computed(() => {
  if (scenarioId.value === 'pagination') {
    return {
      width: viewport.value === 'mobile' ? 340 : 880,
      height: viewport.value === 'mobile' ? 280 : 320,
      columns: viewport.value === 'mobile' ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      tiles: [
        {
          label: 'Secondary participants',
          detail: 'Overflow room content can page without collapsing the auxiliary grid shell.',
          tone: 'accent' as GridTone,
        },
        {
          label: 'Pagination state',
          detail: 'Page changes remain framed inside the same docked secondary area.',
          tone: 'amber' as GridTone,
        },
      ],
    };
  }

  if (scenarioId.value === 'sidebar') {
    return {
      width: viewport.value === 'mobile' ? 340 : 880,
      height: viewport.value === 'mobile' ? 280 : 320,
      columns: viewport.value === 'mobile' ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      tiles: [
        {
          label: 'Docked secondary grid',
          detail: 'Auxiliary room content remains readable when the room shell also opens a sidebar.',
          tone: 'slate' as GridTone,
        },
        {
          label: 'Companion lane',
          detail: 'Secondary grid content still tiles predictably beside the primary room shell.',
          tone: 'indigo' as GridTone,
        },
      ],
    };
  }

  return {
    width: viewport.value === 'mobile' ? 340 : 880,
    height: viewport.value === 'mobile' ? 280 : 320,
    columns: viewport.value === 'mobile' ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    tiles: [
      {
        label: 'Chat lane',
        detail: 'Secondary content tiles can coexist without displacing the main stage.',
        tone: 'accent' as GridTone,
      },
      {
        label: 'Queue lane',
        detail: 'Participant backlog or requests remain visible in the same grid shell.',
        tone: 'emerald' as GridTone,
      },
      {
        label: 'Backlog lane',
        detail: 'Additional room context can live in the overflow grid without layout drift.',
        tone: 'slate' as GridTone,
      },
    ],
  };
});

const otherGridStageStyle = computed(() => ({
  width: `${otherGridLayout.value.width}px`,
  margin: '72px auto 0',
}));

const otherGridTiles = computed(() => otherGridLayout.value.tiles);

const otherGridProps = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#020617' : '#e2e8f0',
  width: otherGridLayout.value.width,
  height: otherGridLayout.value.height,
  showAspect: true,
  timeBackgroundColor: theme.value === 'dark' ? 'rgba(34, 197, 94, 0.82)' : 'rgba(22, 163, 74, 0.78)',
  showTimer: true,
  meetingProgressTime: '00:24:18',
  stackDirection: 'column' as const,
  isDarkMode: theme.value === 'dark',
}));

const otherGridContentStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: otherGridLayout.value.columns,
  gap: viewport.value === 'mobile' ? '12px' : '14px',
  height: '100%',
  padding: viewport.value === 'mobile' ? '14px' : '20px',
  boxSizing: 'border-box',
}));

const subAspectLayout = computed(() => {
  if (scenarioId.value === 'compact') {
    return {
      widthFraction: viewport.value === 'mobile' ? 0.94 : 0.62,
      defaultFractionSub: 0.08,
      columns: viewport.value === 'mobile' ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      tiles: [
        {
          label: 'Compact controls',
          detail: 'Slimmer control lanes still preserve grouping and emphasis.',
          tone: 'slate' as GridTone,
        },
        {
          label: 'Quick actions',
          detail: 'High-priority room actions remain clustered in the reduced sub-aspect height.',
          tone: 'accent' as GridTone,
        },
      ],
    };
  }

  if (scenarioId.value === 'shared-screen') {
    return {
      widthFraction: viewport.value === 'mobile' ? 0.94 : 0.78,
      defaultFractionSub: 0.1,
      columns: viewport.value === 'mobile' ? '1fr' : 'repeat(3, minmax(0, 1fr))',
      tiles: [
        {
          label: 'Share tools',
          detail: 'Screen-share helpers remain grouped beneath the main presentation surface.',
          tone: 'primary' as GridTone,
        },
        {
          label: 'Annotation mode',
          detail: 'Secondary actions stay aligned when collaborative presentation is active.',
          tone: 'indigo' as GridTone,
        },
        {
          label: 'Context actions',
          detail: 'Room controls keep a predictable lane beneath the shared screen.',
          tone: 'slate' as GridTone,
        },
      ],
    };
  }

  return {
    widthFraction: viewport.value === 'mobile' ? 0.94 : 0.74,
    defaultFractionSub: 0.1,
    columns: viewport.value === 'mobile' ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    tiles: [
      {
        label: 'Alternate tool group',
        detail: 'Card arrangements can reorder without leaving the sub-aspect shell.',
        tone: 'accent' as GridTone,
      },
      {
        label: 'Status rail',
        detail: 'Session status or automation chips remain visible in the alternate arrangement.',
        tone: 'emerald' as GridTone,
      },
      {
        label: 'Utility lane',
        detail: 'Supplemental room tools keep the same spacing in the swapped layout.',
        tone: 'slate' as GridTone,
      },
    ],
  };
});

const subAspectStageStyle = computed(() => ({
  marginTop: '72px',
}));

const subAspectTiles = computed(() => subAspectLayout.value.tiles);

const subAspectProps = computed(() => ({
  backgroundColor: theme.value === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.92)',
  showControls: true,
  containerWidthFraction: subAspectLayout.value.widthFraction,
  defaultFractionSub: subAspectLayout.value.defaultFractionSub,
}));

const subAspectContentStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: subAspectLayout.value.columns,
  gap: viewport.value === 'mobile' ? '10px' : '12px',
  height: '100%',
  padding: viewport.value === 'mobile' ? '10px' : '12px',
  boxSizing: 'border-box',
}));

const flexibleGridLayout = computed(() => {
  if (scenarioId.value === 'compact') {
    return {
      rows: 3,
      columns: 2,
      count: 4,
      customWidth: viewport.value === 'mobile' ? 140 : 180,
      customHeight: viewport.value === 'mobile' ? 100 : 120,
    };
  }

  return {
    rows: 2,
    columns: 3,
    count: scenarioId.value === 'filled' ? 6 : 4,
    customWidth: viewport.value === 'mobile' ? 140 : 220,
    customHeight: viewport.value === 'mobile' ? 100 : 140,
  };
});

const flexibleGridStageStyle = computed(() => ({
  width: viewport.value === 'mobile'
    ? 'min(100% - 32px, 340px)'
    : scenarioId.value === 'compact'
      ? 'min(100% - 48px, 560px)'
      : 'min(100% - 48px, 760px)',
  margin: '72px auto',
  padding: '18px',
  borderRadius: '28px',
  background: theme.value === 'dark' ? 'rgba(15, 23, 42, 0.28)' : 'rgba(255, 255, 255, 0.42)',
  border: theme.value === 'dark' ? '1px solid rgba(148, 163, 184, 0.18)' : '1px solid rgba(148, 163, 184, 0.3)',
  boxShadow: theme.value === 'dark' ? '0 24px 64px rgba(2, 8, 23, 0.28)' : '0 24px 64px rgba(148, 163, 184, 0.22)',
}));

const flexibleGridComponents = computed<RenderableComponent[]>(() => (
  auditGridTiles.slice(0, flexibleGridLayout.value.count).map((tile, index) => ({
    component: AuditGridTile,
    props: {
      label: tile.label,
      detail: tile.detail,
      tone: tile.tone,
      isDarkMode: theme.value === 'dark',
    },
    key: `audit-grid-${scenarioId.value}-${index}`,
  }))
));

const flexibleGridProps = computed(() => ({
  customWidth: flexibleGridLayout.value.customWidth,
  customHeight: flexibleGridLayout.value.customHeight,
  rows: flexibleGridLayout.value.rows,
  columns: flexibleGridLayout.value.columns,
  componentsToRender: flexibleGridComponents.value,
  backgroundColor: 'transparent',
  isDarkMode: theme.value === 'dark',
  enableGlassmorphism: true,
  cellBorderRadius: 18,
}));

const flexibleVideoLayout = computed(() => ({
  rows: 2,
  columns: 2,
  count: scenarioId.value === 'empty' ? 2 : 4,
  customWidth: viewport.value === 'mobile' ? 150 : 240,
  customHeight: viewport.value === 'mobile' ? 110 : 160,
}));

const flexibleVideoStageStyle = computed(() => ({
  width: viewport.value === 'mobile' ? 'min(100% - 32px, 340px)' : 'min(100% - 48px, 620px)',
  margin: '72px auto',
  padding: '18px',
  borderRadius: '28px',
  background: theme.value === 'dark' ? 'rgba(15, 23, 42, 0.28)' : 'rgba(255, 255, 255, 0.42)',
  border: theme.value === 'dark' ? '1px solid rgba(148, 163, 184, 0.18)' : '1px solid rgba(148, 163, 184, 0.3)',
  boxShadow: theme.value === 'dark' ? '0 24px 64px rgba(2, 8, 23, 0.28)' : '0 24px 64px rgba(148, 163, 184, 0.22)',
}));

const flexibleVideoComponents = computed<RenderableComponent[]>(() => (
  auditGridTiles.slice(0, flexibleVideoLayout.value.count).map((tile, index) => ({
    component: AuditGridTile,
    props: {
      label: tile.label,
      detail: tile.detail,
      tone: tile.tone,
      isDarkMode: theme.value === 'dark',
    },
    key: `audit-video-${scenarioId.value}-${index}`,
  }))
));

const flexibleVideoProps = computed(() => ({
  customWidth: flexibleVideoLayout.value.customWidth,
  customHeight: flexibleVideoLayout.value.customHeight,
  rows: flexibleVideoLayout.value.rows,
  columns: flexibleVideoLayout.value.columns,
  componentsToRender: flexibleVideoComponents.value,
  showAspect: true,
  backgroundColor: 'transparent',
  isDarkMode: theme.value === 'dark',
  enableGlassmorphism: true,
  cellBorderRadius: 18,
}));

const cardStageStyle = computed(() => ({
  width: viewport.value === 'mobile' ? 'min(100% - 32px, 320px)' : 'min(100% - 48px, 360px)',
  height: viewport.value === 'mobile' ? '320px' : '360px',
  margin: '72px auto',
}));

const videoCardParticipant = computed(() => ({
  id: 'participant-video-card',
  name: scenarioId.value === 'muted' ? 'Jordan' : scenarioId.value === 'subtitle' ? 'Taylor' : 'Maya',
  islevel: scenarioId.value === 'muted' ? '0' : '1',
  muted: scenarioId.value === 'muted',
  videoOn: scenarioId.value !== 'muted',
} as Participant));

const audioCardParticipant = computed(() => ({
  id: 'participant-audio-card',
  name: scenarioId.value === 'muted' ? 'Jordan' : scenarioId.value === 'subtitle' ? 'Sam' : 'Avery',
  islevel: '1',
  muted: scenarioId.value === 'muted',
  videoOn: false,
} as Participant));

const videoCardLoudness = computed(() => {
  if (componentId.value !== 'video-card') {
    return 118;
  }

  return scenarioId.value === 'muted' ? 0 : 144;
});

const audioCardLoudness = computed(() => {
  if (componentId.value !== 'audio-card') {
    return 118;
  }

  if (scenarioId.value === 'muted') {
    return 0;
  }

  return scenarioId.value === 'speaking' ? 148 : 136;
});

const cardParameters = computed(() => {
  const parameters = createMeetingAuditParameters();
  const participants = [videoCardParticipant.value, audioCardParticipant.value];

  parameters.participants = participants;
  parameters.filteredParticipants = participants;
  parameters.audioDecibels = [
    { name: videoCardParticipant.value.name, averageLoudness: videoCardLoudness.value },
    { name: audioCardParticipant.value.name, averageLoudness: audioCardLoudness.value },
  ];
  parameters.getUpdatedAllParams = () => parameters;

  return parameters;
});

const videoCardSubtitleText = computed(() => (
  componentId.value === 'video-card' && scenarioId.value === 'subtitle'
    ? 'Quarterly roadmap update in progress.'
    : ''
));

const audioCardSubtitleText = computed(() => (
  componentId.value === 'audio-card' && scenarioId.value === 'subtitle'
    ? 'Caption stream synced to host audio.'
    : ''
));

const audioCardImageSource = computed(() => (
  componentId.value === 'audio-card' && scenarioId.value === 'subtitle'
    ? 'https://mediasfu.com/images/logo192.png'
    : undefined
));

const videoCardProps = computed(() => ({
  name: videoCardParticipant.value.name,
  participant: videoCardParticipant.value,
  remoteProducerId: 'audit-video-producer',
  eventType: 'conference',
  forceFullDisplay: false,
  parameters: cardParameters.value,
  liveSubtitleText: videoCardSubtitleText.value,
  showSubtitles: true,
  backgroundColor: theme.value === 'dark' ? '#0f172a' : '#dbeafe',
}));

const audioCardProps = computed(() => ({
  name: audioCardParticipant.value.name,
  participant: audioCardParticipant.value,
  parameters: cardParameters.value,
  imageSource: audioCardImageSource.value,
  liveSubtitleText: audioCardSubtitleText.value,
  showSubtitles: true,
}));

const preJoinParameters: PreJoinPageParameters = {
  imgSrc: 'https://mediasfu.com/images/logo192.png',
  eventType: 'webinar',
  showAlert: noOp,
  updateIsLoadingModalVisible: noOp,
  connectSocket: noOpAsync,
  connectLocalSocket: async () => ({ socket: { id: 'audit-local-socket' } as never, data: undefined }),
  updateSocket: noOp,
  updateLocalSocket: noOp,
  updateValidated: noOp,
  updateEventType: noOp,
  updateApiUserName: noOp,
  updateApiToken: noOp,
  updateLink: noOp,
  updateRoomName: noOp,
  updateMember: noOp,
};

const preJoinProps = computed(() => ({
  returnUI: true,
  entryShellLayout: viewport.value === 'mobile' ? 'inline' : 'split',
  parameters: preJoinParameters,
  credentials,
}));

const welcomeParameters: WelcomePageParameters = {
  imgSrc: 'https://mediasfu.com/images/logo192.png',
  showAlert: noOp,
  updateIsLoadingModalVisible: noOp,
  connectSocket: noOpAsync,
  updateSocket: noOp,
  updateValidated: noOp,
  updateApiUserName: noOp,
  updateApiToken: noOp,
  updateLink: noOp,
  updateRoomName: noOp,
  updateMember: noOp,
};

const messagesFixture = computed(() => (
  scenarioId.value === 'empty'
    ? []
    : scenarioId.value === 'group'
      ? [auditMessages[0]]
      : auditMessages
));

const directMessageDetails = computed(() => (
  scenarioId.value === 'direct'
    ? auditParticipants[1]
    : undefined
));

const participantsFixture = computed(() => (
  scenarioId.value === 'empty'
    ? []
    : auditParticipants
));

const participantsModalParameters = computed(() => {
  const parameters = {
    coHostResponsibility: [],
    coHost: 'Maya',
    member: 'Host',
    islevel: '2',
    participants: auditParticipants,
    eventType: 'conference',
    filteredParticipants: participantsFixture.value,
    socket: auditSocket,
    roomName: 'audit-room',
    updateIsMessagesModalVisible: noOp,
    updateDirectMessageDetails: noOp,
    updateStartDirectMessage: noOp,
    updateParticipants: noOp,
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const permissionsModalParameters = computed(() => {
  const parameters = {
    participants: auditParticipants,
    member: 'Host',
    islevel: '2',
    socket: auditSocket,
    roomName: 'audit-room',
    showAlert: noOp,
    permissionConfig: auditPermissionConfig,
    updatePermissionConfig: noOp,
    audioSetting: 'approval',
    videoSetting: 'approval',
    screenshareSetting: 'disallow',
    chatSetting: 'allow',
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const panelistsModalParameters = computed(() => {
  const parameters = {
    participants: auditParticipants,
    panelists: auditPanelists,
    member: 'Host',
    islevel: '2',
    socket: auditSocket,
    roomName: 'audit-room',
    showAlert: noOp,
    itemPageLimit: 6,
    panelistsFocused: scenarioId.value !== 'available',
    updatePanelists: noOp,
    updatePanelistsFocused: noOp,
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const recordingParameters = computed(() => createMeetingAuditParameters());
const breakoutRoomsParameters = computed(() => createPreviewMeetingParameters());
const configureWhiteboardParameters = computed(() => createPreviewMeetingParameters());
const mediaSettingsParameters = computed(() => createMeetingAuditParameters());

const whiteboardShapes = ref<unknown[]>(createPreviewWhiteboardShapes());
const whiteboardUseImageBackground = ref(false);
const whiteboardRedoStack = ref<unknown[]>([]);
const whiteboardUndoStack = ref<string[]>([]);
const whiteboardStarted = ref(true);
const whiteboardEnded = ref(false);
const whiteboardUsers = ref(previewWhiteboardUsers.map((participant) => ({ ...participant })));
const whiteboardParticipants = ref(auditParticipants.map((participant) => ({ ...participant })));
const whiteboardScreenId = ref('audit-whiteboard');
const whiteboardShareScreenStarted = ref(false);
const whiteboardCanvas = ref<HTMLCanvasElement | null>(null);

const whiteboardDimensions = computed(() => (
  viewport.value === 'mobile'
    ? { width: 390, height: 720 }
    : { width: 1280, height: 720 }
));

const whiteboardParameters = computed(() => {
  const parameters = createPreviewMeetingParameters();
  parameters.shapes = whiteboardShapes.value;
  parameters.useImageBackground = whiteboardUseImageBackground.value;
  parameters.redoStack = whiteboardRedoStack.value;
  parameters.undoStack = whiteboardUndoStack.value;
  parameters.whiteboardStarted = whiteboardStarted.value;
  parameters.whiteboardEnded = whiteboardEnded.value;
  parameters.whiteboardUsers = whiteboardUsers.value;
  parameters.participants = whiteboardParticipants.value;
  parameters.participantsAll = whiteboardParticipants.value;
  parameters.screenId = whiteboardScreenId.value;
  parameters.shareScreenStarted = whiteboardShareScreenStarted.value;
  parameters.targetResolution = 'hd';
  parameters.targetResolutionHost = 'hd';
  parameters.isDarkModeValue = theme.value === 'dark';
  parameters.updateShapes = (value: unknown[]) => {
    whiteboardShapes.value = [...value];
  };
  parameters.updateUseImageBackground = (value: boolean) => {
    whiteboardUseImageBackground.value = value;
  };
  parameters.updateRedoStack = (value: unknown[]) => {
    whiteboardRedoStack.value = [...value];
  };
  parameters.updateUndoStack = (value: string[]) => {
    whiteboardUndoStack.value = [...value];
  };
  parameters.updateWhiteboardStarted = (value: boolean) => {
    whiteboardStarted.value = value;
  };
  parameters.updateWhiteboardEnded = (value: boolean) => {
    whiteboardEnded.value = value;
  };
  parameters.updateWhiteboardUsers = (value: Array<{ name: string; useBoard: boolean }>) => {
    whiteboardUsers.value = value.map((participant) => ({ ...participant }));
  };
  parameters.updateParticipants = (value: Participant[]) => {
    whiteboardParticipants.value = value.map((participant) => ({ ...participant }));
  };
  parameters.updateScreenId = (value: string) => {
    whiteboardScreenId.value = value;
  };
  parameters.updateShareScreenStarted = (value: boolean) => {
    whiteboardShareScreenStarted.value = value;
  };
  parameters.updateCanvasWhiteboard = (value: HTMLCanvasElement | null) => {
    whiteboardCanvas.value = value;
  };
  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const whiteboardStageStyle = computed(() => ({
  width: `${whiteboardDimensions.value.width}px`,
  maxWidth: '100%',
  height: `${whiteboardDimensions.value.height}px`,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
}));

const whiteboardProps = computed(() => ({
  customWidth: whiteboardDimensions.value.width,
  customHeight: whiteboardDimensions.value.height,
  parameters: whiteboardParameters.value,
  showAspect: true,
}));

const requestsFixture = computed(() => (
  scenarioId.value === 'empty'
    ? []
    : auditRequests
));

const waitingFixture = computed(() => (
  scenarioId.value === 'empty'
    ? []
    : auditWaitingRoom
));

const requestsModalParameters = computed(() => {
  const parameters = {
    filteredRequestList: requestsFixture.value,
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const waitingModalParameters = computed(() => {
  const parameters = {
    filteredWaitingRoomList: waitingFixture.value,
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const displaySettingsParameters = computed(() => ({
  meetingDisplayType: 'video',
  autoWave: true,
  forceFullDisplay: false,
  meetingVideoOptimized: true,
  showSubtitlesOnCards: true,
}));

const permissionsModalProps = computed(() => ({
  isPermissionsModalVisible: true,
  onPermissionsClose: noOp,
  parameters: permissionsModalParameters.value,
  renderMode: 'modal' as const,
}));

const panelistsModalProps = computed(() => ({
  isPanelistsModalVisible: true,
  onPanelistsClose: noOp,
  parameters: panelistsModalParameters.value,
  renderMode: 'modal' as const,
}));

const breakoutRoomsModalProps = computed(() => ({
  isVisible: true,
  onBreakoutRoomsClose: noOp,
  parameters: breakoutRoomsParameters.value,
  renderMode: 'modal' as const,
}));

const configureWhiteboardModalProps = computed(() => ({
  isVisible: true,
  onConfigureWhiteboardClose: noOp,
  parameters: configureWhiteboardParameters.value,
  renderMode: 'modal' as const,
}));

const pollModalProps = computed(() => ({
  isPollModalVisible: true,
  onClose: noOp,
  member: 'Host',
  islevel: '2',
  polls: auditPolls,
  poll: auditPolls[0],
  socket: auditSocket,
  roomName: 'audit-room',
  showAlert: noOp,
  updateIsPollModalVisible: noOp,
  handleCreatePoll: noOpAsyncVoid,
  handleEndPoll: noOpAsyncVoid,
  handleVotePoll: noOpAsyncVoid,
  renderMode: 'modal' as const,
  isDarkMode: theme.value === 'dark',
}));

const recordingModalProps = computed(() => ({
  isRecordingModalVisible: true,
  onClose: noOp,
  confirmRecording: noOpAsyncVoid,
  startRecording: noOpAsyncVoid,
  parameters: recordingParameters.value,
  renderMode: 'modal' as const,
}));

const translationModalParameters = computed(() => {
  const isUnsupported = scenarioId.value === 'unsupported';
  const isPending = scenarioId.value === 'pending';
  const isPersonal = scenarioId.value === 'personal';
  const isClone = scenarioId.value === 'clone';

  const parameters = {
    translationConfig: {
      supportTranslation: !isUnsupported && !isPending,
      spokenLanguageMode: 'any',
      listenLanguageMode: 'any',
      maxActiveChannelsPerSpeaker: 2,
      autoDetectSpokenLanguage: true,
      allowSpokenLanguageChange: true,
      allowListenLanguageChange: true,
      translationVoiceConfig: isClone
        ? {
            voiceClone: {
              provider: 'elevenlabs',
              voiceId: 'clone-elevenlabs-primary',
            },
            ttsNickName: 'elevenlabs',
          }
        : null,
    },
    isPersonalTranslation: isPersonal,
    canUsePersonalTranslation: isPersonal || isPending,
    personalTranslationUsername: isPersonal || isPending ? 'audit.personal' : undefined,
    userVoiceClones: isClone ? auditUserVoiceClones : undefined,
    member: 'Host',
    islevel: '2',
    audioProducer: { id: 'producer-host' },
    participants: auditParticipants,
    mySpokenLanguage: 'en',
    mySpokenLanguageEnabled: true,
    myDefaultOutputLanguage: isUnsupported || isPending ? null : 'fr',
    myDefaultListenLanguage: 'es',
    listenPreferences: scenarioId.value === 'sidebar'
      ? new Map([['participant-maya', 'fr']])
      : new Map(),
    availableTranslationChannels: auditTranslationChannels,
    showSubtitlesOnCards: true,
    updateMySpokenLanguage: noOp,
    updateMySpokenLanguageEnabled: noOp,
    updateMyDefaultOutputLanguage: noOp,
    updateMyDefaultListenLanguage: noOp,
    updateListenPreferences: noOp,
    updateShowSubtitlesOnCards: noOp,
    socket: auditSocket,
    roomName: 'audit-room',
    showAlert: noOp,
  } as AuditParameterBag;

  parameters.getUpdatedAllParams = () => parameters;
  return parameters;
});

const translationModalProps = computed(() => ({
  isTranslationSettingsModalVisible: true,
  onTranslationSettingsClose: noOp,
  parameters: translationModalParameters.value,
  renderMode: translationRenderMode.value,
}));

const eventSettingsModalProps = computed(() => ({
  isEventSettingsModalVisible: true,
  onEventSettingsClose: noOp,
  audioSetting: 'approval',
  videoSetting: 'approval',
  screenshareSetting: 'approval',
  chatSetting: 'allow',
  updateAudioSetting: noOp,
  updateVideoSetting: noOp,
  updateScreenshareSetting: noOp,
  updateChatSetting: noOp,
  updateIsSettingsModalVisible: noOp,
  roomName: 'audit-room',
  socket: auditSocket,
  showAlert: noOp,
  renderMode: 'modal' as const,
}));

const mediaSettingsModalProps = computed(() => ({
  isMediaSettingsModalVisible: true,
  onMediaSettingsClose: noOp,
  parameters: mediaSettingsParameters.value,
  switchVideoOnPress: noOpAsyncVoid,
  switchAudioOnPress: noOpAsyncVoid,
  switchCameraOnPress: noOpAsyncVoid,
  renderMode: 'modal' as const,
}));

const menuModalProps = computed(() => ({
  isVisible: true,
  onClose: noOp,
  roomName: 'audit-room',
  adminPasscode: '2468',
  islevel: '2',
  eventType: 'conference',
  localLink: 'https://audits.mediasfu.com/rooms/audit-room',
  renderMode: menuRenderMode.value,
  isDarkMode: theme.value === 'dark',
}));

const displaySettingsModalProps = computed(() => ({
  isDisplaySettingsModalVisible: true,
  onDisplaySettingsClose: noOp,
  onModifyDisplaySettings: async () => undefined,
  parameters: displaySettingsParameters.value,
  renderMode: displaySettingsRenderMode.value,
}));

const requestsModalProps = computed(() => ({
  isRequestsModalVisible: true,
  onRequestClose: noOp,
  requestCounter: requestsFixture.value.length,
  onRequestFilterChange: noOp,
  requestList: requestsFixture.value,
  updateRequestList: noOp,
  roomName: 'audit-room',
  socket: auditSocket,
  parameters: requestsModalParameters.value,
  renderMode: requestsRenderMode.value,
}));

const waitingModalProps = computed(() => ({
  isWaitingModalVisible: true,
  onWaitingRoomClose: noOp,
  waitingRoomCounter: waitingFixture.value.length,
  onWaitingRoomFilterChange: noOp,
  waitingRoomList: waitingFixture.value,
  updateWaitingList: noOp,
  roomName: 'audit-room',
  socket: auditSocket,
  parameters: waitingModalParameters.value,
  renderMode: waitingRenderMode.value,
}));

const shareEventModalProps = computed(() => ({
  isShareEventModalVisible: true,
  onShareEventClose: noOp,
  roomName: 'audit-room',
  adminPasscode: '2468',
  islevel: '2',
  eventType: 'conference',
  localLink: 'https://audits.mediasfu.com/rooms/audit-room',
  shareButtons: true,
  renderMode: shareEventRenderMode.value,
}));

const confirmExitModalProps = computed(() => ({
  isConfirmExitModalVisible: true,
  onConfirmExitClose: noOp,
  member: 'Host',
  roomName: 'audit-room',
  socket: auditSocket,
  islevel: scenarioId.value === 'guest' ? '0' : '2',
}));

const confirmHereModalProps = computed(() => ({
  isConfirmHereModalVisible: true,
  onConfirmHereClose: noOp,
  countdownDuration: 120,
  socket: auditSocket,
  roomName: 'audit-room',
  member: 'Host',
  position: 'center',
  onTimeout: noOp,
  onSuppressConfirmHere: noOp,
}));

const syncInteractiveState = async () => {
  await nextTick();
  const root = previewRoot.value;
  if (!root) {
    return;
  }

  if (componentId.value === 'messages') {
    const targetLabel = scenarioId.value === 'direct' ? 'Direct' : 'Group';
    const tabButton = Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.trim() === targetLabel);
    tabButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return;
  }

  if (componentId.value === 'permissions' && scenarioId.value === 'users') {
    const tabButton = Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.trim() === 'Participant levels');
    tabButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return;
  }

  if (componentId.value === 'field' && scenarioId.value === 'focused') {
    const input = root.querySelector('input, textarea, select') as HTMLElement | null;
    input?.focus();
    return;
  }

  if (componentId.value === 'prejoin' && scenarioId.value === 'create') {
    const toggleButton = Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.includes('Switch to Create Mode'));
    toggleButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
};

onMounted(() => {
  void syncInteractiveState();
});

watch([componentId, scenarioId, theme, viewport], () => {
  void syncInteractiveState();
});
</script>

<style scoped>
.ms-audit {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 24%),
    radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.12), transparent 28%),
    #050b16;
  color: #e2e8f0;
}

.ms-audit--light {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 24%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.12), transparent 30%),
    #e8eef8;
  color: #0f172a;
}

.ms-audit--capture {
  display: block;
}

.ms-audit__controls {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: rgba(3, 7, 18, 0.84);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(18px);
}

.ms-audit--light .ms-audit__controls {
  background: rgba(255, 255, 255, 0.82);
  border-right-color: rgba(148, 163, 184, 0.26);
}

.ms-audit__controls-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ms-audit__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(147, 197, 253, 0.9);
}

.ms-audit__title {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
}

.ms-audit__copy {
  margin: 0;
  color: rgba(226, 232, 240, 0.74);
  line-height: 1.6;
}

.ms-audit--light .ms-audit__copy {
  color: rgba(51, 65, 85, 0.82);
}

.ms-audit__field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 700;
}

.ms-audit__field-group select {
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.56);
  color: inherit;
  padding: 0 14px;
}

.ms-audit--light .ms-audit__field-group select {
  background: rgba(255, 255, 255, 0.82);
}

.ms-audit__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
}

.ms-audit__query {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.78rem;
}

.ms-audit__query code {
  display: block;
  padding: 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.72);
  color: #bfdbfe;
  white-space: pre-wrap;
  word-break: break-word;
}

.ms-audit--light .ms-audit__query code {
  background: rgba(226, 232, 240, 0.92);
  color: #1d4ed8;
}

.ms-audit__stage {
  padding: 28px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.ms-audit__viewport {
  width: min(100%, 1440px);
  min-height: 900px;
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 24%),
    radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.14), transparent 28%),
    var(--ms-modern-page-background, #081120);
  box-shadow: 0 28px 80px rgba(2, 8, 23, 0.34);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.ms-audit__viewport--mobile {
  width: 390px;
  min-height: 844px;
}

.ms-audit-example-card {
  width: min(100%, 540px);
  margin: 72px auto;
  padding: 32px;
  border-radius: 28px;
  background: var(--ms-modern-panel-surface-elevated);
  border: 1px solid var(--ms-modern-panel-border-strong);
  box-shadow: var(--ms-modern-shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ms-audit-example-card--field {
  gap: 20px;
}

.ms-audit-example-card__kicker,
.ms-audit-surface__eyebrow {
  margin: 0;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ms-modern-text-muted);
}

.ms-audit-example-card__title,
.ms-audit-surface__title {
  margin: 0;
  color: var(--ms-modern-text-primary);
  font-size: 2rem;
  line-height: 1.05;
}

.ms-audit-example-card__copy,
.ms-audit-surface__copy {
  margin: 0;
  color: var(--ms-modern-text-secondary);
  line-height: 1.65;
}

.ms-audit-surface-wrap {
  width: min(100%, 680px);
  margin: 72px auto;
}

.ms-audit-surface {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ms-audit-overlay-stage {
  position: relative;
  min-height: 100%;
}

.ms-audit-modal-shell {
  min-height: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: flex;
}

.ms-audit-modal-shell > * {
  flex: 1;
  min-height: 0;
}

@media (max-width: 1080px) {
  .ms-audit {
    grid-template-columns: 1fr;
  }

  .ms-audit__controls {
    position: relative;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }
}

@media (max-width: 640px) {
  .ms-audit__stage {
    padding: 16px;
  }

  .ms-audit__viewport,
  .ms-audit__viewport--mobile {
    width: 100%;
    min-height: 780px;
    border-radius: 24px;
  }

  .ms-audit-example-card,
  .ms-audit-surface-wrap {
    width: min(100% - 24px, 100%);
    margin: 24px auto;
  }

  .ms-audit-modal-shell {
    padding: 16px;
  }
}
</style>