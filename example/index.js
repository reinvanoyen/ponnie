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
    this.update( {
      title: this.refs.input.value
    } );
  }

  check() {
    this.update({
      isDone: this.refs.checkbox.checked
    });

    if(this.data.isDone) {
      this.trigger( 'done', {
        id: this.data.id,
        title: this.data.title
      } );
    }
  }

  remove() {
    this.parent.removeItem(this.data.id);
  }

  render() {
    return (
        <div class="todo-item" style={ this.data.isDone ? 'border: 4px solid green' : 'border: 4px solid red' }>
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

    this.data.items.push( {
      id: this.itemId,
      title: this.refs.input.value
    } );

    this.update();

    e.preventDefault();
  }

  removeItem(id) {

    let items = this.data.items.filter( item => item.id !== id );
    this.update({
      items: items
    });
  }

  completedItem(e) {
    console.log( e );
  }

  render() {

    let contents = <div p-key="empty"></div>;

    if( this.data.items.length ) {

      contents = (
        <div p-key="notempty">
          <div>Todo count: {this.data.items.length}</div>
          <div class="todo-index">
            {this.data.items.map(item => {
              return <todo-item p-key={item.id} id={item.id} title={item.title} p-done={this.completedItem} />;
            })}
          </div>
        </div>
      );
    }

    return (
        <div>
          <h1>{this.data.title}</h1>
          {contents}
          <form p-submit={this.addItem} action="">
            <input p-ref="input" />
          </form>
        </div>
    );
  }
}

ponnie.register('todo-item', TodoItem);

class Confirm extends ponnie.Component {

  constructor( text = 'Are you sure?', confirmButtonText = 'Ok', cancelButtonText = 'Cancel' ) {

    super({
      text: text,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      isOpen: false,
      currentItemTitle: '',
      items: []
    });

    ponnie.mount(this, document.body);
    this.open();
  }

  open() {
    this.update({
      isOpen: true
    });
  }

  close() {
    this.update({
      isOpen: false
    });
  }

  confirm() {
    this.trigger('confirm');
    this.close();
  }

  cancel() {
    this.trigger('cancel');
    this.close();
  }

  render() {

    if (!this.data.isOpen) {
      return;
    }

    return (
      <div class="confirm-wrap">
        <div class="confirm">
          <div class="confirm-text">{this.data.text}</div>
          <div class="confirm-footer">
            <button class="btn-confirm-confirm" p-click={this.confirm}>{this.data.confirmButtonText}</button>
            <button class="btn-confirm-cancel" p-click={this.cancel}>{this.data.cancelButtonText}</button>
          </div>
        </div>
      </div>
    );
  }
}

class PromoCodeWidget extends ponnie.Component {

  constructor() {
    super({
      promocode: null
    });
  }

  validate( e ) {

    this.update({
      promocode: this.refs.input.value
    });

    this.trigger('change', {
      promocode: this.refs.input.value
    });

    e.preventDefault();
  }

  removePromocode() {

    let confirm = new Confirm('Remove?');

    confirm.on('confirm', e => {
      this.update({
        promocode: null
      });
    });
  }

  render() {

    if (this.data.promocode) {
      return (
        <div class="gift-code">
          <div class="gift-code-title">Gift code:</div>
          <div class="gift-code-active">
            <div>{this.data.promocode}</div>
            <button class="gift-code-remove-btn" p-click={this.removePromocode}>Remove</button>
          </div>
        </div>
      );
    }

    return (
      <div class="gift-code">
        <div class="gift-code-title">Gift code:</div>
        <div class="gift-code-input">
          <form p-submit={this.validate}>
            <input type="text" p-ref="input" />
          </form>
        </div>
      </div>
    );
  }
}

class Cart extends ponnie.Component {

  constructor() {
    super({
      changes: [],
      promocode: 'nice'
    });
  }

  promocodeChanged(e) {
    this.data.changes.push(e.promocode);
    this.update({
      promocode: e.promocode
    });
  }

  render() {
    return (
      <div>
        {this.data.changes.map(change => {
          return <div>{change}</div>;
        })}
        <promo-code-widget promocode={this.data.promocode} p-change={this.promocodeChanged} />
      </div>
    );
  }
}

ponnie.register('promo-code-widget', PromoCodeWidget);

let cart = new Cart();
ponnie.mount(cart, document.body);

let list = new TodoList();
ponnie.mount(list, document.body);