import Events from '@app/Events/Events';
import { Page } from '@patternfly/react-core';
import React from 'react';
import '@app/app.css';

export default function EventsPage() {
  return (
    <Page>
      <Events />
    </Page>
  );
}
