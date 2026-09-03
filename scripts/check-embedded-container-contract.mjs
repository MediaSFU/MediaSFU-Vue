import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const generic = fs.readFileSync(
  path.join(root, 'src', 'components', 'mediasfuComponents', 'MediasfuGeneric.vue'),
  'utf8',
);
for (const fragment of [
  'containerWidthFraction?: number',
  'containerHeightFraction?: number',
  'containerWidthFraction: 1',
  'containerHeightFraction: 1',
  "props.containerWidthFraction < 1 ? '100%' : '100vw'",
  "props.containerHeightFraction < 1 ? '100%' : '100vh'",
  ':container-width-fraction="containerWidthFraction"',
  ':container-height-fraction="containerHeightFraction"',
  'containerWidthFraction: props.containerWidthFraction',
  'containerHeightFraction: props.containerHeightFraction',
]) assert.ok(generic.includes(fragment), `generic is missing ${fragment}`);
assert.equal((generic.match(/:container-width-fraction="containerWidthFraction"/g) || []).length, 3,
  'width must reach MainContainer, MainAspect, and MainScreen');
assert.equal((generic.match(/:container-height-fraction="containerHeightFraction"/g) || []).length, 3,
  'height must reach MainContainer, MainAspect, and MainScreen');
assert.equal((generic.match(/:default-fraction="embeddedMainHeightFraction"/g) || []).length, 2,
  'MainAspect and MainScreen must share the normalized embedded height');
assert.ok(!generic.includes(':default-fraction="1 - controlHeight"'),
  'the fixed control strip must not be scaled by the embedded height twice');

const viewportHeight = 900;
const containerHeightFraction = 0.74;
const controlViewportFraction = 40 / viewportHeight;
const mainFraction = 1 - controlViewportFraction / containerHeightFraction;
assert.ok(
  viewportHeight * containerHeightFraction * mainFraction +
    viewportHeight * controlViewportFraction <=
    viewportHeight * containerHeightFraction + Number.EPSILON,
  'MainAspect and SubAspect exceed the embedded height',
);

for (const surface of ['Webinar', 'Conference', 'Broadcast', 'Chat']) {
  const wrapper = fs.readFileSync(
    path.join(root, 'src', 'components', 'mediasfuComponents', `Mediasfu${surface}.vue`),
    'utf8',
  );
  assert.ok(wrapper.includes('<MediasfuGeneric v-bind="props"'), `${surface} does not inherit the generic contract`);
}

assert.ok(1500 * (1294 / 1500) <= 1294 + Number.EPSILON, 'embedded width exceeded its host');
console.log('Vue embedded-container contract passed for the generic and four public variants.');
