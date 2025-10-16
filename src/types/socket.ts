import type { ResponseLocalConnection } from '../../../SharedTypes';

/**
 * MediaSFU-specific Socket type alias to ensure consistent typing across Vue components.
 */
export type MediaSFUSocket = NonNullable<ResponseLocalConnection['socket']>;
