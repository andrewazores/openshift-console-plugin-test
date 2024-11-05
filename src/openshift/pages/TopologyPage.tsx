import Topology from '@app/Topology/Topology';
import React from 'react';
import '@app/app.css';
import { CryostatContainer } from '../components/CryostatContainer';

export default function TopologyPage() {
  return (
    <CryostatContainer>
      <Topology />
    </CryostatContainer>
  );
}
