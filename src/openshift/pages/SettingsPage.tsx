import Settings from '@app/Settings/Settings';
import { Page } from '@patternfly/react-core';
import React from 'react';
import '@app/app.css';

export default function SettingsPage() {
  return (
    <Page>
      <Settings />
    </Page>
  );
}
