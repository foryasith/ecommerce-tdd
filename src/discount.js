// src/discount.js (refactored)

const bulkRule = (items) => {
  return items.reduce((discount, { product, quantity }) => {
    if (quantity >= 10) {
      discount += product.price * quantity * 0.10;
    }
    return discount;
  }, 0);
};

const orderRule = (items) => {
  const subtotal = items.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );
  return subtotal >= 1000 ? subtotal * 0.05 : 0;
};

class DiscountEngine {
  constructor(rules) {
    this.rules = rules;
  }

  apply(items) {
    return this.rules.reduce(
      (total, rule) => total + rule(items),
      0
    );
  }

  // ← NEW: returns the final price after all discounts
  getDiscountedTotal(items) {
    const subtotal = items.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    );
    return subtotal - this.apply(items);
  }
}

module.exports = { DiscountEngine, bulkRule, orderRule };