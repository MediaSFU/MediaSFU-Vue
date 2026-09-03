import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path) => readFileSync(resolve(path), 'utf8');
const generic = read('src/components/mediasfuComponents/MediasfuGeneric.vue');
const head = read('src/modern/mediasfu_components/ModernMediasfuGenericHead.vue');
const exportsFile = read('src/modern/mediasfu_components/index.ts');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

requireText(generic, '<Teleport', 'generic must move its existing compiled tree rather than create a second engine');
requireText(generic, ':disabled="!renderUIExternally"', 'local rendering must remain the default');
requireText(generic, 'v-else-if="hasStandardUI"', 'external UI must retain the standard main tree');
requireText(generic, 'renderModernMediasfuUITarget: props.externalUITarget', 'generic must publish its target selector');
requireText(head, 'props.parameters?.getCurrentParams?.() ?? props.parameters', 'head must use the pure current reader');
if (head.includes('getUpdatedAllParams')) throw new Error('head must never invoke the publishing getter');
if (/import\s+.*MediasfuGeneric/.test(head)) throw new Error('head must not instantiate another room engine');
requireText(exportsFile, "ModernMediasfuGenericHead.vue", 'head must be publicly exported');

console.log('Vue ModernMediasfuGenericHead contract passed');
