class Catalog {
  constructor() {
    this.products = {};
  }

  add(product) {
    this.products[product.sku] = product;
  }

  findBySku(sku) {
    return this.products[sku] || null;
  }
}

module.exports = { Catalog };