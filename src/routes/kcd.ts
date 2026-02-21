import { Router, Request, Response } from 'express';
import { authKcdApiKey, AuthenticatedKcdRequest } from '../middleware/authKcd';
import { 
  addPackageValidation, 
  updatePackageValidation, 
  getCustomersValidation,
  handleValidationErrors 
} from '../validators/kcdValidators';
import { Package } from '../models/Package';
import { User } from '../models/User';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/kcd/customers
// Get customers for the courier
// ─────────────────────────────────────────────────────────────
router.get('/customers', 
  authKcdApiKey,
  getCustomersValidation,
  handleValidationErrors,
  async (req: AuthenticatedKcdRequest, res: Response): Promise<void> => {
    try {
      const { courierCode, limit = 50, offset = 0 } = req.body;
      const authenticatedCourierCode = req.courierCode;

      // Build query
      const query: any = { role: 'customer' };
      
      // Filter by courier code if provided
      if (courierCode) {
        query['shippingAddresses'] = { $elemMatch: { type: courierCode.toLowerCase() } };
      }

      const customers = await User.find(query)
        .select('userCode firstName lastName email phone address mailboxNumber shippingAddresses')
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          customers: customers.map(customer => ({
            id: customer._id,
            userCode: customer.userCode,
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            mailboxNumber: customer.mailboxNumber,
            shippingAddresses: customer.shippingAddresses,
            courierCode: authenticatedCourierCode
          })),
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      });
    } catch (error: any) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get customers',
        error: error.message
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// POST /api/kcd/packages/add
// Add a new package
// ─────────────────────────────────────────────────────────────
router.post('/packages/add',
  authKcdApiKey,
  addPackageValidation,
  handleValidationErrors,
  async (req: AuthenticatedKcdRequest, res: Response): Promise<void> => {
    try {
      const {
        trackingNumber,
        courierCode,
        customerCode,
        weight,
        status = 'received',
        warehouseAddress,
        processedAt,
        dimensions,
        description,
        shipper,
        senderName,
        senderEmail,
        senderPhone,
        senderAddress,
        recipient
      } = req.body;

      const authenticatedCourierCode = req.courierCode;

      // Find the customer
      const customer = await User.findOne({ 
        userCode: customerCode, 
        role: 'customer' 
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
        return;
      }

      // Check if tracking number already exists
      const existingPackage = await Package.findOne({ trackingNumber });
      if (existingPackage) {
        res.status(409).json({
          success: false,
          message: 'Package with this tracking number already exists'
        });
        return;
      }

      // Create the package
      const packageData: any = {
        trackingNumber,
        userCode: customerCode,
        userId: customer._id,
        weight,
        status,
        source: 'kcd-packing-system',
        courierCode: authenticatedCourierCode,
        warehouseLocation: warehouseAddress,
        dateReceived: processedAt ? new Date(processedAt) : new Date(),
        processedAt: processedAt ? new Date(processedAt) : new Date()
      };

      // Add optional fields
      if (dimensions) packageData.dimensions = dimensions;
      if (description) packageData.description = description;
      if (shipper) packageData.shipper = shipper;
      if (senderName) packageData.senderName = senderName;
      if (senderEmail) packageData.senderEmail = senderEmail;
      if (senderPhone) packageData.senderPhone = senderPhone;
      if (senderAddress) packageData.senderAddress = senderAddress;
      if (recipient) packageData.recipient = recipient;

      const newPackage = await Package.create(packageData);

      // Add to tracking history
      if (processedAt) {
        newPackage.trackingHistory = [{
          timestamp: new Date(processedAt),
          status,
          location: warehouseAddress || 'Warehouse',
          description: `Package received from ${courierCode}`
        }];
        await newPackage.save();
      }

      res.status(201).json({
        success: true,
        message: 'Package added successfully',
        data: {
          trackingNumber: newPackage.trackingNumber,
          status: newPackage.status,
          customerCode: newPackage.userCode,
          createdAt: newPackage.createdAt
        }
      });
    } catch (error: any) {
      console.error('Add package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add package',
        error: error.message
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// PUT /api/kcd/packages/update
// Update an existing package
// ─────────────────────────────────────────────────────────────
router.put('/packages/update',
  authKcdApiKey,
  updatePackageValidation,
  handleValidationErrors,
  async (req: AuthenticatedKcdRequest, res: Response): Promise<void> => {
    try {
      const {
        trackingNumber,
        status,
        location,
        lastUpdated,
        weight,
        warehouseAddress,
        notes
      } = req.body;

      const authenticatedCourierCode = req.courierCode;

      // Find the package
      const packageDoc = await Package.findOne({ trackingNumber });
      if (!packageDoc) {
        res.status(404).json({
          success: false,
          message: 'Package not found'
        });
        return;
      }

      // Update package fields
      const updates: any = {};
      if (status) updates.status = status;
      if (weight) updates.weight = weight;
      if (warehouseAddress) updates.warehouseLocation = warehouseAddress;
      if (notes) updates.notes = notes;

      // Add tracking history entry if status or location changed
      if (status || location) {
        const historyEntry = {
          timestamp: lastUpdated ? new Date(lastUpdated) : new Date(),
          status: status || packageDoc.status,
          location: location || packageDoc.warehouseLocation || 'Unknown',
          description: status ? `Status updated to ${status}` : 'Location updated'
        };

        updates.$push = { trackingHistory: historyEntry };
      }

      const updatedPackage = await Package.findByIdAndUpdate(
        packageDoc._id,
        updates,
        { new: true }
      );

      res.json({
        success: true,
        message: 'Package updated successfully',
        data: {
          trackingNumber: updatedPackage?.trackingNumber,
          status: updatedPackage?.status,
          updatedAt: updatedPackage?.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Update package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update package',
        error: error.message
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/kcd/packages/:trackingNumber
// Get package details
// ─────────────────────────────────────────────────────────────
router.get('/packages/:trackingNumber',
  authKcdApiKey,
  async (req: AuthenticatedKcdRequest, res: Response): Promise<void> => {
    try {
      const { trackingNumber } = req.params;

      const packageDoc = await Package.findOne({ trackingNumber })
        .populate('userId', 'userCode firstName lastName email');

      if (!packageDoc) {
        res.status(404).json({
          success: false,
          message: 'Package not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          trackingNumber: packageDoc.trackingNumber,
          userCode: packageDoc.userCode,
          customer: packageDoc.userId,
          status: packageDoc.status,
          weight: packageDoc.weight,
          dimensions: packageDoc.dimensions,
          warehouseLocation: packageDoc.warehouseLocation,
          dateReceived: packageDoc.dateReceived,
          trackingHistory: packageDoc.trackingHistory,
          createdAt: packageDoc.createdAt,
          updatedAt: packageDoc.updatedAt
        }
      });
    } catch (error: any) {
      console.error('Get package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get package',
        error: error.message
      });
    }
  }
);

export default router;
