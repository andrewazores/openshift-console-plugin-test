import { from, of, Observable } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export class ApiService {
  getTest(): Observable<string> {
    // TODO the backend URL must be configurable somehow, or we can reconstruct it using
    // an assumed <svc-name>-<plugin-namespace> and the current document location (ie console URL)?
    return from(
      consoleFetch('http://cryostat-svc-plugin--cryostat.apps-crc.testing/test', {
        method: 'GET'
      })).pipe(
        concatMap((resp: Response) => resp.ok ? resp.text() : of(resp.statusText)),
        catchError(err => {
          console.error(err);
          return JSON.stringify(err);
        }),
      );
  }
}
