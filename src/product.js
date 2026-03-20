// src/product.js (refactored)
class Product {
  constructor(sku, name, price) {
    this._validate(sku, name, price);
    this.sku = sku;
    this.name = name;
    this.price = price;
  }

  _validate(sku, name, price) {
    if (!sku) throw new Error('SKU is required');
    if (!name) throw new Error('Name is required');
    if (price === undefined || price === null || price < 0) {
      throw new Error('Price must be non-negative');
    }
  }
}

module.exports = { Product };