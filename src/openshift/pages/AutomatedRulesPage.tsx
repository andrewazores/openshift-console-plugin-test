import React from 'react';
import '@app/app.css';
import { CryostatContainer } from '../components/CryostatContainer';
import Rules from '@app/Rules/Rules';

export default function AutomatedRulesPage() {
  return (
    <CryostatContainer>
      <Rules />
    </CryostatContainer>
  );
}
