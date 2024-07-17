import * as React from 'react';
import './example.css';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, MenuToggle, MenuToggleElement, Page, PageSection, Select, SelectList, SelectOption, Text, TextContent, TextInput, Title } from '@patternfly/react-core';
import { ServiceContext } from '../services/Services';
import { Subscription } from 'rxjs';
import { K8sResourceCommon, NamespaceBar, useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export default function ExamplePage() {
  const { t } = useTranslation('plugin__console-plugin-template');
  const services = React.useContext(ServiceContext);
  const [subs] = React.useState([] as Subscription[]);

  const [backendHealth, setBackendHealth] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [response, setResponse] = React.useState('');
  const [ns] = useActiveNamespace();
  const [name, setName] = React.useState('');
  const [crs, crsLoaded, crsError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    namespaced: true,
    namespace: ns,
    groupVersionKind: {
      group: 'operator.cryostat.io',
      kind: 'Cryostat',
      version: 'v1beta2',
    },
  });
  const [method, setMethod] = React.useState('GET');
  const [path, setPath] = React.useState('');

  React.useEffect(() => {
    return () => {
      subs.forEach(s => s.unsubscribe());
    }
  }, [subs]);

  const getBackendHealth = React.useCallback(() => {
    subs.push(services.api.status().subscribe(setBackendHealth));
  }, [services.api, setBackendHealth]);

  const crSelect = React.useCallback((_, name: string) => {
    setName(name);
    setDropdownOpen(false);
  }, [setName, setDropdownOpen]);

  const dropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const doCryostatRequest = React.useCallback(() => {
    subs.push(services.api.cryostat(ns, name, method, path).subscribe(setResponse));
  }, [subs, services.api, ns, name, method, path, setResponse]);

  React.useEffect(() => {
    getBackendHealth();
  }, [getBackendHealth]);

  const selectToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={dropdownToggle}
      isExpanded={dropdownOpen}
      isDisabled={crs.length == 0}
    >
      {name || 'Cryostats'}
    </MenuToggle>
  );

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('Hello, Plugin!')}</title>
      </Helmet>
      <Page>
        <NamespaceBar onNamespaceChange={() => setName('')}>
          <Select
            isOpen={dropdownOpen}
            selected={name}
            onSelect={crSelect}
            onOpenChange={o => setDropdownOpen(o)}
            toggle={selectToggle}
            shouldFocusToggleOnSelect
          >
            <SelectList>
              {
                crs.map(cr => <SelectOption value={cr.metadata.name} key={cr.metadata.name}>{cr.metadata.name}</SelectOption>)
              }
            </SelectList>
          </Select>
        </NamespaceBar>
        <PageSection variant="light">
          <Title headingLevel="h1">{t(backendHealth)}</Title>
        </PageSection>
        <PageSection variant="light">
          <Text>API Request Method</Text>
          <TextInput value={method} type="text" placeholder='GET' onChange={(_evt, value) => setMethod(value)} />
          <Text>API Request Path</Text>
          <TextInput value={path} type="text" placeholder='/api/v3/targets' onChange={(_evt, value) => setPath(value)} />
          <Button onClick={doCryostatRequest} disabled={crs.length == 0 || !name}>Fire</Button>
          <TextContent>
            <Text>Response:</Text>
            <code>{crsLoaded ? response : crsError}</code>
          </TextContent>
        </PageSection>
      </Page>
    </>
  );
}
