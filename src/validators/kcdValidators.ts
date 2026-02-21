import { body, validationResult } from 'express-validator';

// Validation for generating API key
export const generateApiKeyValidation = [
  body('courierCode')
    .notEmpty()
    .withMessage('Courier code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Courier code must be 2-20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Courier code can only contain uppercase letters, numbers, and hyphens'),
  
  body('expiresIn')
    .optional()
    .isInt({ min: 1, max: 3650 })
    .withMessage('Expires in must be between 1 and 3650 days'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Validation for adding package
export const addPackageValidation = [
  body('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Tracking number must be 3-50 characters'),
  
  body('courierCode')
    .notEmpty()
    .withMessage('Courier code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Courier code must be 2-20 characters'),
  
  body('customerCode')
    .notEmpty()
    .withMessage('Customer code is required')
    .matches(/^[A-Z]{2,6}-\d{3,4}$/)
    .withMessage('Customer code must be in format CLEAN-XXXX'),
  
  body('weight')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned', 'at_warehouse', 'processing', 'ready_for_pickup'])
    .withMessage('Invalid package status'),
  
  body('warehouseAddress')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Warehouse address cannot exceed 500 characters'),
  
  body('processedAt')
    .optional()
    .isISO8601()
    .withMessage('Processed at must be a valid date'),
  
  body('dimensions.length')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Length must be a positive number'),
  
  body('dimensions.width')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Width must be a positive number'),
  
  body('dimensions.height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  
  body('dimensions.unit')
    .optional()
    .isIn(['cm', 'in'])
    .withMessage('Unit must be either cm or in')
];

// Validation for updating package
export const updatePackageValidation = [
  body('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required'),
  
  body('status')
    .optional()
    .isIn(['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned', 'at_warehouse', 'processing', 'ready_for_pickup'])
    .withMessage('Invalid package status'),
  
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  
  body('lastUpdated')
    .optional()
    .isISO8601()
    .withMessage('Last updated must be a valid date'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('warehouseAddress')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Warehouse address cannot exceed 500 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters')
];

// Validation for getting customers
export const getCustomersValidation = [
  body('courierCode')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('Courier code must be 2-20 characters'),
  
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  body('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// Helper function to check validation results
export const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};
