import {extraScrollPadding, scrollOffsetToRevealField} from '../app/screens/community/communityKeyboard';

describe('keyboard field visibility', () => {
  it('adds room under the last field while the keyboard is open', () => {
    expect(extraScrollPadding(0)).toBe(48);
    expect(extraScrollPadding(280)).toBe(308);
  });

  it('scrolls a covered field above the keyboard', () => {
    expect(scrollOffsetToRevealField(0, 700, 520)).toBe(180);
    expect(scrollOffsetToRevealField(40, 400, 520)).toBe(40);
  });
});
