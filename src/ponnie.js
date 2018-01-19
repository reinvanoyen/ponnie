"use strict";

import h from "./h";
import Component from "./component";

const ponnie = {
  Component: Component,
  h: h
};

ponnie.register = (component) => {
  console.log(component);
};

export default ponnie;