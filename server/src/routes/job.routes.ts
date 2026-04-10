import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authorize } from '../middlewares/rbac.middleware';
import { protect } from '../middlewares/auth.middleware';


const router = Router();

router.post("/",protect,authorize('employer'),jobController.create);
router.get("/", jobController.getAll);
router.get("/:id",jobController.getOne);
router.put("/:id",protect,authorize('employer'),jobController.update);
router.delete("/:id",protect,authorize('employer'),jobController.remove);
router.patch("/:id/submit",protect,authorize('employer'),jobController.submit);
router.patch("/:id/approve",protect,authorize('admin'),jobController.approve)
export default router;