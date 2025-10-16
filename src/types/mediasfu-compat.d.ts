/**
 * Type compatibility definitions for MediaSFU Vue integration
 * 
 * This file provides type bridges between:
 * - Vue 3 Component types and React Component types from shared code
 * - Socket.io-client types from Vue node_modules vs React node_modules
 */

import type { Component } from 'vue';
import type { Socket as VueSocket } from 'socket.io-client';

/**
 * Socket type compatibility
 * 
 * The Vue project and React project have different versions of socket.io-client
 * in their respective node_modules, causing type incompatibility.
 * 
 * This type allows Socket instances from either project to be used interchangeably.
 */
export type CompatSocket = VueSocket | any;

/**
 * Component type compatibility
 * 
 * Vue Component type vs React's CustomVideoCardType.
 * This allows Vue components to be passed to functions expecting React component types.
 */
export type CompatComponent = Component | any;

/**
 * Type guard to check if a value is a valid Socket
 */
export function isSocket(value: any): value is CompatSocket {
  return value && typeof value.on === 'function' && typeof value.emit === 'function';
}

/**
 * Type guard to check if a value is a valid Component
 */
export function isComponent(value: any): value is CompatComponent {
  return value && (typeof value === 'function' || typeof value === 'object');
}

/**
 * Helper type to cast Socket to compatible type
 */
export type CastSocket<T> = T extends VueSocket ? CompatSocket : T;

/**
 * Helper type to cast Component to compatible type
 */
export type CastComponent<T> = T extends Component ? CompatComponent : T;
