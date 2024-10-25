import * as React from 'react';
import { store } from '@app/Shared/Redux/ReduxStore';
import { Provider } from 'react-redux';
import { CryostatController } from './CryostatController';

export const CryostatContainer: React.FC = ({ children }) => {
  return (
    <Provider store={store}>
      {/* TODO: set-up the CR selector, and any other component Cryostat-web might need */}
      <CryostatController>{children}</CryostatController>
    </Provider>
  );
};
