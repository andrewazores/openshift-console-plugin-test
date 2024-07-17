import { from, of, Observable } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export class ApiService {
  status(): Observable<string> {
    const url = this.proxyUrl('health');
    return from(
      consoleFetch(url.toString(), {
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

  cryostat(ns: string, name: string, method: string, requestPath: string, body?: object): Observable<string> {
    const url = this.proxyUrl(`upstream/${requestPath}`, { ns, name });
    return from(
      consoleFetch(url.toString(), {
        method,
        redirect: 'follow',
      })).pipe(
        concatMap((resp: Response) => resp.ok ? resp.text() : of(resp.statusText)),
        catchError(err => {
          console.error(err);
          return JSON.stringify(err);
        }),
      );
  }

  private proxyUrl(requestPath: string, query = {}): string {
    const pluginName = 'cryostat'; // this must match the consolePlugin.name in package.json
    const proxyAlias = 'cryostat-proxy'; // this must match the .spec.proxy.alias in the ConsolePlugin CR
    let url = `/api/proxy/plugin/${pluginName}/${proxyAlias}/${requestPath}`;
    if (Object.entries.length) {
      const queryString = Object.entries(query).map(e => `${e[0]}=${encodeURIComponent(String(e[1]))}`).join('&')
      url += `?${queryString}`;
    }
    console.log({ url });
    return url;
  }
}
