// Vue-specific type for rendering components dynamically
import type { Component } from 'vue';

/**
 * Represents a component that can be rendered dynamically in Vue
 * with associated props and a unique key.
 */
export interface RenderableComponent<
  TProps extends Record<string, unknown> = Record<string, unknown>
> {
  /** The Vue component definition */
  component: Component;
  /** Props to pass to the component */
  props: TProps;
  /** Unique key for Vue's reconciliation */
  key: string | number;
}
