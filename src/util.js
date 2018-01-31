"use strict";

const util = {
  isRefAttribute(name) {
    return (name === 'p-ref');
  },
  isEventAttribute(name) {
    return ( name !== 'p-key' && /^p-/.test(name) );
  },
  getEventNameFromAttribute(name) {
    return name.slice(2).toLowerCase();
  }
};

export default util;