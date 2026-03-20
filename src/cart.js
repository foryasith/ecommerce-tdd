// src/cart.js (refactored)

class LineItem {
  constructor(product, quantity) {
    this.product  = product;
    this.quantity = quantity;
  }
  subtotal() {
    return this.product.price * this.quantity;
  }
}

class Cart {
  constructor(catalog, inventory = null) {
    this.catalog   = catalog;
    this.inventory = inventory;
    this.items     = {};
  }

  addItem(sku, quantity) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    const product = this.catalog.findBySku(sku);
    if (!product) {
      throw new Error('Product not found');
    }

    this._checkInventory(sku, quantity); // ← extracted

    if (this.items[sku]) {
      this.items[sku].quantity += quantity;
    } else {
      this.items[sku] = new LineItem(product, quantity);
    }
  }

  _checkInventory(sku, quantity) {
    if (!this.inventory) return; // no service = skip check
    const available = this.inventory.getAvailable(sku);
    if (quantity > available) {
      throw new Error('Insufficient inventory');
    }
  }

  removeItem(sku) {
    delete this.items[sku];
  }

  total() {
    return Object.values(this.items)
      .reduce((sum, item) => sum + item.subtotal(), 0);
  }
}

module.exports = { Cart, LineItem };