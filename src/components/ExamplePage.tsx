import * as React from 'react';
import './example.css';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Page, PageSection, Text, TextContent, TextInput, Title } from '@patternfly/react-core';
import { ServiceContext } from '../services/Services';
import { Subscription } from 'rxjs';

export default function ExamplePage() {
  const { t } = useTranslation('plugin__console-plugin-template');
  const services = React.useContext(ServiceContext);
  const [subs] = React.useState([] as Subscription[]);

  const [backendHealth, setBackendHealth] = React.useState('');
  const [response, setResponse] = React.useState('');
  const [ns, setNs] = React.useState('');
  const [name, setName] = React.useState('');
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

  const doCryostatRequest = React.useCallback(() => {
    subs.push(services.api.cryostat(ns, name, method, path).subscribe(setResponse));
  }, [services.api, ns, name, method, path, setResponse]);

  React.useEffect(() => {
    getBackendHealth();
  }, [getBackendHealth]);

  return (
    <>
      <Helmet>
        <title data-test="example-page-title">{t('Hello, Plugin!')}</title>
      </Helmet>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1">{t(backendHealth)}</Title>
        </PageSection>
        <PageSection variant="light">
          <Text>Cryostat Installation Namespace</Text>
          <TextInput value={ns} type="text" placeholder='cryostat' onChange={(_evt, value) => setNs(value)} />
          <Text>Cryostat CR Name</Text>
          <TextInput value={name} type="text" placeholder='cryostat-sample' onChange={(_evt, value) => setName(value)} />
          <Text>API Request Method</Text>
          <TextInput value={method} type="text" placeholder='GET' onChange={(_evt, value) => setMethod(value)} />
          <Text>API Request Path</Text>
          <TextInput value={path} type="text" placeholder='/api/v3/targets' onChange={(_evt, value) => setPath(value)} />
          <Button onClick={doCryostatRequest}>Fire</Button>
          <TextContent>
            <code>{response}</code>
          </TextContent>
        </PageSection>
      </Page>
    </>
  );
}
