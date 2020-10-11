const assert = require('assert');
const deepEqual = require('fast-deep-equal');
const Cacheman = require('cacheman');
const { EventEmitter } = require('events');

const ComponentError = require('../errors/ComponentError');

const { Auth } = require('../../services/auth');
const { Ɂ } = require('../../utilities/global');

// Global cache for components
const componentCache = new Cacheman('Component');

/**
 * This will be used for synchronize components
 *
 * The interceptor function will be used for replacing the
 * Promise generator function of all components.
 * After that we just count the number of promises executed and resolved.
 *
 * Ex:
 * After a component's load trigger another component's load
 * this class will assure that all the load requests have been completed
 */
class Synchronizer {
  constructor() {
    this.expectedCount = 0;
    this.count = 0;
    this.resolvers = [];
    this.rejecters = [];
  }

  clear() {
    this.resolvers = [];
    this.rejecters = [];
  }

  /**
   * @param {Component} component
   * @param {Function} event
   */
  getInterceptor(component, event) {
    const oldEvent = event.bind(component);

    return (...args) => {
      return this.interceptor(oldEvent(...args));
    };
  }

  /**
   * @param {Promise} promise
   */
  interceptor(promise) {
    ++this.expectedCount;

    promise
      // After that
      .then(() => {
        if (++this.count == this.expectedCount) {
          this.resolvers.forEach((r) => r());
          this.clear();
        }
      })
      // If we get an error we need to propagate it
      .catch((error) => {
        this.rejecters.forEach((r) => r(error));
        this.clear();
      });

    return promise;
  }

  waiter() {
    return new Promise((resolve, reject) => {
      this.resolvers.push(resolve);
      this.rejecters.push(reject);
    });
  }
}

/**
 * This is the base class for handling logics server-side,
 * interacting with the corrispective client-side component
 */
class Component {
  /**
   * @param {Auth} {auth} Components work differently based on user's info
   * @param {Boolean} {initialization} Is this the first time the form has been instantiated ?
   */
  constructor({ auth = null, initialization = false } = {}) {
    /**
     * @type {Auth}
     */
    this.auth = auth;

    /**
     * @type {Boolean}
     */
    this.initialization = initialization;

    this.errors = [];

    // So the client-side can understand connections among components
    this.refId = require('crypto').randomBytes(24).toString('hex');

    this._children = [];
    this._parent = null;

    // This will be used for coordinating the communications between components
    this.events = new EventEmitter();

    /**
     * @type {Synchronizer}
     */
    this.synchronizer = null;
  }

  //#region Base
  /**
   * @returns {Component}
   */
  get parent() {
    return this._parent;
  }
  set parent(value) {
    this._parent = value;
  }

  /**
   * @returns {Component[]}
   */
  get children() {
    return this._children;
  }

  set children(array) {
    array.forEach((v) => (v.parent = this));
    this._children = array;
  }

  /**
   * @param {Component} child
   */
  addChild(child) {
    child.parent = this;
    this._children.push(child);
  }

  getInheritancePath() {
    const path = [];

    let lastProto = this;
    while ((lastProto = Object.getPrototypeOf(lastProto))) path.unshift(lastProto.constructor.name);

    // Remove Object and Component
    path.shift();
    path.shift();

    return path;
  }
  //#endregion

  //#region Life Cycle

