const { Cart } = require('../src/cart');

describe('Cart', () => {

  let catalog, cart;

  beforeEach(() => {
    // Mock catalog — Cart tests should NOT depend on real Catalog logic
    catalog = { findBySku: jest.fn() };
    cart = new Cart(catalog);
  });

  test('adds a product and computes the correct total', () => {
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 100 });
    cart.addItem('A', 3);
    expect(cart.total()).toBe(300);
  });

  test('throws error if product SKU not in catalog', () => {
    catalog.findBySku.mockReturnValue(null);
    expect(() => cart.addItem('UNKNOWN', 1)).toThrow('Product not found');
  });

  test('throws error if quantity is zero or negative', () => {
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 100 });
    expect(() => cart.addItem('A', 0)).toThrow('Quantity must be greater than 0');
    expect(() => cart.addItem('A', -2)).toThrow('Quantity must be greater than 0');
  });

  test('removes an item from the cart', () => {
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 50 });
    cart.addItem('A', 2);
    cart.removeItem('A');
    expect(cart.total()).toBe(0);
  });

  test('total is correct with multiple items', () => {
    catalog.findBySku
      .mockReturnValueOnce({ sku: 'A', price: 100 })
      .mockReturnValueOnce({ sku: 'B', price: 200 });
    cart.addItem('A', 2); // 200
    cart.addItem('B', 1); // 200
    expect(cart.total()).toBe(400);
  });

});