import * as React from 'react';
import './example.css';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, MenuToggle, MenuToggleElement, Page, PageSection, Select, SelectList, SelectOption, Text, TextContent, TextInput, Title } from '@patternfly/react-core';
import { ServiceContext } from '../services/Services';
import { Subscription } from 'rxjs';
import { K8sResourceCommon, NamespaceBar, useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const ALL_NS = '#ALL_NS#';

const LOCALSTORAGE_KEY = 'cryostat-plugin';

export default function ExamplePage() {
  const { t } = useTranslation('plugin__console-plugin-template');
  const services = React.useContext(ServiceContext);
  const [subs] = React.useState([] as Subscription[]);

  const [backendHealth, setBackendHealth] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [response, setResponse] = React.useState('');
  const [searchNamespace] = useActiveNamespace();
  const [selector, setSelector] = React.useState('');
  // FIXME querying for this type means that the plugin only works with Operator-managed Cryostat
  // instances, not ones installed via Helm chart
  const [crs, crsLoaded, crsError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    namespaced: true,
    namespace: searchNamespace === ALL_NS ? undefined : searchNamespace,
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

  React.useEffect(() => {
    const selector = localStorage.getItem(LOCALSTORAGE_KEY);
    if (selector) {
      setSelector(selector);
    }
  }, [localStorage, setSelector]);

  const cr = React.useMemo(() => {
    const selectedNs = selector.split(',')[0];
    const selectedName = selector.split(',')[1];
    for (let c of crs) {
      if (c.metadata.namespace === selectedNs && c.metadata.name === selectedName) {
        return c;
      }
    }
    return undefined;
  }, [crs, selector]);

  const getBackendHealth = React.useCallback(() => {
    subs.push(services.api.status().subscribe(setBackendHealth));
  }, [services.api, setBackendHealth]);

  const crSelect = React.useCallback((_, cr: K8sResourceCommon) => {
    const selector = `${cr.metadata.namespace},${cr.metadata.name}`;
    localStorage.setItem(LOCALSTORAGE_KEY, selector);
    setSelector(selector);
    setDropdownOpen(false);
  }, [setSelector, setDropdownOpen]);

  const dropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const doCryostatRequest = React.useCallback(() => {
    subs.push(services.api.cryostat(cr.metadata.namespace, cr.metadata.name, method, path).subscribe(setResponse));
  }, [subs, services.api, cr, method, path, setResponse]);

  const renderLabel = React.useCallback((cr: K8sResourceCommon): string => {
    return searchNamespace === ALL_NS ? `${cr.metadata.name} (${cr.metadata.namespace})` : cr.metadata.name;
  }, [searchNamespace]);

  const selectToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={dropdownToggle}
      isExpanded={dropdownOpen}
      isDisabled={crs.length === 0}
    >
      {cr ? renderLabel(cr) : 'Cryostats'}
    </MenuToggle>
  );

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('Hello, Plugin!')}</title>
      </Helmet>
      <Page>
        <NamespaceBar onNamespaceChange={() => setSelector('')}>
          <Select
            isOpen={dropdownOpen}
            selected={selector}
            onSelect={crSelect}
            onOpenChange={setDropdownOpen}
            toggle={selectToggle}
            shouldFocusToggleOnSelect
          >
            <SelectList>
              {
                crs.map(cr => <SelectOption value={cr} key={cr.metadata.name}>{renderLabel(cr)}</SelectOption>)
              }
            </SelectList>
          </Select>
        </NamespaceBar>
        <PageSection variant="light">
          <Title headingLevel="h1">{t(backendHealth)}</Title>
        </PageSection>
        <PageSection variant="light">
          {
            cr ?
              <Text>Selected Cryostat CR "{cr.metadata.name}" in project "{cr.metadata.namespace}"</Text>
              : undefined
          }
          <Text>API Request Method</Text>
          <TextInput value={method} type="text" placeholder='GET' onChange={(_evt, value) => setMethod(value)} />
          <Text>API Request Path</Text>
          <TextInput value={path} type="text" placeholder='/api/v3/targets' onChange={(_evt, value) => setPath(value)} />
          <Button onClick={getBackendHealth}>Test Backend</Button>
          <Button onClick={doCryostatRequest} isDisabled={crs.length === 0 || !selector || !method || !path}>Fire Request</Button>
          <TextContent>
            <Text>Response:</Text>
            <code>{crsLoaded ? response : crsError}</code>
          </TextContent>
        </PageSection>
      </Page>
    </>
  );
}