  // This is the first step of the life cycle
  // The root component will be called without it
  sync(synchronizer) {
    this.synchronizer = synchronizer || new Synchronizer();

    // Pass the synchronizer to all child
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      // The synchronizer will be used for ensuring that
      // All load calls have stopped
      child.load = this.synchronizer.getInterceptor(child, child.load);
      // All execute calls have stopped
      child.execute = this.synchronizer.getInterceptor(child, child.execute);

      child.sync(this.synchronizer);
    }
  }

  /**
   * Convert client-side Object to internal configuration for component
   * @param config {Object}
   */
  async parse(config) {
    assert(config.id, `Can't parse component's configuration, 'id' is missing.`);
    this.refId = config.id;

    if (this.children.length > 0) {
      assert(config.children, `Can't parse component's configuration, 'children' is missing.`);
      assert(
        config.children.length === this.children.length,
        `Can't parse component's configuration, 'children.length' doesn't match.`
      );

      for (let i = 0; i < this.children.length; i++)
        await this.children[i].parse(config.children[i]);
    }
  }

  /**
   * Load this component
   */
  async load() {
    // Launch all children's loads
    this.children.forEach((c) => c.load());
  }

  /**
   * After loading evaluate the execution of actions
   * @param config {Object}
   */
  async execute() {
    // Launch all children's execute
    this.children.forEach((c) => c.execute());
  }

  /**
   * Transform to an object readable for client-side that will be converted to JSON
   * @returns {Object}
   */
  async serialize() {
    return {
      id: this.refId,
      classPath: this.getInheritancePath(),
      errors: this.errors,
      children:
        this.children.length > 0 ? await Promise.all(this.children.map((c) => c.serialize())) : [],
    };
  }
  //#endregion

  //#region Syncronization
  /**
   * Return a promise that is resolved when all the component's events
   * have been triggered. Then every listener is removed.
   * @param {Object[]} options
   * @param {Component} options[].component
   * @param {String} options[].event
   * @returns {Promise}
   */
  static waitEvents(options) {
    return Promise.all(options.map(({ component, event }) => component.waitEvent(event)));
  }

  /**
   * Return a promise that is resolved when the component's event
   * has been triggered. Once is triggered the listener is removed.
   * This can be used once for listening to an event.
   * @param {String} event
   */
  waitEvent(event) {
    return new Promise((resolve) => {
      const callback = (...args) => {
        // Resolve can be called once
        this.events.removeListener(event, callback);
        resolve(...args);
      };

      this.events.addListener(event, callback);
    });
  }

  /**
   * Everytime the event on the component occurs, execute the async callback
   * and wait for his ending for proceeding with the next life cycle (through synchronizer)
   * @param {String} event
   * @param {Function<Promise>} callback
   */
  onEvent(event, callback) {
    this.events.addListener(event, (...args) => {
      this.synchronizer.interceptor(callback(...args));
    });
  }

  /**
   * Emit an event for this component.
   * @param {String} event
   * @param {Component} sender The sender by default is this component
   */
  emitEvent(event, sender = this, ...args) {
    this.events.emit(event, sender, ...args);
  }
  //#endregion

  //#region Errors

  /**
   * This function will be used for error handling
   * Test condition, if it fails save the error in this.errors and rethrow the exception
   */
  assert(condition, error) {
    assert(condition, new ComponentError(error));
  }

  /**
   * @typedef {Object} ErrorTypeFormatter
   * @prop {Object} type
   * @prop {Function} formatter
   */

  /**
   * Try execute the function,
   * if a componentError occurs or an error instance of one type of 'errorTypes'
   * then save in this.errors ( do not rethrow )
   * else rethrow
   * @param {Function} fn
   * @param {Array<ErrorTypeFormatter|Object>} errorTypes
   */
  async try(fn, errorTypes) {
    try {
      await fn();
    } catch (e) {
      if (e instanceof ComponentError) return this.errors.push(e.message);

      if (errorTypes && errorTypes.length > 0)
        for (const errorType of errorTypes) {
          const type = errorType.type || errorType;
          if (e instanceof type)
            return this.errors.push(errorType.message ? errorType.message(e) : e.message);
        }

      throw e;
    }
  }

  //#endregion

  /**
   * Component's cache
   */
  cache = new (class {
    /**
     * @param {Component} parent
     */
    constructor(parent) {
      this.parent = parent;
    }

    async set(key, value, ttl) {
      await new Promise((resolve, reject) =>
        componentCache.set(this.parent.refId + '.' + key, value, ttl, (err, val) => {
          if (err) reject(err);
          else resolve(val);
        })
      );
    }

    async get(key) {
      await new Promise((resolve, reject) =>
        componentCache.get(this.parent.refId + '.' + key, (err, val) => {
          if (err) reject(err);
          else resolve(val);
        })
      );
    }

    /**
     * Get the cached value only if the cached props are the same
     * @param {String} key
     * @param {any} newProps
     */
    async getByProps(key, newProps) {
      const cachedValue = await this.get(key);

      if (Ɂ(cachedValue)) return null;
      else {
        const { props, value } = cachedValue;

        // Same props, same result
        if (deepEqual(props, newProps)) return value;

        return null;
      }
    }

    /**
     * Set a 'value' in cache that is deeply dependent to 'props'
     * @param {String} key
     * @param {any} props
     * @param {any} value
     */
    async setWithProps(key, props, value, ttl) {
      await this.set(key, { value, props }, ttl);
    }
  })(this);
}

module.exports = Component;
