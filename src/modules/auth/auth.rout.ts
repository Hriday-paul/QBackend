import { Router } from "express";
import { authController } from "./auth.controller";
import { changePasswordValidator, createAccountValidator, forgotPasswordValidator, loginAccountValidator, refreshTokenValidator, resetPasswordValidator, social_loginAccountValidator } from "./auth.validator";
import req_validator from "../../middleware/req_validation";
import { otpResendValidator, otpVerifyValidator } from "../otp/otp.validation";
import { otpControllers } from "../otp/otp.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { document_Upload } from "../../utils/s3";
import parseData from "../../middleware/parseData";
import { rateLimit } from 'express-rate-limit';

const router = Router();

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 5, // 5 requests per IP
    message: 'Too many request has been made. please try again after a minute',
});

router.post('/create',
    apiLimiter,
    document_Upload.fields([
        { name: 'business_card_front' },
        { name: 'business_card_back' }
    ]),
    parseData(),
    createAccountValidator,
    req_validator(),
    authController.createUser
)

router.post('/login',
    apiLimiter,
    loginAccountValidator,
    req_validator(),
    authController.loginUser
)

router.post('/social-login',
    social_loginAccountValidator,
    req_validator(),
    authController.socialLogin
)

router.post('/admin/login',
    apiLimiter,
    loginAccountValidator,
    req_validator(),
    authController.adminLogin
)

router.patch(
    '/change-password',
    apiLimiter,
    changePasswordValidator,
    req_validator(),
    auth(Role.ADMIN, Role.USER),
    authController.changePassword,
);

router.post('/refresh',
    apiLimiter,
    refreshTokenValidator,
    req_validator(),
    authController.refreshToken
)

router.post(
    '/verify-otp',
    otpVerifyValidator,
    req_validator(),
    otpControllers.verifyOtp,
);

router.post(
    '/resend-otp',
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 2, // 1 requests per IP
        message: 'Only 2 request allowed per minutes. please try again after a minute',
    }),
    otpResendValidator,
    req_validator(),
    otpControllers.resendOtp,
);

router.post('/forgot-password',
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minutes
        max: 1, // 1 requests per IP
        message: 'Only 1 request allowed per minutes. please try again after a minute',
    }),
    forgotPasswordValidator, req_validator(), authController.forgotPassword);

router.patch('/reset-password',
    apiLimiter,
    resetPasswordValidator, req_validator(), authController.resetPassword);

export const authRouts = router