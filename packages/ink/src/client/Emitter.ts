//common
import type { InkBrowserEvent } from '../types';
//local
import type ClientComponent from './Component';
import ClientRegistry from './Registry';
import ClientElement from './Element';

//how binders should look like
export type AttributeBinder = (element: ClientElement) => void;

//all browser events
export const events = [
  //Mouse Events
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseover',
  'mouseout',
  'wheel',
  //Keyboard Events
  'keydown',
  'keypress',
  'keyup',
  //Form Events
  'blur',
  'change',
  'contextmenu',
  'focus',
  'input',
  'submit',
  'invalid',
  'reset',
  'search',
  'select',
  //Clipboard Events
  'copy',
  'cut',
  'paste',
  //Drag Events
  'drag',
  'dragstart',
  'dragend',
  'dragover',
  'dragenter',
  'dragleave',
  'drop',
  'scroll',
  //Media Events
  'durationchange',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
  //Animation Events
  'animationstart',
  'animationend',
  'animationiteration',
  //Transition Events
  'transitionend',
  //Misc Events
  'toggle'
];

/**
 * Browser version of Node's EventEmitter
 */
export class ClientEmitter extends EventTarget {
  /**
   * Emits an event
   */
  emit<T = any>(event: string, target?: T) {
    this.dispatchEvent(new CustomEvent<T>(event, { detail: target }));
    return this;
  }

  /**
   * Listens for an event
   */
  on(event: string, callback: EventListener) {
    if (event === 'ready') {
      // see if DOM is already available
      if (document.readyState !== 'loading') {
        const event = new CustomEvent<undefined>('ready');
        // call on next available tick
        setTimeout(() => callback(event), 1);
        return this;
      }
    }
    this.addEventListener(event, callback);
    return this;
  }

  /**
   * Listens for an event once
   */
  once(event: string, callback: EventListener) {
    const unbinder: EventListener = e => {
      this.unbind(event, unbinder);
      callback(e);
    };
    this.on(event, unbinder);
    return this;
  }

  /**
   * Unbinds an event
   */
  unbind(event: string, callback: EventListener) {
    this.removeEventListener(event, callback);
    return this;
  }
}

//helper that returns all child elements with the attribute name
export const match = (
  element: Element|ShadowRoot, 
  attribute: string, 
  bind = true
) => {
  //get all child elements
  return Array.from(element.querySelectorAll('*')).filter(
    //filter by elements has the attribute
    (element: Element) => {
      //get the node
      const node = ClientRegistry.get(element);
      const matched = node 
        && node.hasAttribute(attribute)
        && (!bind || !node.hasEvent(attribute));
      if (matched) {
        node.addEvent(attribute);
      }
      //return if the node has the attribute
      return matched;
    }
  //map the elements to InkElement (this is what to return)
  ).map(element => ClientRegistry.get(element)) as ClientElement[];
};

//bind an attribute to a binder
export function bindAttribute(name: string, bind: AttributeBinder) {
  emitter.on('mounted', (e: InkBrowserEvent<ClientComponent>) => {
    //if there is no detail, return
    if (!e.detail) return;
    //get the element
    const element = e.detail;
    //this is called for every listener, 
    //there will be a lot of listeners...
    match(element.shadowRoot || element, name).forEach(bind);
  });
}

//unbind an attribute to a binder
export function unbindAttribute(name: string, bind: AttributeBinder) {
  emitter.on('unmounted', (e: InkBrowserEvent<ClientComponent>) => {
    //if there is no detail, return
    if (!e.detail) return;
    //get the element
    const element = e.detail;
    //this is called for every listener, 
    //there will be a lot of listeners...
    match(element.shadowRoot || element, name, false).forEach(bind);
  });
}

//make a singleton
const emitter = new ClientEmitter();

//initializer
export default (() => {
  //wait for native ready event
  document.onreadystatechange = () => {
    if (document.readyState !== 'loading') {
      //pass ready to emitter
      emitter.emit('ready');
    }
  };

  //ex. <div mount=callback>Hello World</div>
  bindAttribute('mount', element => {
    const callback = element.getAttribute('mount');
    if (typeof callback === 'function') {
      const event = new CustomEvent('mount', { 
        detail: {
          node: element,
          target: element.element
        }
      });
      callback(event);
    }
  });

  //ex. <div unmount=callback>Hello World</div>
  unbindAttribute('unmount', element => {
    const callback = element.getAttribute('unmount');
    if (typeof callback === 'function') {
      const event = new CustomEvent('unmount', { 
        detail: {
          node: element,
          target: element.element
        }
      });
      callback(event);
    }
  });

  //ex. <div if={count > 0}>Hello World</div>
  bindAttribute('if', element => {
    const condition = element.getAttribute('if');
    if (condition === false || condition === 'false') {
      element.element.remove();
    } else if (typeof condition === 'function' && !condition()) {
      element.element.remove();
    }
  });

  //bind all browser events
  events.forEach(event => {
    bindAttribute(event, element => {
      const callback = element.getAttribute(event);
      if (typeof callback === 'function') {
        element.element.removeEventListener(event, callback);
        element.element.addEventListener(event, callback);
      }
    });
    unbindAttribute(event, element => {
      const callback = element.getAttribute(event);
      if (typeof callback === 'function') {
        element.element.removeEventListener(event, callback);
      }
    });
  });

  return emitter;
})();