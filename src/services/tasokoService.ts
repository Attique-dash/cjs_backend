import axios from 'axios';
import { IPackage } from '../models/Package';
import { logger } from '../utils/logger';

export class TasokoService {
  private static baseUrl = process.env.TASOKO_API_URL || '';
  private static apiToken = process.env.TASOKO_API_TOKEN || '';

  /**
   * Send package data to Tasoko after creation
   * Endpoint: Add Package (PDF page 3)
   */
  static async sendPackageCreated(packageData: IPackage): Promise<boolean> {
    try {
      if (!this.baseUrl || !this.apiToken) {
        logger.warn('Tasoko API not configured, skipping webhook');
        return false;
      }

      const payload = this.formatPackagePayload(packageData);
      
      const response = await axios.post(
        `${this.baseUrl}/api/packages/add`,
        [payload], // Array format as per spec
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': this.apiToken
          },
          timeout: 10000
        }
      );

      logger.info(`Package sent to Tasoko: ${packageData.trackingNumber}`);
      return response.status === 200;

    } catch (error: any) {
      logger.error('Failed to send package to Tasoko:', error.message);
      return false;
    }
  }

  /**
   * Send package update to Tasoko
   * Endpoint: Update Package (PDF page 4)
   */
  static async sendPackageUpdated(packageData: IPackage): Promise<boolean> {
    try {
      if (!this.baseUrl || !this.apiToken) {
        return false;
      }

      const payload = this.formatPackagePayload(packageData);
      
      const response = await axios.post(
        `${this.baseUrl}/api/packages/edit`,
        [payload],
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': this.apiToken
          },
          timeout: 10000
        }
      );

      logger.info(`Package update sent to Tasoko: ${packageData.trackingNumber}`);
      return response.status === 200;

    } catch (error: any) {
      logger.error('Failed to send update to Tasoko:', error.message);
      return false;
    }
  }

  /**
   * Send package deletion to Tasoko
   * Endpoint: Delete Package (PDF page 5)
   */
  static async sendPackageDeleted(packageData: IPackage): Promise<boolean> {
    try {
      if (!this.baseUrl || !this.apiToken) {
        return false;
      }

      const payload = this.formatPackagePayload(packageData);
      
      const response = await axios.post(
        `${this.baseUrl}/api/packages/delete`,
        [payload],
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': this.apiToken
          },
          timeout: 10000
        }
      );

      logger.info(`Package deletion sent to Tasoko: ${packageData.trackingNumber}`);
      return response.status === 200;

    } catch (error: any) {
      logger.error('Failed to send deletion to Tasoko:', error.message);
      return false;
    }
  }

  /**
   * Format package data to match Tasoko API specification (PDF page 3)
   */
  private static formatPackagePayload(pkg: any) {
    return {
      PackageID: pkg._id?.toString() || '',
      CourierID: pkg.courierId || '',
      ManifestID: pkg.manifestId || '',
      CollectionID: pkg.collectionId || '',
      TrackingNumber: pkg.trackingNumber,
      ControlNumber: pkg.controlNumber || '',
      FirstName: pkg.recipient?.name?.split(' ')[0] || '',
      LastName: pkg.recipient?.name?.split(' ').slice(1).join(' ') || '',
      UserCode: pkg.userCode,
      Weight: pkg.weight || 0,
      Shipper: pkg.shipper || '',
      EntryStaff: pkg.entryStaff || '',
      EntryDate: pkg.entryDate || new Date().toISOString().split('T')[0],
      EntryDateTime: pkg.entryDateTime || new Date().toISOString(),
      Branch: pkg.branch || '',
      Claimed: pkg.claimed || false,
      APIToken: this.apiToken,
      ShowControls: pkg.showControls || false,
      Description: pkg.description || '',
      HSCode: pkg.hsCode || '',
      Unknown: pkg.unknown || false,
      AIProcessed: pkg.aiProcessed || false,
      OriginalHouseNumber: pkg.originalHouseNumber || '',
      Cubes: pkg.cubes || 0,
      Length: pkg.dimensions?.length || 0,
      Width: pkg.dimensions?.width || 0,
      Height: pkg.dimensions?.height || 0,
      Pieces: pkg.pieces || 1,
      Discrepancy: pkg.discrepancy || false,
      DiscrepancyDescription: pkg.discrepancyDescription || '',
      ServiceTypeID: pkg.serviceTypeId || '',
      HazmatCodeID: pkg.hazmatCodeId || '',
      Coloaded: pkg.coloaded || false,
      ColoadIndicator: pkg.coloadIndicator || '',
      PackageStatus: pkg.packageStatus || 0,
      PackagePayments: pkg.packagePayments || ''
    };
  }
}
