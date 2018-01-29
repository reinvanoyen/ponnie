"use strict";

import ponnie from '../dist/lib/ponnie';

class TodoItem extends ponnie.Component {

  constructor() {
    super({
      isDone: false,
      id: 0,
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

  remove() {
    this.parent.removeItem(this.data.id);
  }

  render() {
    return (
      <div style={ this.data.isDone ? 'border: 4px solid green' : 'border: 4px solid red' }>
        <div>{this.data.title}<input p-ref="input" p-keyup={this.changeTitle} /></div>
        <input type="checkbox" p-ref="checkbox" p-change={this.check} />
        <button p-click={this.remove}>delete {this.data.id}</button>
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

    this.itemId = 0;
  }

  addItem( e ) {

    this.itemId++;

    this.data.items.push({
      id: this.itemId,
      title: this.refs.input.value
    });
    this.update();

    e.preventDefault();
  }

  removeItem( id ) {

    let items = this.data.items.filter( item => item.id !== id );
    this.update( { items: items } );
  }

  render() {
    return (
      <div>
        <h1>{this.data.title}</h1>
        <div>
          {this.data.items.map(item => {
            return <todo-item p-key={item.id} id={item.id} title={item.title} />
          })}
        </div>
        <form p-submit={this.addItem} action="">
          <input p-ref="input" />
        </form>
      </div>
    );
  }
}

ponnie.register('todo-item', TodoItem);

let todo = new TodoList();
todo.mount(document.body);