import express, { NextFunction, Request, Response } from 'express';
import { authRouts } from './modules/auth/auth.rout';
import { userRoutes } from './modules/user/user.rout';
// import { paymentsRoutes } from './modules/payments/payments.route';
// import { dashboardRouts } from './modules/dasboard/dashboard.rout';
import { notificationRoutes } from './modules/notification/notification.routes';
import { settingsRoutes } from './modules/settings/settings.rout';
import { scan_card_routs } from './modules/scanCard/scan_card.rout';
import { myBusinesscardRouts } from './modules/sharableCard/sharableCard.rout';

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
        path: '/notifications',
        route: notificationRoutes,
    },
    {
        path: '/setting',
        route: settingsRoutes,
    },
    {
        path: '/scan-cards',
        route: scan_card_routs,
    },
    {
        path: '/my-business-card',
        route: myBusinesscardRouts,
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;