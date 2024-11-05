import Settings from '@app/Settings/Settings';
import React from 'react';
import '@app/app.css';
import { CryostatContainer } from '../components/CryostatContainer';

export default function SettingsPage() {
  return (
    <CryostatContainer>
      <Settings />
    </CryostatContainer>
  );
}
