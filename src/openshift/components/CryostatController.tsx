import * as React from 'react';
import { connect } from 'react-redux';

type CryostatControllerProps = {
  children: React.ReactNode;
};

class CryostatControllerComponent extends React.Component<CryostatControllerProps> {
  state = {
    loaded: false,
  };

  componentDidMount(): void {
    this.loadCryostat();
  }

  componentWillUntmount(): void {
    // do nothing for now.
  }

  render(): React.ReactNode {
    return this.state.loaded ? <>{this.props.children}</> : <h1>loading!</h1>;
  }

  private loadCryostat = async (): Promise<void> => {
    await this.getCryostatConfig();
    this.applyUIDefaults();
    this.setDocLayout();
    this.setState({ loaded: true });
  };

  private getCryostatConfig = async (): Promise<void> => {
    console.warn('this is where we can fetch a config');
    // In Kiali, their Controller has a set of props like setNamespaces, setStatus, etc.,
    // and in this block they go through each and populate them with Kiali data.
    // This information will be dispatched later and set into Kiali action code.
    // https://github.com/kiali/openshift-servicemesh-plugin/blob/main/plugin/src/openshift/components/KialiController.tsx#L111
  };

  private applyUIDefaults = (): void => {
    // Kiali uses this to set the default state for the frontend
    // https://github.com/kiali/openshift-servicemesh-plugin/blob/main/plugin/src/openshift/components/KialiController.tsx#L166
  };

  private setDocLayout = (): void => {
    // Kiali uses this to check the OpenShift theme, and then set the according theme to their frontend
    // https://github.com/kiali/openshift-servicemesh-plugin/blob/main/plugin/src/openshift/components/KialiController.tsx#L257
  };
}

export const CryostatController = connect(null)(CryostatControllerComponent);
