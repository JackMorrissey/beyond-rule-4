import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable()
export class YnabConnectService {

  constructor() { }

  authorize() {
    const uri =
    // tslint:disable-next-line:max-line-length
    `https://app.youneedabudget.com/oauth/authorize?client_id=${environment.clientId}&redirect_uri=${environment.redirectUri}&response_type=token`;
    location.replace(uri);
  }

  getToken() {
    return sessionStorage.getItem('ynab_access_token');
  }

  clearToken() {
    sessionStorage.removeItem('ynab_access_token');
  }

  isAuthorized() {
    return !!this.getToken();
  }

  findYnabToken() {
    let token = null;
    const search = window.location.hash.substring(1).replace(/&/g, '","').replace(/=/g, '":"');
    if (search && search !== '') {
      // Try to get access_token from the hash returned by OAuth
      const params = JSON.parse('{"' + search + '"}', function(key, value) {
        return key === '' ? value : decodeURIComponent(value);
      });
      token = params.access_token;
      sessionStorage.setItem('ynab_access_token', token);
      window.location.hash = '';
      return true;
    }
    return this.isAuthorized();
  }
}
