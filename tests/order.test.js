const { Checkout }    = require('../src/checkout');
const { OrderRepo }   = require('../src/order');

describe('Order Creation', () => {

  let gateway, orderRepo, cart, checkout;

  beforeEach(() => {
    gateway  = { charge: jest.fn().mockResolvedValue({ transactionId: 'txn_001' }) };
    orderRepo = new OrderRepo(); // fake in-memory repo
    cart = {
      items: {
        A: { product: { sku: 'A', name: 'Laptop', price: 999 }, quantity: 1 },
        B: { product: { sku: 'B', name: 'Mouse',  price: 29  }, quantity: 2 }
      },
      total: jest.fn().mockReturnValue(1057)
    };
    checkout = new Checkout(gateway, orderRepo);
  });

  // ── Order is created on success ─────────────────────────────────────────

  test('creates an order record after successful payment', async () => {
    await checkout.process(cart, 'tok_123');

    const orders = orderRepo.findAll();
    expect(orders).toHaveLength(1);
  });

  test('saved order contains correct total', async () => {
    await checkout.process(cart, 'tok_123');

    const order = orderRepo.findAll()[0];
    expect(order.total).toBe(1057);
  });

  test('saved order contains line items', async () => {
    await checkout.process(cart, 'tok_123');

    const order = orderRepo.findAll()[0];
    expect(order.items).toBeDefined();
    expect(Object.keys(order.items)).toHaveLength(2);
  });

  test('saved order has a timestamp', async () => {
    await checkout.process(cart, 'tok_123');

    const order = orderRepo.findAll()[0];
    expect(order.createdAt).toBeInstanceOf(Date);
  });

  test('saved order has a unique id', async () => {
    await checkout.process(cart, 'tok_123');
    await checkout.process(cart, 'tok_456');

    const orders = orderRepo.findAll();
    expect(orders[0].id).toBeDefined();
    expect(orders[0].id).not.toBe(orders[1].id); // each order is unique
  });

  // ── Order is NOT created on failure ─────────────────────────────────────

  test('does NOT save order when payment fails', async () => {
    gateway.charge.mockRejectedValue(new Error('Card declined'));

    await checkout.process(cart, 'tok_bad');

    expect(orderRepo.findAll()).toHaveLength(0);
  });

  // ── Repository lookup ───────────────────────────────────────────────────

  test('can find a saved order by id', async () => {
    await checkout.process(cart, 'tok_123');

    const saved = orderRepo.findAll()[0];
    const found = orderRepo.findById(saved.id);

    expect(found).toEqual(saved);
  });

  test('findById returns null for unknown id', () => {
    expect(orderRepo.findById('nonexistent')).toBeNull();
  });

});