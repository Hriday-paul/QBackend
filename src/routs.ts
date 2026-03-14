import express from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
import { jobRouts } from './modules/job/job.rout';
import { companyRouts } from './modules/company/company.rout';
import { applicationRouts } from './modules/application/application.rout';

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
        path: "/jobs",
        route: jobRouts
    },
    {
        path: "/companies",
        route: companyRouts
    },
    {
        path: "/applications",
        route: applicationRouts
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;