import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/models/User';
import { Warehouse } from '../src/models/Warehouse';
import { Inventory } from '../src/models/Inventory';
import { ApiKey } from '../src/models/ApiKey';
import { generateApiKey } from '../src/utils/helpers';

const seedData = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Warehouse.deleteMany({});
    await Inventory.deleteMany({});
    await ApiKey.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      userCode: 'AD-001',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@warehouse.com',
      passwordHash: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      accountStatus: 'active',
      emailVerified: true
    });
    console.log('Created admin user:', admin.email);

    // Create warehouse staff users
    const staffUsers = await Promise.all([
      User.create({
        userCode: 'WS-001',
        firstName: 'John',
        lastName: 'Warehouse',
        email: 'john@warehouse.com',
        passwordHash: 'staff123', // Will be hashed by pre-save hook
        role: 'warehouse',
        accountStatus: 'active',
        emailVerified: true
      }),
      User.create({
        userCode: 'WS-002',
        firstName: 'Jane',
        lastName: 'Operations',
        email: 'jane@warehouse.com',
        passwordHash: 'staff123', // Will be hashed by pre-save hook
        role: 'warehouse',
        accountStatus: 'active',
        emailVerified: true
      })
    ]);
    console.log(`Created ${staffUsers.length} warehouse staff users`);

    // Create test customers
    const customers = await Promise.all([
      User.create({
        userCode: 'CU-001',
        firstName: 'Alice',
        lastName: 'Customer',
        email: 'alice@customer.com',
        passwordHash: 'customer123', // Will be hashed by pre-save hook
        role: 'customer',
        accountStatus: 'active',
        emailVerified: true,
        mailboxNumber: 'CJS-0001'
      }),
      User.create({
        userCode: 'CU-002',
        firstName: 'Bob',
        lastName: 'Customer',
        email: 'bob@customer.com',
        passwordHash: 'customer123', // Will be hashed by pre-save hook
        role: 'customer',
        accountStatus: 'active',
        emailVerified: true,
        mailboxNumber: 'CJS-0002'
      }),
      User.create({
        userCode: 'CU-003',
        firstName: 'Charlie',
        lastName: 'Customer',
        email: 'charlie@customer.com',
        passwordHash: 'customer123', // Will be hashed by pre-save hook
        role: 'customer',
        accountStatus: 'active',
        emailVerified: true,
        mailboxNumber: 'CJS-0003'
      })
    ]);
    console.log(`Created ${customers.length} customer users`);

    // Create warehouses
    const warehouses = await Promise.all([
      Warehouse.create({
        name: 'Main Distribution Center',
        code: 'MDC',
        address: '123 Logistics Blvd',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isActive: true,
        isDefault: true,
        companyAbbreviation: 'CJS',
        airAddress: {
          name: 'Clean J Shipping Air Facility',
          street: '123 Airport Road',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA',
          phone: '+1-305-555-0100',
          email: 'air@cjs-shipping.com'
        },
        seaAddress: {
          name: 'Clean J Shipping Sea Terminal',
          street: '456 Harbor Drive',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
          phone: '+1-310-555-0200',
          email: 'sea@cjs-shipping.com'
        },
        chinaAddress: {
          name: 'Clean J Shipping China Office',
          street: '789 Beijing Road',
          city: 'Shanghai',
          state: 'Shanghai',
          zipCode: '200000',
          country: 'China',
          phone: '+86-21-555-0300',
          email: 'china@cjs-shipping.com'
        }
      }),
      Warehouse.create({
        name: 'West Coast Hub',
        code: 'WCH',
        address: '456 Pacific Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        isActive: true,
        isDefault: false,
        companyAbbreviation: 'CJS',
        airAddress: {
          name: 'CJS West Coast Air Facility',
          street: '321 LAX Boulevard',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90045',
          country: 'USA',
          phone: '+1-310-555-0400',
          email: 'west-air@cjs-shipping.com'
        },
        seaAddress: {
          name: 'CJS West Coast Sea Terminal',
          street: '656 Long Beach Pier',
          city: 'Long Beach',
          state: 'CA',
          zipCode: '90802',
          country: 'USA',
          phone: '+1-562-555-0500',
          email: 'west-sea@cjs-shipping.com'
        },
        chinaAddress: {
          name: 'CJS West Coast China Office',
          street: '999 Guangzhou Avenue',
          city: 'Guangzhou',
          state: 'Guangdong',
          zipCode: '510000',
          country: 'China',
          phone: '+86-20-555-0600',
          email: 'west-china@cjs-shipping.com'
        }
      })
    ]);
    console.log(`Created ${warehouses.length} warehouses`);

    // Create inventory items
    const inventoryItems = [
      {
        name: 'Shipping Box Small',
        sku: 'BOX-SM-001',
        category: 'Packaging',
        quantity: 1000,
        minStockLevel: 100,
        maxStockLevel: 2000,
        unitPrice: 1.50,
        currency: 'USD',
        location: {
          warehouse: warehouses[0]._id,
          aisle: 'A',
          shelf: '1',
          bin: '01'
        },
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
          unit: 'cm'
        },
        weight: {
          value: 0.5,
          unit: 'kg'
        },
        tags: ['box', 'small', 'cardboard'],
        isActive: true,
        lowStockAlert: false,
        createdBy: admin._id
      },
      {
        name: 'Shipping Box Medium',
        sku: 'BOX-MD-001',
        category: 'Packaging',
        quantity: 500,
        minStockLevel: 50,
        maxStockLevel: 1000,
        unitPrice: 2.75,
        currency: 'USD',
        location: {
          warehouse: warehouses[0]._id,
          aisle: 'A',
          shelf: '1',
          bin: '02'
        },
        dimensions: {
          length: 45,
          width: 30,
          height: 20,
          unit: 'cm'
        },
        weight: {
          value: 0.8,
          unit: 'kg'
        },
        tags: ['box', 'medium', 'cardboard'],
        isActive: true,
        lowStockAlert: false,
        createdBy: admin._id
      }
    ];

    const createdInventory = await Inventory.insertMany(inventoryItems);
    console.log(`Created ${createdInventory.length} inventory items`);

    // Create API keys for warehouses
    const apiKeys = await Promise.all([
      ApiKey.create({
        key: generateApiKey(),
        name: 'Main Distribution Center API',
        description: 'API key for Main Distribution Center operations',
        warehouseId: warehouses[0]._id,
        permissions: ['packages:read', 'packages:write', 'inventory:read', 'inventory:write'],
        isActive: true,
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 2000,
          requestsPerDay: 20000
        },
        createdBy: admin._id
      }),
      ApiKey.create({
        key: generateApiKey(),
        name: 'West Coast Hub API',
        description: 'API key for West Coast Hub operations',
        warehouseId: warehouses[1]._id,
        permissions: ['packages:read', 'packages:write', 'inventory:read'],
        isActive: true,
        rateLimit: {
          requestsPerMinute: 75,
          requestsPerHour: 1500,
          requestsPerDay: 15000
        },
        createdBy: admin._id
      })
    ]);
    console.log(`Created ${apiKeys.length} API keys`);

    console.log('\n=== Database Seeding Complete ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@warehouse.com / admin123');
    console.log('Staff: john@warehouse.com / staff123');
    console.log('Staff: jane@warehouse.com / staff123');
    console.log('Customer: alice@customer.com / customer123');
    console.log('Customer: bob@customer.com / customer123');
    console.log('Customer: charlie@customer.com / customer123');
    
    console.log('\nAPI Keys:');
    apiKeys.forEach((apiKey, index) => {
      console.log(`${warehouses[index].name}: ${apiKey.key}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    console.log('\nDisconnected from database');
    process.exit(0);
  }
};

// Run the seed function
seedData();
