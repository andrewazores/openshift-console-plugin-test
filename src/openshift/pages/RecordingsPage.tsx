import React from 'react';
import '@app/app.css';
import { CryostatContainer } from '../components/CryostatContainer';
import Recordings from '@app/Recordings/Recordings';

export default function RecordingsPage() {
  return (
    <CryostatContainer>
      <Recordings />
    </CryostatContainer>
  );
}
