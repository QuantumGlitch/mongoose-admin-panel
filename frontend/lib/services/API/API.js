function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import axios from 'axios';
import Auth from '../Auth';
import Messages from '../Messages';
import Loader from './Loader';
export default class API {
  //Cache object: requests can be stored
  // return absolute URL to API's resource
  static url(url) {
    if (url.indexOf('://') > -1) return url;
    return `${API.BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  } // basic headers for requests (with authorization)


  static headers() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(Auth.isLogged ? {
        Authorization: `Bearer ${Auth.accessToken}`
      } : {})
    };
  } // request by GET


  static get(url, parameters = null, cacheEnabled = true, loader = true, rawResponse = false) {
    return new Promise((resolve, reject) => {
      let cacheId = `get:${url}`;

      if (cacheEnabled) {
        //if request is already in cache
        if (API.Cache.exists(cacheId)) //supply to resolve function
          return API.Cache.supply(cacheId, resolve); //this request is loading in cache

        API.Cache.loading(cacheId);
      }

      if (loader) Loader.show();
      axios.create({
        baseURL: API.BASE_URL,
        headers: API.headers()
      }).get(API.url(url), parameters).then(function (response) {
        if (cacheEnabled) //set in cache request
          API.Cache.set(cacheId, response);
        if (resolve) resolve(rawResponse ? response : response.data);
      }).catch(function (error) {
        if (cacheEnabled) //if request throws error, remove from cache
          API.Cache.delete(cacheId);
        console.warn('API -> get -> catch on promise', error);
        if (reject) reject(error);
      }).then(() => {
        if (loader) Loader.hide();
      });
    });
  } // request by POST


  static post(url, parameters = null, cacheEnabled = false, loader = true, rawResponse = false) {
    // Cache disabled for post request (because they start just on user's action)
    return new Promise((resolve, reject) => {
      // let cacheId = 'post:'+url;
      // //if request is already in cache
      // if(API.Cache.exists(cacheId))
      //     //supply to resolve function
      //     return API.Cache.supply(cacheId, resolve);
      // //this request is loading in cache
      // API.Cache.loading(cacheId);
      if (loader) Loader.show();
      axios.create({
        baseURL: API.BASE_URL,
        headers: API.headers()
      }).post(API.url(url), parameters).then(function (response) {
        //set in cache request
        //API.Cache.set(cacheId, response.data);
        if (resolve) resolve(rawResponse ? response : response.data);
      }).catch(function (error) {
        //if request throws error, remove from cache
        //API.Cache.delete(cacheId);
        console.warn('API -> post -> catch on promise', error);
        if (reject) reject(error);
      }).then(() => {
        if (loader) Loader.hide();
      });
    });
  } // general request


  static create(url, method, parameters = null, cacheEnabled = true, errorHandled, rawResponse = false) {
    return new Promise((resolve, reject) => {
      let req = method === 'post' ? API.post(url, parameters, cacheEnabled, true, true) : API.get(url, parameters, cacheEnabled, true, true); // errorHandled = true: manage errors with Messages' dialogs

      if (errorHandled) req.then(response => {
        if (response.data.ok) {
          if (resolve) resolve(rawResponse ? response : response.data);
        } else {
          Messages.error({
            error: API.error(response)
          });
          if (reject) reject(response);
        }
      }).catch(error => {
        Messages.error({
          error: error.message || error
        });
        if (reject) reject(error);
      }); //normal request
      else req.then(response => {
          if (response.data.ok) resolve(rawResponse ? response : response.data);else reject(response);
        }).catch(reject);
    });
  } // request for uploading file


  static fileUpload(url, field, file) {
    var formData = new FormData();
    formData.append(field, file);
    let headers = API.headers();
    headers['Content-Type'] = 'multipart/form-data';
    return new Promise((resolve, reject) => {
      axios.post(API.url(url), formData, {
        headers: headers
      }).then(response => {
        if (resolve) resolve(response.data);
      }).catch(error => {
        console.warn('API -> fileUpload -> catch on promise', error);
        if (reject) reject(error);
      });
    });
  } // request for uploading multiple files


  static multipleFilesUpload(url, field, files) {
    var formData = new FormData();
    let c = 0;

    for (let file of files) formData.append(field + '_' + c++, file);

    let headers = API.headers();
    headers['Content-Type'] = 'multipart/form-data';
    Loader.show();
    return new Promise((resolve, reject) => {
      axios.post(API.url(url), formData, {
        headers: headers
      }).then(response => {
        if (resolve) resolve(response.data);
      }).catch(error => {
        console.warn('API -> multipleFilesUpload -> catch on promise', error);
        if (reject) reject(error);
      }).then(() => Loader.hide());
    });
  } // extract error message from a generic error object (that could be an api response or an exception) originated from an api's request


  static error(error) {
    console.warn('API Error: ', error);
    if (typeof error === 'string') return error;else if (error.message) return error.message;else for (var x in error) if (typeof error[x] === 'string') return error[x];
    return 'Unknown Error';
  }

}

_defineProperty(API, "BASE_URL", null);

_defineProperty(API, "Cache", {
  //every same request repeated between 0 - DELTA_TIME milliseconds will be taken from cache
  DELTA_TIME: 1000,
  MAX_ENTRIES: 10,
  data: [],

  exists(id) {
    let entry;

    if (entry = API.Cache.data[id]) {
      //if request is recent then it exists
      if (new Date() - entry.time < API.Cache.DELTA_TIME) {
        console.warn('API CACHE: asking for request in cache', id);
        return true;
      } else {
        //delete old entry
        API.Cache.delete(id);
        return false;
      }
    } else return false;
  },

  supply(id, resolve) {
    if (API.Cache.get(id) === 1) {
      //cache's entry is still loading
      API.Cache.loading(id); //update request time

      let interval = setInterval(() => {
        let entry;

        if (entry = API.Cache.get(id)) {
          if (entry !== 1) resolve(entry);
        } else clearInterval(interval);
      }, 100);
    } else resolve(API.Cache.get(id));
  },

  get(id) {
    return API.Cache.data[id] ? API.Cache.data[id].value : null;
  },

  set(id, value) {
    if (API.Cache.data.length > API.Cache.MAX_ENTRIES) API.Cache.data.splice(0, 1);
    API.Cache.data[id] = {
      value: value,
      time: new Date()
    };
  },

  loading(id) {
    API.Cache.set(id, 1);
  },

  delete(id) {
    delete API.Cache.data[id];
  }

});