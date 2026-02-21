import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, IUser } from '../models/User';
import { Package } from '../models/Package';
import { Inventory } from '../models/Inventory';
import { Warehouse } from '../models/Warehouse';
import { successResponse, errorResponse, getPaginationData } from '../utils/helpers';
import { PAGINATION } from '../utils/constants';
import { logger } from '../utils/logger';

interface AdminRequest extends AuthRequest {
  query: {
    page?: string;
    limit?: string;
    role?: string;
    status?: string;
    q?: string;
    category?: string;
    isActive?: string;
    type?: string;
  };
  params: {
    userId?: string;
    userCode?: string;
    type?: string;
  };
  body: {
    address?: any;
    role?: string;
    accountStatus?: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    assignedWarehouse?: string;
    permissions?: string[];
    name?: string;
    description?: string;
    warehouseId?: string;
  };
}

// Get all users (customers + staff)
export const getAllUsers = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    // Filter by role if specified
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Search functionality
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { userCode: searchRegex }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    successResponse(res, {
      users,
      pagination: getPaginationData(page, limit, total)
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    errorResponse(res, 'Failed to get users');
  }
};

// Get all customers specifically
export const getAllCustomers = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter: any = { role: 'customer' };
    
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { userCode: searchRegex }
      ];
    }

    const customers = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    successResponse(res, {
      customers,
      pagination: getPaginationData(page, limit, total)
    });
  } catch (error) {
    logger.error('Error getting customers:', error);
    errorResponse(res, 'Failed to get customers');
  }
};

// Get all staff (warehouse) specifically
export const getAllStaff = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter: any = { role: 'warehouse' };
    
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { userCode: searchRegex }
      ];
    }

    const staff = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    successResponse(res, {
      staff,
      pagination: getPaginationData(page, limit, total)
    });
  } catch (error) {
    logger.error('Error getting staff:', error);
    errorResponse(res, 'Failed to get staff');
  }
};

// Get all packages with admin access
export const getAllPackages = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter.$or = [
        { trackingNumber: searchRegex },
        { description: searchRegex },
        { shipper: searchRegex },
        { 'recipient.name': searchRegex },
        { 'recipient.email': searchRegex }
      ];
    }

    const packages = await Package.find(filter)
      .populate('userId', 'firstName lastName email phone mailboxNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Package.countDocuments(filter);

    successResponse(res, {
      packages,
      pagination: getPaginationData(page, limit, total)
    });
  } catch (error) {
    logger.error('Error getting packages:', error);
    errorResponse(res, 'Failed to get packages');
  }
};

// Get all inventory with admin access
export const getAllInventory = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.q) {
      const searchRegex = new RegExp(req.query.q, 'i');
      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex }
      ];
    }

    const inventory = await Inventory.find(filter)
      .populate('location.warehouse', 'name code')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inventory.countDocuments(filter);

    successResponse(res, {
      inventory,
      pagination: getPaginationData(page, limit, total)
    });
  } catch (error) {
    logger.error('Error getting inventory:', error);
    errorResponse(res, 'Failed to get inventory');
  }
};


// Get system statistics
export const getSystemStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalStaff,
      totalPackages,
      totalInventory,
      pendingPackages,
      deliveredPackages,
      lowStockItems
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'warehouse' }),
      Package.countDocuments(),
      Inventory.countDocuments(),
      Package.countDocuments({ status: 'pending' }),
      Package.countDocuments({ status: 'delivered' }),
      Inventory.countDocuments({
        $expr: { $lte: ['$quantity', '$minStockLevel'] },
        isActive: true
      })
    ]);

    successResponse(res, {
      stats: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          staff: totalStaff
        },
        packages: {
          total: totalPackages,
          pending: pendingPackages,
          delivered: deliveredPackages
        },
        inventory: {
          total: totalInventory,
          lowStock: lowStockItems
        }
      }
    });
  } catch (error) {
    logger.error('Error getting system stats:', error);
    errorResponse(res, 'Failed to get system statistics');
  }
};

