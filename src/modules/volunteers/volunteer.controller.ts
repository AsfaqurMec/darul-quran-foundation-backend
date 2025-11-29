import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { volunteerService } from './volunteer.service';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';
import { asyncHandler } from '../common/middleware/async.handler';
import { getFileUrl } from '../uploads/upload.middleware';
import { config } from '../../config';

export class VolunteerController {
  /**
   * Create a new volunteer application
   * POST /api/v1/volunteers
   */
  createVolunteerApplication = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const profileImageFile = req.file as Express.Multer.File | undefined;

    // Handle profile image file upload
    let profileImageUrl: string | null = null;
    if (profileImageFile) {
      profileImageUrl = getFileUrl(profileImageFile.filename);
    }

    // Parse boolean fields from string to boolean
    const fbNotUsed = req.body.fbNotUsed === 'true' || req.body.fbNotUsed === true;
    const wasVolunteer = req.body.wasVolunteer === 'true' || req.body.wasVolunteer === true;

    // Parse previousBeneficiariesCount from string to number
    let previousBeneficiariesCount: number | null = null;
    if (req.body.previousBeneficiariesCount) {
      const parsed = parseInt(req.body.previousBeneficiariesCount, 10);
      previousBeneficiariesCount = isNaN(parsed) ? null : parsed;
    }

    const volunteer = await volunteerService.createVolunteerApplication({
      name: req.body.name,
      fatherName: req.body.fatherName,
      mobileNumber: req.body.mobileNumber,
      mobileCountryCode: req.body.mobileCountryCode || '+880',
      email: req.body.email,
      currentProfession: req.body.currentProfession,
      organizationName: req.body.organizationName,
      workplaceAddress: req.body.workplaceAddress,
      currentDivision: req.body.currentDivision,
      currentDistrict: req.body.currentDistrict,
      currentUpazila: req.body.currentUpazila,
      currentUnion: req.body.currentUnion,
      currentFullAddress: req.body.currentFullAddress,
      permanentDivision: req.body.permanentDivision,
      permanentDistrict: req.body.permanentDistrict,
      permanentUpazila: req.body.permanentUpazila,
      permanentUnion: req.body.permanentUnion,
      permanentFullAddress: req.body.permanentFullAddress,
      overseasCountry: req.body.overseasCountry || null,
      overseasAddress: req.body.overseasAddress || null,
      facebookId: req.body.facebookId || null,
      linkedinId: req.body.linkedinId || null,
      whatsappNumber: req.body.whatsappNumber || null,
      whatsappCountryCode: req.body.whatsappCountryCode || '+880',
      telegramNumber: req.body.telegramNumber || null,
      telegramCountryCode: req.body.telegramCountryCode || '+880',
      fbNotUsed,
      educationMedium: req.body.educationMedium,
      educationLevel: req.body.educationLevel,
      currentClassYear: req.body.currentClassYear,
      departmentDegree: req.body.departmentDegree || null,
      lastInstitutionName: req.body.lastInstitutionName,
      wasVolunteer,
      previousProjectName: req.body.previousProjectName || null,
      previousProjectLocation: req.body.previousProjectLocation || null,
      previousBatch: req.body.previousBatch || null,
      previousBeneficiariesCount,
      profileImage: profileImageUrl,
      status: 'pending',
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: volunteer,
      message: 'Volunteer application created successfully',
    });
  });

  /**
   * Get all volunteer applications with pagination and filters
   * GET /api/v1/volunteers
   */
  getAllVolunteerApplications = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const searchTerm = req.query.searchTerm as string | undefined;

    const filters = {
      ...(status && { status }),
      ...(searchTerm && { searchTerm }),
    };

    const result = await volunteerService.getAllVolunteerApplications(filters, { page, limit });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  /**
   * Update volunteer application status
   * PATCH /api/v1/volunteers/:id/status
   */
  updateVolunteerApplicationStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const volunteer = await volunteerService.updateVolunteerApplicationStatus(id, status);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: volunteer,
      message: 'Status updated successfully',
    });
  });

  /**
   * Delete volunteer application
   * DELETE /api/v1/volunteers/:id
   */
  deleteVolunteerApplication = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get volunteer to delete associated profile image file
    const volunteer = await volunteerService.getVolunteerApplicationById(id);

    // Delete profile image file if exists
    if (volunteer.profileImage) {
      const imagePath = volunteer.profileImage.replace('/api/uploads/', '').replace('/uploads/', '');
      const filePath = path.resolve(process.cwd(), config.upload.dir, imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting profile image file:', err);
        });
      }
    }

    await volunteerService.deleteVolunteerApplication(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Volunteer application deleted successfully',
    });
  });
}

export const volunteerController = new VolunteerController();

