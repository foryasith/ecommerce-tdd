const { Product } = require('../src/product');
const { Catalog } = require('../src/catalog');

// --- Product Tests ---
describe('Product', () => {

  test('creates a product with valid sku, name, and price', () => {
    const p = new Product('SKU001', 'Laptop', 999.99);
    expect(p.sku).toBe('SKU001');
    expect(p.name).toBe('Laptop');
    expect(p.price).toBe(999.99);
  });

  test('throws error if sku is missing', () => {
    expect(() => new Product('', 'Laptop', 999)).toThrow('SKU is required');
  });

  test('throws error if name is missing', () => {
    expect(() => new Product('SKU001', '', 999)).toThrow('Name is required');
  });

  test('throws error if price is negative', () => {
    expect(() => new Product('SKU001', 'Laptop', -10)).toThrow('Price must be non-negative');
  });

  test('throws error if price is missing', () => {
    expect(() => new Product('SKU001', 'Laptop', undefined)).toThrow('Price must be non-negative');
  });

});

// --- Catalog Tests ---
describe('Catalog', () => {

  test('can add a product and find it by SKU', () => {
    const catalog = new Catalog();
    const product = new Product('SKU001', 'Laptop', 999.99);
    catalog.add(product);
    expect(catalog.findBySku('SKU001')).toBe(product);
  });

  test('returns null when SKU is not found', () => {
    const catalog = new Catalog();
    expect(catalog.findBySku('MISSING')).toBeNull();
  });

});