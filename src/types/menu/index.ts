import type { EventType } from '../../../../SharedTypes'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { Component } from 'vue'

export interface CustomButton {
  action: () => void
  show: boolean
  backgroundColor?: string
  disabled?: boolean
  icon?: IconDefinition
  iconStyle?: Record<string, string | number>
  text?: string
  textStyle?: Record<string, string | number>
  customComponent?: Component
}

export type MenuModalPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface MenuModalParameters {
  customButtons?: CustomButton[]
  shareButtons?: boolean
  position?: MenuModalPosition
  roomName: string
  adminPasscode?: string
  islevel?: string
  eventType?: EventType
  localLink?: string
  backgroundColor?: string
}

export interface MenuModalProps extends MenuModalParameters {
  isVisible: boolean
  onClose: () => void
}
