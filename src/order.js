// src/order.js (refactored)

class Order {
  constructor({ id, items, total, createdAt }) {
    this.id        = id;
    this.items     = items;
    this.total     = total;
    this.createdAt = createdAt;
  }
}

class OrderRepo {
  constructor() {
    this.orders  = {};
    this._nextId = 1; // ID lives here, not in Checkout
  }

  save(order) {
    // Auto-assign ID if not set
    if (!order.id) {
      order.id = this._nextId++;
    }
    this.orders[order.id] = order;
  }

  findById(id) {
    return this.orders[id] || null;
  }

  findAll() {
    return Object.values(this.orders);
  }

  clear() {
    this.orders  = {};
    this._nextId = 1;
  }
}

module.exports = { Order, OrderRepo };