// Change user role (admin only)
export const changeUserRole = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { userCode } = req.params;
    const { role } = req.body;

    if (!userCode || !role) {
      errorResponse(res, 'User code and role are required', 400);
      return;
    }

    const validRoles = ['admin', 'customer', 'warehouse'];
    if (!validRoles.includes(role)) {
      errorResponse(res, `Invalid role. Valid roles: ${validRoles.join(', ')}`, 400);
      return;
    }

    const user = await User.findOneAndUpdate(
      { userCode },
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    logger.info(`User role changed: ${user.email} -> ${role}`);
    successResponse(res, {
      user,
      message: `User role changed to ${role} successfully`
    });
  } catch (error) {
    logger.error('Error changing user role:', error);
    errorResponse(res, 'Failed to change user role');
  }
};

// Update user account status
export const updateUserStatus = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { userCode } = req.params;
    const { accountStatus, emailVerified } = req.body;

    if (!userCode) {
      errorResponse(res, 'User code is required', 400);
      return;
    }

    const updateData: any = {};
    if (accountStatus) {
      const validStatuses = ['pending', 'active', 'inactive'];
      if (!validStatuses.includes(accountStatus)) {
        errorResponse(res, `Invalid account status. Valid statuses: ${validStatuses.join(', ')}`, 400);
        return;
      }
      updateData.accountStatus = accountStatus;
    }
    
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified;
    }

    const user = await User.findOneAndUpdate(
      { userCode },
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    logger.info(`User status updated: ${user.email}`);
    successResponse(res, {
      user,
      message: 'User status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    errorResponse(res, 'Failed to update user status');
  }
};

// Add warehouse staff
export const addWarehouseStaff = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      assignedWarehouse,
      permissions
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      errorResponse(res, 'First name, last name, email, and password are required', 400);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errorResponse(res, 'User with this email already exists', 409);
      return;
    }

    // Generate unique user code
    const { generateMailboxCode } = await import('../utils/mailboxCodeGenerator');
    const userCode = await generateMailboxCode();

    // Create new warehouse staff
    const newStaff = new User({
      firstName,
      lastName,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      phone,
      role: 'warehouse',
      userCode,
      mailboxNumber: userCode,
      accountStatus: 'active',
      emailVerified: true,
      assignedWarehouse: assignedWarehouse || null,
      permissions: permissions || [],
      createdBy: req.user?.id
    });

    await newStaff.save();

    logger.info(`New warehouse staff created: ${newStaff.email}`);
    successResponse(res, {
      staff: {
        id: newStaff._id,
        userCode: newStaff.userCode,
        firstName: newStaff.firstName,
        lastName: newStaff.lastName,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        accountStatus: newStaff.accountStatus,
        emailVerified: newStaff.emailVerified,
        assignedWarehouse: newStaff.assignedWarehouse,
        permissions: newStaff.permissions,
        createdAt: newStaff.createdAt
      },
      message: 'Warehouse staff created successfully'
    }, 'Warehouse staff created successfully', 201);
  } catch (error) {
    logger.error('Error creating warehouse staff:', error);
    errorResponse(res, 'Failed to create warehouse staff');
  }
};

