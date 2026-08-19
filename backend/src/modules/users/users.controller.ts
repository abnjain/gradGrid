/**
 * GradGrid — User management controller
 */

import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../../shared/types';
import { BadRequestError } from '../../shared/errors';
import { usersService } from './users.service';

function actor(req: AuthenticatedRequest) {
  return { id: req.user.id, roleName: req.user.roleName || req.user.userType };
}

export class UsersController {
  async listInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.institutionId) {
        throw new BadRequestError('Select an institution context first');
      }
      const users = await usersService.listInstitutionUsers(req.user.institutionId);
      res.status(httpStatus.OK).json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  }

  async inviteInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.institutionId) {
        throw new BadRequestError('Select an institution context first');
      }
      const user = await usersService.inviteInstitutionUser(actor(req), req.user.institutionId, req.body);
      res.status(httpStatus.CREATED).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async setInstitutionActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.institutionId) {
        throw new BadRequestError('Select an institution context first');
      }
      const result = await usersService.setActive(actor(req), String(req.params.id), req.body.isActive, {
        type: 'institution',
        institutionId: req.user.institutionId,
      });
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async assignInstitutionRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.institutionId) {
        throw new BadRequestError('Select an institution context first');
      }
      const result = await usersService.assignInstitutionRole(
        actor(req),
        req.user.institutionId,
        String(req.params.id),
        req.body.roleName
      );
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listPlatform(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await usersService.listPlatformUsers();
      res.status(httpStatus.OK).json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  }

  async invitePlatform(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.invitePlatformUser(actor(req), req.body);
      res.status(httpStatus.CREATED).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async setPlatformActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await usersService.setActive(actor(req), String(req.params.id), req.body.isActive, {
        type: 'platform',
      });
      res.status(httpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
