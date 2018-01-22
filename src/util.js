"use strict";

const util = {
  isRefAttribute(name) {
    return (name === 'ref');
  },
  isEventAttribute(name) {

    return /^on/.test(name);
  },
  getEventNameFromAttribute(name) {

    return name.slice(2).toLowerCase();
  }
};

export default util;