import { from, of, Observable } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export class ApiService {
  getTest(): Observable<string> {
    const pluginName = 'cryostat';
    const proxyAlias = 'cryostat-proxy';
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
