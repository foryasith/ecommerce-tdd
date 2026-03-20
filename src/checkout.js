// src/checkout.js (updated)
const { Order } = require('./order');

let nextId = 1; // simple incrementing ID

class Checkout {
  constructor(paymentGateway, orderRepo = null, discountEngine = null) {
    this.paymentGateway = paymentGateway;
    this.orderRepo      = orderRepo;
    this.discountEngine = discountEngine;
  }

  async process(cart, token) {
    // Step 1 — validate
    const validationError = this._validate(cart);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Step 2 — compute total
    const total = this._computeTotal(cart);

    // Step 3 — charge
    return await this._charge(cart, total, token); // pass cart too now
  }

  _validate(cart) {
    if (Object.keys(cart.items).length === 0) {
      return 'Cart is empty';
    }
    return null;
  }

  _computeTotal(cart) {
    if (this.discountEngine) {
      const items = Object.values(cart.items);
      return this.discountEngine.getDiscountedTotal(items);
    }
    return cart.total();
  }

  async _charge(cart, total, token) {
    try {
      await this.paymentGateway.charge(total, token);

      // ── NEW: build and save order on success ──
      const order = new Order({
        id:        nextId++,
        items:     cart.items,
        total,
        createdAt: new Date()
      });

      if (this.orderRepo) {
        this.orderRepo.save(order);
      }

      return { success: true, total, order };

    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = { Checkout };