import React from 'react';

import cookie from 'react-cookies';
import API from './API/API.js';

const ACCESS_TOKEN_EXPIRES = 60 * 60 * 24;

//const REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 7;

export default class Auth extends React.Component {
  // ################## Tokens and Cookies ##################
  static cookie(name) {
    return cookie.load(name) || { token: null, createdAt: null };
  }

  static accessToken = Auth.cookie('accessToken').token;
  static tokenType = 'Bearer';

  // additional options for cookies
  static cookieOptions() {
    let options = {
      domain: '', // TODO: Insert domain name
      secure: true,
      httpOnly: false,
    };

    if (typeof window !== 'undefined')
      if (window.location.host.indexOf('localhost') > -1) options = {};

    return options;
  }

  // set tokens cookies
  static setTokens(access, type) {
    // clean cookies
    Auth.accessToken = null;

    cookie.remove('accessToken', {
      path: '/',
      ...Auth.cookieOptions(),
    });

    // set cookies
    cookie.save(
      'accessToken',
      { token: access, createdAt: new Date() },
      {
        path: '/',
        maxAge: ACCESS_TOKEN_EXPIRES,
        ...Auth.cookieOptions(),
      }
    );

    Auth.accessToken = access;
    Auth.tokenType = type;
  }

  // clear tokens cookies
  static clearTokens() {
    if (Auth.refreshTimeout) {
      clearTimeout(Auth.refreshTimeout);
      Auth.refreshTimeout = null;
    }

    Auth.accessToken = null;
    Auth.refreshToken = null;

    cookie.remove('accessToken', {
      path: '/',
      ...Auth.cookieOptions(),
    });

    cookie.remove('refreshToken', {
      path: '/',
      ...Auth.cookieOptions(),
    });
  }

  // ################## Auth API ##################
  // All user data here
  static get isLogged() {
    // if already logged (accessToken cookie exists)
    if (!!Auth.accessToken) {
      return true;
    } else return false;
  }

  static userLoaded = false;
  static isUserLoading = false;
  static isRetrievingData = false;

  static user = {
    _data: null,
    set data(value) {
      window.sessionStorage.setItem('user', JSON.stringify(value));
      this._data = value;
    },
    get data() {
      if (this._data) return this._data;

      const user = window.sessionStorage.getItem('user');
      return !!user ? (this._data = JSON.parse(user)) : {};
    },

    defaults: { username: 'Utente', permissions: [], name: 'Nome', surname: 'Cognome' },
    get(field) {
      return this.data[field] || this.defaults[field] || null;
    },
  };

  static logout() {
    let request = API.post('/auth/logout');

    Auth.user.data = {};
    Auth.clearTokens();
    Auth.instance.setState({ logged: false });

    return request;
  }

  static isLogging = false;
  static login(username, password) {
    if (Auth.isLogging) return new Promise(() => {});
    Auth.isLogging = true;
    return new Promise((resolve, reject) => {
      API.post('/auth/login', {
        username: username,
        password: password,
      })
        .then((response) => {
          if (response.ok) {
            Auth.setTokens(response.token, response.type);
            Auth.instance.setState({ logged: true });
            Auth.retrieveUserData();
            if (resolve !== undefined) resolve(response);
          } else if (reject !== undefined) reject(response);
        })
        .catch((error) => {
          reject(error);
        })
        .then(() => {
          Auth.isLogging = false;
        });
    });
  }

  static retrieveUserData() {
    if (Auth.isRetrievingData) return;
    Auth.isRetrievingData = true;
    return API.get('/user/me', null, false, true)
      .then((response) => {
        Auth.user.data = response.user;
        Auth.instance.setState({ retrievedUserData: true });
      })
      .catch(() => Auth.logout())
      .then(() => (Auth.isRetrievingData = false));
  }

  // Component
  constructor(props) {
    super(props);
    Auth.instance = this;

    this.state = { logged: Auth.isLogged, retrievedUserData: false };
    if (Auth.isLogged) Auth.retrieveUserData();
  }

  componentDidMount() {
    Auth.mounted = true;
  }

  render() {
    return this.state.logged ? this.props.logged() : this.props.anonymous();
  }
}

window.logout = Auth.logout;
