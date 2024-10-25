import Dashboard from '@app/Dashboard/Dashboard';
import { Page } from '@patternfly/react-core';
import React from 'react';
import '@app/app.css';

export default function DashboardPage() {
  return (
    <Page>
      <Dashboard />
    </Page>
  );
}
