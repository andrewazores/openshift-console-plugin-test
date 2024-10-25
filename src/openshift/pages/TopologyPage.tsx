import Topology from '@app/Topology/Topology';
import { Page } from '@patternfly/react-core';
import React from 'react';
import '@app/app.css';

export default function TopologyPage() {
  return (
    <Page>
      <Topology />
    </Page>
  );
}
