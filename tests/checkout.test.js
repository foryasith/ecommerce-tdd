const { Checkout } = require('../src/checkout');
const { DiscountEngine, bulkRule, orderRule } = require('../src/discount');

describe('Checkout', () => {

  let gateway, cart, checkout;

  beforeEach(() => {
    // Fake payment gateway — just a mock object
    gateway = { charge: jest.fn() };

    // Fake cart with controlled items and total
    cart = {
      items: {
        A: { product: { price: 100 }, quantity: 2 }
      },
      total: jest.fn().mockReturnValue(200)
    };

    checkout = new Checkout(gateway);
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  test('returns success when payment goes through', async () => {
    gateway.charge.mockResolvedValue({ transactionId: 'txn_001' });

    const result = await checkout.process(cart, 'tok_valid');

    expect(result.success).toBe(true);
    expect(result.total).toBe(200);
  });

  test('calls gateway.charge with correct amount and token', async () => {
    gateway.charge.mockResolvedValue({});

    await checkout.process(cart, 'tok_abc');

    expect(gateway.charge).toHaveBeenCalledWith(200, 'tok_abc');
  });

  // ── Sad path ────────────────────────────────────────────────────────────

  test('returns failure when payment is declined', async () => {
    gateway.charge.mockRejectedValue(new Error('Card declined'));

    const result = await checkout.process(cart, 'tok_bad');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Card declined');
  });

  test('does not create an order when payment fails', async () => {
    gateway.charge.mockRejectedValue(new Error('Insufficient funds'));

    const result = await checkout.process(cart, 'tok_empty');

    expect(result.success).toBe(false);
    expect(result.order).toBeUndefined(); // no order created
  });

  // ── With discounts ──────────────────────────────────────────────────────

  test('applies discounts before charging', async () => {
    // 10 items x $200 = $2000 subtotal
    // bulk: 10% = $200 off, order: 5% = $100 off → charge $1700
    const bigCart = {
      items: { A: { product: { price: 200 }, quantity: 10 } },
      total: jest.fn().mockReturnValue(2000)
    };

    const engine = new DiscountEngine([bulkRule, orderRule]);
    const checkoutWithDiscount = new Checkout(gateway, null, engine);
    gateway.charge.mockResolvedValue({});

    const result = await checkoutWithDiscount.process(bigCart, 'tok_123');

    expect(gateway.charge).toHaveBeenCalledWith(1700, 'tok_123');
    expect(result.total).toBe(1700);
  });

  // ── Validation ──────────────────────────────────────────────────────────

  test('throws if cart is empty', async () => {
    const emptyCart = { items: {}, total: jest.fn().mockReturnValue(0) };

    const result = await checkout.process(emptyCart, 'tok_123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Cart is empty');
  });

});