import express from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { jobRouts } from './modules/job/job.rout';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRouts,
    },
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path : "/jobs",
        route : jobRouts
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;