/**
 * GradGrid — Platform Signup Request Controller
 */

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { SignupRequestService } from './signup-request.service';
import { AuthenticatedRequest } from '../../shared/types';

const service = new SignupRequestService();

export class SignupRequestController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
      const requests = await service.listRequests(status);
      res.status(httpStatus.OK).json({ success: true, data: { requests } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await service.getRequest(String(req.params.id));
      res.status(httpStatus.OK).json({ success: true, data: { request } });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const result = await service.approveRequest(String(req.params.id), authUser.id);
      res.status(httpStatus.OK).json({
        success: true,
        data: result,
        message: 'Signup request approved and institution provisioned',
      });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthenticatedRequest).user;
      const result = await service.rejectRequest(
        String(req.params.id),
        authUser.id,
        req.body.reason
      );
      res.status(httpStatus.OK).json({
        success: true,
        data: result,
        message: 'Signup request rejected',
      });
    } catch (error) {
      next(error);
    }
  }
}
