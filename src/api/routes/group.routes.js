import groupController from "../controller/group.controller.js"
import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, groupController.createGroup);
router.get('/:groupId', authMiddleware, groupController.getGroupById);
router.post('/:groupId/members', authMiddleware, groupController.addMembersToGroup);
router.delete('/:groupId/members', authMiddleware, groupController.removeMembersFromGroup);
router.get('/:groupId/isMember', authMiddleware, groupController.isMemberOfGroup);

export default router;