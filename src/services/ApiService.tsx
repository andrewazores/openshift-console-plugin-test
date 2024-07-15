import { from, of, Observable } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export class ApiService {
  getTest(): Observable<string> {
    const pluginName = 'cryostat'; // this must match the consolePlugin.name in package.json
    const proxyAlias = 'cryostat-proxy'; // this must match the .spec.proxy.alias in the ConsolePlugin CR
    return from(
      consoleFetch(`/api/proxy/plugin/${pluginName}/${proxyAlias}/test?testQuery=${+Date.now()}`, {
        method: 'GET',
        redirect: 'follow',
      })).pipe(
        concatMap((resp: Response) => resp.ok ? resp.text() : of(resp.statusText)),
        catchError(err => {
          console.error(err);
          return JSON.stringify(err);
        }),
      );
  }
}
