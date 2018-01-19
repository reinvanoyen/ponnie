"use strict";

import ponnie from "./src/ponnie";

class Example extends ponnie.Component {

  constructor() {
    super();

    console.log( 'component example!' );
  }

  render() {

    return (
        <div class="window"></div>
    );
  }
}

export default Example;

let example = new Example();
example.refresh();

console.log( 'bootstrapped' );

// Enable root element
//document.querySelector('x-root').enable();