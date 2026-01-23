import { Database } from 'better-sqlite3'
import { ProductRepository } from './repositories/productRepository'
import { SupplierRepository } from './repositories/supplierRepository'
import { UserRepository } from './repositories/userRepository'

export function seedDatabase(db: Database) {
  const productRepo = new ProductRepository(db)
  const supplierRepo = new SupplierRepository(db)
  const userRepo = new UserRepository(db)

  try {
    // Check if admin user already exists - this is the primary key check
    const existingAdminUser = userRepo.getByUsername('admin')
    if (existingAdminUser) {
      console.log('Database already seeded with admin user, skipping seed')
      return
    }

    console.log('Starting database seeding...')

    // Seed default admin user first
    const adminUser = userRepo.create('admin', 'admin@shop.local', 'admin123', 'System Administrator', 'admin')
    console.log(`Created admin user: ${adminUser.username}`)

    // Seed suppliers next
    const suppliers = [
      {
        name: 'Premium Wholesale Co.',
        contact_person: 'John Smith',
        phone: '+1-800-123-4567',
        email: 'john@premiumwholesale.com',
        address: '123 Business Ave, Trade City, TC 12345'
      },
      {
        name: 'Quality Imports Ltd.',
        contact_person: 'Sarah Johnson',
        phone: '+1-800-987-6543',
        email: 'sarah@qualityimports.com',
        address: '456 Commerce Blvd, Port City, PC 67890'
      },
      {
        name: 'Direct Factory Supply',
        contact_person: 'Michael Chen',
        phone: '+1-800-555-1234',
        email: 'michael@directfactory.com',
        address: '789 Industrial Way, Factory Town, FT 11111'
      }
    ]

    const createdSuppliers = suppliers.map((sup) => supplierRepo.create(sup))
    console.log(`Created ${createdSuppliers.length} suppliers`)

    // Seed products with sample data
    const products = [
      {
        name: 'Premium Coffee Beans - Arabica',
        description: 'High-quality single-origin Arabica coffee beans',
        sku: 'COFFEE-ARAB-001',
        category_id: undefined,
        supplier_id: createdSuppliers[0].id,
        buying_price: 8.5,
        selling_price: 14.99,
        current_stock: 150,
        minimum_stock_level: 30,
        unit_of_measurement: 'bag'
      },
      {
        name: 'Organic Green Tea',
        description: 'Pure organic green tea leaves from the finest gardens',
        sku: 'TEA-GREEN-002',
        category_id: undefined,
        supplier_id: createdSuppliers[1].id,
        buying_price: 5.25,
        selling_price: 9.99,
        current_stock: 200,
        minimum_stock_level: 50,
        unit_of_measurement: 'box'
      },
      {
        name: 'Dark Chocolate Bars (70%)',
        description: 'Premium dark chocolate with 70% cocoa content',
        sku: 'CHOCO-DARK-003',
        category_id: undefined,
        supplier_id: createdSuppliers[2].id,
        buying_price: 3.75,
        selling_price: 7.49,
        current_stock: 300,
        minimum_stock_level: 100,
        unit_of_measurement: 'box'
      },
      {
        name: 'Honey - Raw & Unfiltered',
        description: 'Pure raw honey from local apiaries',
        sku: 'HONEY-RAW-004',
        category_id: undefined,
        supplier_id: createdSuppliers[0].id,
        buying_price: 12.0,
        selling_price: 22.99,
        current_stock: 80,
        minimum_stock_level: 20,
        unit_of_measurement: 'jar'
      },
      {
        name: 'Almond Butter - Natural',
        description: 'Creamy natural almond butter, no added sugar',
        sku: 'ALMOND-NUT-005',
        category_id: undefined,
        supplier_id: createdSuppliers[1].id,
        buying_price: 6.5,
        selling_price: 12.99,
        current_stock: 120,
        minimum_stock_level: 25,
        unit_of_measurement: 'jar'
      },
      {
        name: 'Specialty Spice Blend - Gourmet',
        description: 'Exotic spice blend for premium cooking',
        sku: 'SPICE-GOURM-006',
        category_id: undefined,
        supplier_id: createdSuppliers[2].id,
        buying_price: 4.2,
        selling_price: 8.99,
        current_stock: 75,
        minimum_stock_level: 15,
        unit_of_measurement: 'bottle'
      },
      {
        name: 'Extra Virgin Olive Oil',
        description: 'Premium extra virgin olive oil from Mediterranean',
        sku: 'OLIVE-OIL-007',
        category_id: undefined,
        supplier_id: createdSuppliers[0].id,
        buying_price: 15.0,
        selling_price: 29.99,
        current_stock: 45,
        minimum_stock_level: 10,
        unit_of_measurement: 'bottle'
      },
      {
        name: 'Organic Granola Mix',
        description: 'Crunchy organic granola with nuts and dried fruit',
        sku: 'GRANOLA-ORG-008',
        category_id: undefined,
        supplier_id: createdSuppliers[1].id,
        buying_price: 4.0,
        selling_price: 8.49,
        current_stock: 160,
        minimum_stock_level: 40,
        unit_of_measurement: 'bag'
      },
      {
        name: 'Herbal Tea Assortment',
        description: 'Premium selection of various herbal teas',
        sku: 'TEA-HERB-009',
        category_id: undefined,
        supplier_id: createdSuppliers[2].id,
        buying_price: 7.5,
        selling_price: 14.99,
        current_stock: 110,
        minimum_stock_level: 30,
        unit_of_measurement: 'box'
      },
      {
        name: 'Artisanal Cheese Selection',
        description: 'Premium selection of aged artisanal cheeses',
        sku: 'CHEESE-ART-010',
        category_id: undefined,
        supplier_id: createdSuppliers[0].id,
        buying_price: 18.0,
        selling_price: 35.99,
        current_stock: 35,
        minimum_stock_level: 10,
        unit_of_measurement: 'pack'
      }
    ]

    const createdProducts = products.map((prod) => productRepo.create(prod))
    console.log(`Created ${createdProducts.length} products`)

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}
