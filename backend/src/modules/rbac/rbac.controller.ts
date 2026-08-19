/**
 * GradGrid — RBAC Controller
 */

import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../../shared/types';
import { BadRequestError } from '../../shared/errors';
import { roleService } from './role.service';
import { permissionService } from './permission.service';

export class RbacController {
  async listPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const scope = req.user.userType === 'platform' ? 'platform' : 'institution';
      const modules = await permissionService.getRegistry(scope);
      res.status(httpStatus.OK).json({ success: true, data: { modules } });
    } catch (error) {
      next(error);
    }
  }

  async listRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = this.scopeInstitutionId(req);
      const roles = await roleService.list(institutionId);
      res.status(httpStatus.OK).json({ success: true, data: { roles } });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = this.scopeInstitutionId(req);
      const role = await roleService.create(
        { id: req.user.id, roleName: req.user.roleName || req.user.userType, institutionId },
        institutionId,
        req.body
      );
      res.status(httpStatus.CREATED).json({ success: true, data: { role } });
    } catch (error) {
      next(error);
    }
  }

  private roleId(req: AuthenticatedRequest): string {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
  }

  async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = this.scopeInstitutionId(req);
      const role = await roleService.update(
        { id: req.user.id, roleName: req.user.roleName || req.user.userType },
        this.roleId(req),
        institutionId,
        req.body
      );
      res.status(httpStatus.OK).json({ success: true, data: { role } });
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = this.scopeInstitutionId(req);
      await roleService.delete(
        { id: req.user.id, roleName: req.user.roleName || req.user.userType },
        this.roleId(req),
        institutionId
      );
      res.status(httpStatus.OK).json({ success: true, message: 'Role deleted' });
    } catch (error) {
      next(error);
    }
  }

  async replacePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = this.scopeInstitutionId(req);
      const role = await roleService.replacePermissions(
        { id: req.user.id, roleName: req.user.roleName || req.user.userType },
        this.roleId(req),
        institutionId,
        req.body.permissionKeys
      );
      res.status(httpStatus.OK).json({ success: true, data: { role } });
    } catch (error) {
      next(error);
    }
  }

  private scopeInstitutionId(req: AuthenticatedRequest): string | null {
    if (req.user.userType === 'platform') {
      return null;
    }
    if (!req.user.institutionId) {
      throw new BadRequestError('Select an institution before managing roles');
    }
    return req.user.institutionId;
  }
}