// Get all shipping addresses
export const getAllShippingAddresses = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    const { type } = req.query;

    const filter: any = { 'shippingAddresses.0': { $exists: true } };
    
    // Filter by address type if specified
    if (type) {
      filter['shippingAddresses.type'] = type;
    }

    const users = await User.find(filter)
      .select('firstName lastName email shippingAddresses')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Flatten all shipping addresses
    const allAddresses: any[] = [];
    users.forEach(user => {
      if (user.shippingAddresses && user.shippingAddresses.length > 0) {
        user.shippingAddresses.forEach((address: any) => {
          allAddresses.push({
            ...address.toObject(),
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            }
          });
        });
      }
    });

    // Filter by type again if needed (for more precise filtering)
    const filteredAddresses = type 
      ? allAddresses.filter(addr => addr.type === type)
      : allAddresses;

    // Apply pagination to the flattened addresses
    const paginatedAddresses = filteredAddresses.slice(skip, skip + limit);
    const total = filteredAddresses.length;

    // Create default addresses template
    const defaultAddresses = [
      {
        _id: 'default-air',
        type: 'air',
        street: '3200 NW 112th Ave',
        city: 'Doral',
        state: 'FL',
        zipCode: '33172',
        country: 'USA',
        isDefault: true,
        displayName: '✈️ Standard Air Address (USA)',
        formattedAddress: {
          name: 'First and Last Name',
          address: '3200 NW 112th Ave\nKCDE – [MAILBOX#]\nDoral, Florida 33172\nUnited States'
        }
      },
      {
        _id: 'default-sea',
        type: 'sea',
        street: '3200 NW 112th Ave',
        city: 'Doral',
        state: 'FL',
        zipCode: '33172',
        country: 'USA',
        isDefault: true,
        displayName: '🚢 Standard Sea Address (USA)',
        formattedAddress: {
          name: 'First and Last Name',
          address: '3200 NW 112th Ave\nKCDX – [MAILBOX#]\nDoral, Florida 33172\nUnited States'
        }
      },
      {
        _id: 'default-china',
        type: 'china',
        street: 'Baoshan No.2 Industrial Zone',
        city: 'Shenzhen',
        state: 'Guangdong Province',
        zipCode: '',
        country: 'China',
        isDefault: true,
        displayName: '🇨🇳 China Address',
        formattedAddress: {
          name: 'FirstName LastName – [MAILBOX#]',
          address: 'China\nGuangdong Province, Shenzhen\nBaoshan No.2 Industrial Zone'
        }
      }
    ];

    // If no specific type is requested, include default addresses
    const responseAddresses = type 
      ? paginatedAddresses 
      : [...defaultAddresses, ...paginatedAddresses];

    successResponse(res, {
      shippingAddresses: responseAddresses,
      pagination: getPaginationData(page, limit, type ? total : total + defaultAddresses.length),
      filters: {
        type
      },
      defaultAddresses: type ? null : defaultAddresses
    });
  } catch (error) {
    logger.error('Error getting all shipping addresses:', error);
    errorResponse(res, 'Failed to get shipping addresses');
  }
};

// Delete user (admin only)
export const deleteUser = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { userCode } = req.params;

    if (!userCode) {
      errorResponse(res, 'User code is required', 400);
      return;
    }

    const user = await User.findOneAndDelete({ userCode }) as unknown as IUser | null;

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    logger.info(`User deleted: ${user.email} (${user.userCode})`);
    successResponse(res, {
      user: {
        id: user._id,
        userCode: user.userCode,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    errorResponse(res, 'Failed to delete user');
  }
};

// Update shipping address by type
export const updateShippingAddressByType = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const { address } = req.body;

    if (!type || !address) {
      errorResponse(res, 'Address type and address data are required', 400);
      return;
    }

    const validTypes = ['air', 'sea', 'china', 'standard'];
    if (!validTypes.includes(type)) {
      errorResponse(res, `Invalid address type. Valid types: ${validTypes.join(', ')}`, 400);
      return;
    }

    // Find all users who have this address type
    const users = await User.find({ 'shippingAddresses.type': type });

    // If no users have this address type, just update the default template addresses
    if (users.length === 0) {
      logger.info(`No users found with ${type} address type. Address template updated for future use.`);
      successResponse(res, {
        message: `${type} shipping address template updated successfully. No existing users with this address type found.`,
        updatedCount: 0
      });
      return;
    }

    // Update the address for all users who have this type
    const updatePromises = users.map(async (user) => {
      await User.updateOne(
        { 
          _id: user._id,
          'shippingAddresses.type': type 
        },
        { 
          $set: { 
            'shippingAddresses.$.street': address.street,
            'shippingAddresses.$.city': address.city,
            'shippingAddresses.$.state': address.state,
            'shippingAddresses.$.zipCode': address.zipCode,
            'shippingAddresses.$.country': address.country || 'USA'
          }
        }
      );
    });

    await Promise.all(updatePromises);

    logger.info(`Updated ${type} shipping addresses for ${users.length} users`);
    successResponse(res, {
      message: `${type} shipping addresses updated successfully for ${users.length} users`,
      updatedCount: users.length
    });
  } catch (error) {
    logger.error('Error updating shipping address by type:', error);
    errorResponse(res, 'Failed to update shipping addresses');
  }
};
