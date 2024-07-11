import { Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { concatMap } from 'rxjs/operators';

export class ApiService {
    getTest(): Observable<string> {
        return fromFetch('http://localhost:9898/test', {
            method: 'GET'
        }).pipe(concatMap((resp: Response) => resp.text()));
    }
}
