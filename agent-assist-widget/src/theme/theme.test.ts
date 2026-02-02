import { getThemeProp, theme } from '.';

describe('getThemeProp()', () => {
  it('when props.theme is missing', () => {
    expect(getThemeProp('breadcrumbs.height', { theme })).toBe(
      theme.breadcrumbs.height,
    );
  });

  it('when props.theme is not missing', () => {
    expect(getThemeProp('breadcrumbs.height', { history: {} })).toBe(
      theme.breadcrumbs.height,
    );
  });
});
