const { Cart } = require('../src/cart');

describe('Cart with Inventory', () => {

  let catalog, inventory, cart;

  beforeEach(() => {
    catalog   = { findBySku: jest.fn() };
    inventory = { getAvailable: jest.fn() }; // fake inventory service
    cart      = new Cart(catalog, inventory); // inject it
  });

  test('adds item successfully when stock is sufficient', () => {
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 100 });
    inventory.getAvailable.mockReturnValue(10); // 10 in stock

    cart.addItem('A', 3); // requesting 3 — should be fine
    expect(cart.total()).toBe(300);
  });

  test('throws error when requested quantity exceeds stock', () => {
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 100 });
    inventory.getAvailable.mockReturnValue(2); // only 2 in stock

    expect(() => cart.addItem('A', 5)) // requesting 5 — should fail
      .toThrow('Insufficient inventory');
  });

  test('throws error when item is completely out of stock', () => {
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 100 });
    inventory.getAvailable.mockReturnValue(0); // zero stock

    expect(() => cart.addItem('A', 1))
      .toThrow('Insufficient inventory');
  });

  test('cart still works normally when no inventory service provided', () => {
    // Backward compatibility — old Cart(catalog) still works
    const simpleCart = new Cart(catalog);
    catalog.findBySku.mockReturnValue({ sku: 'A', price: 50 });

    simpleCart.addItem('A', 2);
    expect(simpleCart.total()).toBe(100);
  });

});