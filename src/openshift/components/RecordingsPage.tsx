import Recordings from '@app/Recordings/Recordings';
import { Page } from '@patternfly/react-core';
import React from 'react';
import '@app/app.css';

export default function RecordingsPage() {
  return (
    <Page>
      <Recordings />
    </Page>
  );
}
