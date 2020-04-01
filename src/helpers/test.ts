import {
  rollFromSet,
  rollWeighted,
  calculateVocabContainerHeight,
  calculateBarrierDistance,
  calculateBarriersPerScreen
} from '../helpers';
it('should randomly pick a number from a set', () => {
  const set = [42, 420, 69, 47, 27];
  expect(set.includes(rollFromSet(set))).toBe(true);
});
it('should randomly pick a number from spec with probability according to given weights', () => {
  const spec = { 1: 1.0, 2: 0.0, 3: 0.0 };
  expect(rollWeighted(spec)).toBe('1');
});
it('calculate correct barrier height', () => {
  expect(calculateVocabContainerHeight(800,5)).toBe(160);
});
it('calculate correct barrier distance', () => {
  expect((calculateBarrierDistance(100,2))).toBe(200);
});
it('calculate correct barriers per screen', () => {
  expect((calculateBarriersPerScreen(100,200,1200))).toBe(4);
});