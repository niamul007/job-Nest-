import { Router } from "express";
import * as controller from '../controllers/auth.controller';
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();
/**
 * Auth routes — the only routes in the app with NO protect middleware.
 * These endpoints create tokens — they can't require a token to access.
 * Both routes validate request body before hitting the controller.
 * Validation is critical here — these are fully public endpoints.
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthData'
 *       400:
 *         description: Validation error or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * POST /api/auth/register
 * Public — no authentication required.
 * Validates body against registerSchema (name, email, password, role).
 * Returns JWT token + safe user object on success.
 * Service checks for duplicate email before creating account.
 */

router.post('/register', validate(registerSchema), controller.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful — copy the token and use it in Authorize
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthData'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * POST /api/auth/register
 * Public — no authentication required.
 * Validates body against registerSchema (name, email, password, role).
 * Returns JWT token + safe user object on success.
 * Service checks for duplicate email before creating account.
 */
router.post('/login', validate(loginSchema), controller.login);

export default router;
