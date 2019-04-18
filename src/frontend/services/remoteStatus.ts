import BaseService from './base';

class RemoteStatusService extends BaseService {
  getServerStatus() {
    return this._baseUrl
      .url('remoteStatus')
      .get()
      .json();
  }
}

export default new RemoteStatusService();
