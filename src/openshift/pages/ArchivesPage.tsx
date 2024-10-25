import Archives from '@app/Archives/Archives';
import React from 'react';
import '@app/app.css';
import { CryostatContainer } from '../components/CryostatContainer';

export default function ArchivesPage() {
  return (
    <CryostatContainer>
      <Archives />
    </CryostatContainer>
  );
}
