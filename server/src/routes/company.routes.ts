import * as company from '../controllers/company.controller';
import { Router } from 'express';
import { authorize } from '../middlewares/rbac.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', protect, authorize('employer'), company.create);
router.get('/', company.getAll);
router.get('/:id', company.getOne);
router.put('/:id', protect, authorize('employer'), company.update);
router.delete('/:id', protect, authorize('employer'), company.remove);

export default router;