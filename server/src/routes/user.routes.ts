import { Router } from 'express'
import { protect } from '../middlewares/auth.middleware'
import { authorize } from '../middlewares/rbac.middleware'
import { UserRole } from '../types'
import { pool } from '../config/db'
import ApiResponse from '../utils/ApiResponse'

const router = Router()

router.get('/', protect, authorize(UserRole.Admin), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.status(200).json(ApiResponse.success('Users fetched', result.rows))
  } catch (error) {
    next(error)
  }
})

export default router