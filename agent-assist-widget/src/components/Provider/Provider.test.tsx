import React from 'react';
import { cleanup, render } from '@testing-library/react';

import Provider from '.';

afterEach(cleanup);

describe('<Provider />', () => {
  it('will render the component', () => {
    expect(() => render(<Provider>something</Provider>)).not.toBeNull();
  });
});
