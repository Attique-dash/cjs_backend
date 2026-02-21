import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

export const validateAddPackage = [
  body('trackingNumber')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Tracking number must be 10-20 alphanumeric characters')
    .matches(/^[A-Z0-9]{10,20}$/)
    .withMessage('Tracking number must contain only uppercase letters and numbers'),
  
  body('userCode')
    .isString()
    .trim()
    .matches(/^[A-Z]{2,6}-\d{3,4}$/)
    .withMessage('User code must be in format CLEAN-XXXX'),
  
  body('weight')
    .isFloat({ min: 0.1 })
    .withMessage('Weight must be greater than 0 and a valid number'),
  
  body('shipper')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Shipper name cannot exceed 100 characters'),
  
  body('serviceMode')
    .optional()
    .isIn(['air', 'ocean', 'local'])
    .withMessage('Service mode must be air, ocean, or local'),
  
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
    .withMessage('Unit must be cm or in'),
  
  body('recipient.name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipient name must be between 1 and 100 characters'),
  
  body('recipient.email')
    .optional()
    .isEmail()
    .withMessage('Valid recipient email is required'),
  
  body('recipient.phone')
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{10,20}$/)
    .withMessage('Valid phone number is required'),
  
  body('recipient.address')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('warehouseLocation')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Warehouse location must be between 1 and 200 characters'),
  
  body('customsRequired')
    .optional()
    .isBoolean()
    .withMessage('Customs required must be a boolean'),
  
  body('isFragile')
    .optional()
    .isBoolean()
    .withMessage('Fragile flag must be a boolean'),
  
  body('isHazardous')
    .optional()
    .isBoolean()
    .withMessage('Hazardous flag must be a boolean'),
  
  body('requiresSignature')
    .optional()
    .isBoolean()
    .withMessage('Signature required flag must be a boolean'),
  
  body('specialInstructions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),
  
  handleValidationErrors
];

export const validateUpdatePackage = [
  body('weight')
    .optional()
    .isFloat({ min: 0.1 })
    .withMessage('Weight must be greater than 0 and a valid number'),
  
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
    .withMessage('Unit must be cm or in'),
  
  body('recipient.name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipient name must be between 1 and 100 characters'),
  
  body('recipient.email')
    .optional()
    .isEmail()
    .withMessage('Valid recipient email is required'),
  
  body('recipient.phone')
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{10,20}$/)
    .withMessage('Valid phone number is required'),
  
  body('recipient.address')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('warehouseLocation')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Warehouse location must be between 1 and 200 characters'),
  
  body('specialInstructions')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),
  
  handleValidationErrors
];

export const validateUpdatePackageStatus = [
  body('status')
    .isIn(['received', 'in_transit', 'out_for_delivery', 'delivered', 'pending', 'customs', 'returned'])
    .withMessage('Status must be one of: received, in_transit, out_for_delivery, delivered, pending, customs, returned'),
  
  body('location')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
  
  handleValidationErrors
];
