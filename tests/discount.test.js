const { DiscountEngine, bulkRule, orderRule } = require('../src/discount');

// ── Test each rule in isolation first ──────────────────────────────────────

describe('bulkRule', () => {

  test('applies 10% discount when quantity >= 10', () => {
    const items = [{ product: { price: 100 }, quantity: 10 }];
    // 10 x 100 = 1000, 10% of 1000 = 100
    expect(bulkRule(items)).toBe(100);
  });

  test('no discount when quantity < 10', () => {
    const items = [{ product: { price: 100 }, quantity: 9 }];
    expect(bulkRule(items)).toBe(0);
  });

  test('applies bulk discount only to qualifying line items', () => {
    const items = [
      { product: { price: 100 }, quantity: 10 }, // qualifies → 100 off
      { product: { price: 200 }, quantity: 3  }, // does not  → 0 off
    ];
    expect(bulkRule(items)).toBe(100);
  });

});

describe('orderRule', () => {

  test('applies 5% discount when cart total >= 1000', () => {
    const items = [{ product: { price: 200 }, quantity: 6 }];
    // total = 1200, 5% of 1200 = 60
    expect(orderRule(items)).toBe(60);
  });

  test('no discount when cart total < 1000', () => {
    const items = [{ product: { price: 100 }, quantity: 5 }];
    // total = 500 — does not qualify
    expect(orderRule(items)).toBe(0);
  });

});

// ── Test the engine that combines rules ────────────────────────────────────

describe('DiscountEngine', () => {

  test('returns 0 when no rules apply', () => {
    const items = [{ product: { price: 50 }, quantity: 2 }];
    const engine = new DiscountEngine([bulkRule, orderRule]);
    expect(engine.apply(items)).toBe(0);
  });

  test('sums discounts from multiple rules', () => {
    // qty=10 qualifies for bulk AND total=2000 qualifies for order
    const items = [{ product: { price: 200 }, quantity: 10 }];
    // bulk:  10% of 2000 = 200
    // order: 5%  of 2000 = 100
    // total discount = 300
    const engine = new DiscountEngine([bulkRule, orderRule]);
    expect(engine.apply(items)).toBe(300);
  });

  test('works with zero rules', () => {
    const items = [{ product: { price: 100 }, quantity: 5 }];
    const engine = new DiscountEngine([]);
    expect(engine.apply(items)).toBe(0);
  });

  test('works with a custom rule injected', () => {
    // A brand new rule — 50% off everything (e.g. flash sale)
    const flashSaleRule = (items) =>
      items.reduce((d, { product, quantity }) =>
        d + product.price * quantity * 0.5, 0);

    const items = [{ product: { price: 100 }, quantity: 2 }];
    const engine = new DiscountEngine([flashSaleRule]);
    expect(engine.apply(items)).toBe(100); // 50% of 200
  });

});

test('getDiscountedTotal returns subtotal minus all discounts', () => {
    // 10 x $200 = $2000 subtotal
    // bulk:  10% of 2000 = 200
    // order: 5%  of 2000 = 100
    // final = 2000 - 300 = 1700
    const items = [{ product: { price: 200 }, quantity: 10 }];
    const engine = new DiscountEngine([bulkRule, orderRule]);
    expect(engine.getDiscountedTotal(items)).toBe(1700);
  });