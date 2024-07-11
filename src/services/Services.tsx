import * as React from 'react';
import { ApiService } from './ApiService';

export interface Services {
  api: ApiService;
}

const api = new ApiService();

const defaultServices: Services = {
  api,
};

const ServiceContext: React.Context<Services> = React.createContext(defaultServices);

export { ServiceContext, defaultServices };
