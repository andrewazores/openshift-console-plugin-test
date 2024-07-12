import { of, Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { catchError, concatMap } from 'rxjs/operators';

export class ApiService {
  getTest(): Observable<string> {
    // TODO the backend URL must be configurable somehow
    // return fromFetch('http://localhost:9898/test', {
    return fromFetch('http://openshift-console-plugin-test-svc.plugin--openshift-console-plugin-test.svc:9898/test', {
      method: 'GET'
    }).pipe(
      concatMap((resp: Response) => resp.ok ? resp.text() : of(resp.statusText)),
      catchError(err => {
        console.error(err);
        return JSON.stringify(err);
      }),
    );
  }
}
