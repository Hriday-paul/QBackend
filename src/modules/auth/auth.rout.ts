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
import { req_rate_limit } from "../../middleware/request_limit";

const router = Router();

router.post('/create',
    req_rate_limit(),
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
    req_rate_limit(),
    loginAccountValidator,
    req_validator(),
    authController.loginUser
)

router.post('/admin/login',
    req_rate_limit(),
    loginAccountValidator,
    req_validator(),
    authController.adminLogin
)

router.patch(
    '/change-password',
    req_rate_limit(),
    changePasswordValidator,
    req_validator(),
    auth(Role.ADMIN, Role.USER),
    authController.changePassword,
);

router.post('/refresh',
    req_rate_limit(),
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
    req_rate_limit({
        milisec: 1 * 60 * 1000, // 1 minutes
        req_limit: 1, // 1 requests per IP
        message: 'Only 1 request allowed per minutes. please try again after a minute',
    }),
    otpResendValidator,
    req_validator(),
    otpControllers.resendOtp,
);

router.post('/forgot-password',
    req_rate_limit({
        milisec: 1 * 60 * 1000, // 1 minutes
        req_limit: 1, // 1 requests per IP
        message: 'Only 1 request allowed per minutes. please try again after a minute',
    }),
    forgotPasswordValidator, req_validator(), authController.forgotPassword);

router.patch('/reset-password',
    req_rate_limit(),
    resetPasswordValidator, req_validator(), authController.resetPassword);

export const authRouts = router