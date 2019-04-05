import wretch from 'wretch';

export default class BaseService {
  //TODO: Convert to Config entry
  protected _baseUrl = wretch('http://localhost:8080/api/v1/');
}
