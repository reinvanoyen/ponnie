"use strict";

import ponnie from '../dist/lib/ponnie';

class Example extends ponnie.Component {

  constructor() {
    super({
      text: 'ok'
    });
  }

  changeText() {
    this.update({text: this.refs.input.value});
  }

  render() {
    return (
        <div>
          <div>{this.data.text}</div>
          <input p-change={this.changeText} p-ref="input" />
        </div>
    );
  }
}

let example = new Example();
example.mount(document.body);