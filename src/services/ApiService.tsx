import { of, Observable } from 'rxjs';

export class ApiService {
    getTest(): Observable<string> {
        return of('Hello from the ApiService');
    }
}
