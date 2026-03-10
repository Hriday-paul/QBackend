import { Request, Response } from "express";
import { authService } from "./auth.service"
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
import { otpServices } from "../otp/otp.service";
import catchAsync from "../../utils/catchAsync";
import { uploadToS3 } from "../../utils/s3";

//create user
const createUser = catchAsync(async (req: Request, res: Response) => {

    const body = req.body;
    body.businessCard = {};

    const files = req.files as {
        business_card_front?: Express.Multer.File[];
        business_card_back?: Express.Multer.File[]
    };

    const business_card_front = files.business_card_front?.[0];
    const business_card_back = files.business_card_back?.[0];

    const uploadPromises: Promise<any>[] = [];

    if (business_card_front) {
        uploadPromises.push(
            uploadToS3({
                file: business_card_front,
                fileName: `images/personal-card/${Date.now()}-${Math.random()}-${business_card_front.originalname}`,
            })
        );
    }

    if (business_card_back) {
        uploadPromises.push(
            uploadToS3({
                file: business_card_back,
                fileName: `images/personal-card/${Date.now()}-${Math.random()}-${business_card_back.originalname}`,
            })
        );
    }

    const [personal_card_front_link, personal_card_back_link] = await Promise.all(uploadPromises);

    if(personal_card_front_link){
        body.businessCard.frontUrl = personal_card_front_link?.url;
        body.businessCard.frontKey = personal_card_front_link?.key;
    }
    if(personal_card_back_link){
        body.businessCard.backUrl = personal_card_back_link?.url;
        body.businessCard.backKey = personal_card_back_link?.key;
    }

    const result = await authService.createUser(body);

    // request to send otp
    let otptoken;
    if (!result?.auth?.isverified) {
        otptoken = await otpServices.resendOtp(result?.email);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'user register successfully',
        data: { otpToken: otptoken },
    });
})

//login user
const loginUser = catchAsync(async (req: Request, res: Response) => {

    const result = await authService.loginUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Logged in successfully',
        data: result,
    });
})

//social login
const socialLogin = catchAsync(async (req: Request, res: Response) => {

    const result = await authService.socialLogin(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Logged in successfully',
        data: result,
    });
})

const adminLogin = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.adminLogin(req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Logged in successfully',
        data: result,
    });
})

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.changePassword(req?.user?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password changed successfully',
        data: result,
    });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req?.body?.email);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'An OTP sent to your email',
        data: result,
    });
});

//reset password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = req?.headers?.authorization;
    const result = await authService.resetPassword(
        token as string,
        req?.body,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password reset successfully',
        data: result,
    });
});


// refresh token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Access token retrieved successfully',
        data: result,
    });
});

export const authController = {
    createUser,
    loginUser,
    socialLogin,
    adminLogin,
    changePassword,
    resetPassword,
    forgotPassword,
    refreshToken
}