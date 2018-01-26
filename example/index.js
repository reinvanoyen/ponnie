"use strict";

import ponnie from '../dist/lib/ponnie';

class TodoItem extends ponnie.Component {

  constructor() {
    super({
      isDone: false,
      title: 'Unknown item'
    });
  }

  changeTitle() {
    this.update({
      title: this.refs.input.value
    })
  }

  check() {
    this.update({
      isDone: this.refs.checkbox.checked
    });
  }

  render() {
    return (
      <div style={ this.data.isDone ? 'border: 1px solid green' : 'border: 1px solid red' }>
        <div>{this.data.title}<input p-ref="input" p-keyup={this.changeTitle} /></div>
        <input type="checkbox" p-ref="checkbox" p-change={this.check} />
      </div>
    );
  }
}

class TodoList extends ponnie.Component {

  constructor() {
    super({
      title: 'Todo\'s',
      items: []
    });
  }

  addItem() {
    this.data.items.push({
      title: this.refs.input.value
    });
    this.update();
  }

  render() {
    return (
      <div>
        <h1>{this.data.title}</h1>
        {this.data.items.map(item => {
          return <todo-item title={item.title} isDone={true} />
        })}
        <form p-submit={this.addItem}>
          <input p-ref="input" />
        </form>
      </div>
    );
  }
}

ponnie.register('todo-item', TodoItem);

let todo = new TodoList();
todo.mount(document.body);