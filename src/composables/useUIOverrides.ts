/**
 * useUIOverrides Composable
 * 
 * Vue composition function for handling UI overrides in MediaSFU components.
 * Provides utilities to resolve component and function overrides with full type safety.
 */

import { h, type Component, type VNode } from 'vue';
import type { 
  CustomComponentOverride, 
  CustomFunctionOverride,
  MediasfuUICustomOverrides 
} from '../types/ui-overrides';

/**
 * Resolves a component override to a renderable Vue component
 * 
 * @param override - The override configuration (can include component or render function)
 * @param defaultComponent - The original component to use if no override is provided
 * @returns The resolved component to render
 */
export function resolveComponentOverride<P extends Record<string, unknown>>(
  override: CustomComponentOverride<P> | undefined,
  defaultComponent: Component<P>
): Component<P> {
  if (!override) {
    return defaultComponent;
  }

  // If a direct component replacement is provided, use it
  if (override.component) {
    return override.component;
  }

  // If a render function is provided, create a wrapper component
  if (override.render) {
    return {
      name: `${defaultComponent.name || 'Component'}Override`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: Object.keys((defaultComponent as any).props || {}),
      setup(props: P) {
        return () => override.render!(props, () => h(defaultComponent, props));
      }
    } as Component<P>;
  }

  return defaultComponent;
}

/**
 * Resolves a function override to an executable function
 * 
 * @param override - The override configuration (can include implementation or wrap function)
 * @param defaultFn - The original function to use if no override is provided
 * @returns The resolved function to execute
 */
export function resolveFunctionOverride<Fn extends (...args: never[]) => unknown>(
  override: CustomFunctionOverride<Fn> | undefined,
  defaultFn: Fn
): Fn {
  if (!override) {
    return defaultFn;
  }

  // If a direct implementation replacement is provided, use it
  if (override.implementation) {
    return override.implementation;
  }

  // If a wrapper is provided, wrap the default function
  if (override.wrap) {
    return override.wrap(defaultFn);
  }

  return defaultFn;
}

/**
 * Main composable for UI overrides
 * Provides reactive access to override resolution utilities
 */
export function useUIOverrides(overrides?: MediasfuUICustomOverrides) {
  /**
   * Get a resolved component for a specific override key
   */
  const getOverriddenComponent = <K extends keyof MediasfuUICustomOverrides>(
    key: K,
    defaultComponent: Component
  ): Component => {
    const override = overrides?.[key] as CustomComponentOverride | undefined;
    return resolveComponentOverride(override, defaultComponent);
  };

  /**
   * Get a resolved function for a specific override key
   */
  const getOverriddenFunction = <K extends keyof MediasfuUICustomOverrides>(
    key: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultFn: (...args: any[]) => any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ((...args: any[]) => any) => {
    const override = overrides?.[key] as CustomFunctionOverride<typeof defaultFn> | undefined;
    return resolveFunctionOverride(override, defaultFn);
  };

  /**
   * Check if a specific override is defined
   */
  const hasOverride = (key: keyof MediasfuUICustomOverrides): boolean => {
    return !!overrides?.[key];
  };

  /**
   * Create a render function that conditionally uses override or default
   */
  const createConditionalRenderer = <P extends Record<string, unknown>>(
    key: keyof MediasfuUICustomOverrides,
    defaultComponent: Component<P>
  ) => {
    return (props: P): VNode => {
      const resolved = getOverriddenComponent(key, defaultComponent);
      return h(resolved, props);
    };
  };

  return {
    getOverriddenComponent,
    getOverriddenFunction,
    hasOverride,
    createConditionalRenderer,
    overrides
  };
}

/**
 * Higher-order component helper for wrapping components with override support
 * 
 * @param component - The component to wrap
 * @param overrideKey - The key in the overrides map
 * @param overrides - The overrides configuration
 * @returns Wrapped component with override support
 */
export function withOverride<P extends Record<string, unknown>>(
  component: Component<P>,
  overrideKey: keyof MediasfuUICustomOverrides,
  overrides?: MediasfuUICustomOverrides
): Component<P> {
  const override = overrides?.[overrideKey] as CustomComponentOverride<P> | undefined;
  return resolveComponentOverride(override, component);
}

/**
 * Helper for wrapping functions with override support
 * 
 * @param fn - The function to wrap
 * @param overrideKey - The key in the overrides map
 * @param overrides - The overrides configuration
 * @returns Wrapped function with override support
 */
export function withFunctionOverride<Fn extends (...args: never[]) => unknown>(
  fn: Fn,
  overrideKey: keyof MediasfuUICustomOverrides,
  overrides?: MediasfuUICustomOverrides
): Fn {
  const override = overrides?.[overrideKey] as CustomFunctionOverride<Fn> | undefined;
  return resolveFunctionOverride(override, fn);
}
