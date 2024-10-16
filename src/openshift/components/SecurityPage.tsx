import SecurityPanel from '@app/SecurityPanel/SecurityPanel';
import { Page } from '@patternfly/react-core';
import React from 'react';
import '@app/app.css';

export default function SecurityPage() {
  return (
    <Page>
      <SecurityPanel />
    </Page>
  );
}
