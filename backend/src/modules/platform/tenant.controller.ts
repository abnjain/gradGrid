/**
 * GradGrid — Platform tenant controller
 */

import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../../shared/types';
import { tenantService } from './tenant.service';

function actor(req: AuthenticatedRequest) {
  return { id: req.user.id, roleName: req.user.roleName || req.user.userType };
}

function paramId(req: AuthenticatedRequest, key = 'id') {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

export class TenantController {
  async listOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const organizations = await tenantService.listOrganizations();
      res.status(httpStatus.OK).json({ success: true, data: { organizations } });
    } catch (error) {
      next(error);
    }
  }

  async getOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const organization = await tenantService.getOrganization(paramId(req));
      res.status(httpStatus.OK).json({ success: true, data: { organization } });
    } catch (error) {
      next(error);
    }
  }

  async createOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const organization = await tenantService.createOrganization(actor(req), req.body);
      res.status(httpStatus.CREATED).json({ success: true, data: { organization } });
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const organization = await tenantService.updateOrganization(actor(req), paramId(req), req.body);
      res.status(httpStatus.OK).json({ success: true, data: { organization } });
    } catch (error) {
      next(error);
    }
  }

  async listInstitutions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutions = await tenantService.listInstitutions();
      res.status(httpStatus.OK).json({ success: true, data: { institutions } });
    } catch (error) {
      next(error);
    }
  }

  async getInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institution = await tenantService.getInstitution(paramId(req));
      res.status(httpStatus.OK).json({ success: true, data: { institution } });
    } catch (error) {
      next(error);
    }
  }

  async createInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institution = await tenantService.createInstitution(actor(req), req.body);
      res.status(httpStatus.CREATED).json({ success: true, data: { institution } });
    } catch (error) {
      next(error);
    }
  }

  async updateInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institution = await tenantService.updateInstitution(actor(req), paramId(req), req.body);
      res.status(httpStatus.OK).json({ success: true, data: { institution } });
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await tenantService.listAcademicSessions(paramId(req));
      res.status(httpStatus.OK).json({ success: true, data: { sessions } });
    } catch (error) {
      next(error);
    }
  }

  async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const session = await tenantService.createAcademicSession(actor(req), paramId(req), req.body);
      res.status(httpStatus.CREATED).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  }
}
