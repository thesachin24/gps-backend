/**
 * @file This file define the app routes for all end-points.
 */
import express from 'express';
const router = express.Router({ mergeParams: true });
const swagger = require('swagger-ui-express');
import swaggerConfig from '../config/swagger';
import authRoutes from './authRoutes';

router.use('/api-docs', swagger.serve, swagger.setup(swaggerConfig));

router.use('/auth', authRoutes);
export default router;
