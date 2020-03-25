import { rollFromSet, rollWeighted } from './index';

it('should randomly pick a number from a set', () => {
  const set = [42, 420, 69, 47, 27];
  expect(set.includes(rollFromSet(set))).toBe(true);
});
it('should randomly pick a number from spec with probability according to given weights', () => {
  const spec = { 1: 1.0, 2: 0.0, 3: 0.0 };
  expect(rollWeighted(spec)).toBe('1');
});
