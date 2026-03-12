import AppError from "../../error/AppError"
import httpStatus from 'http-status'
import bcrypt from 'bcrypt'
import { createToken, verifyToken } from "./auth.utils"
import config from "../../config"
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { generateOtp } from "../../utils/otpGenerator"
import moment from "moment"
import prisma from "../../shared/prisma"
import fs from 'fs';
import path from "path"
import { sendEmail } from "../../utils/mailSender"
import generateRandomString from "../../utils/generateRandomString"
import { Role, User } from "../../../generated/prisma/client"

type TUserMore = {
    password: string
}

const createUser = async (req_body: User & TUserMore) => {

    const { fname, lname, email, phone, password, address } = req_body;

    let isExist = await prisma.user.findFirst({ where: { email }, include: { auth: true } });

    //check user is exist or not
    if (isExist && isExist?.auth?.isverified) {
        throw new AppError(
            httpStatus.CONFLICT,
            'User already exists with this email address',
        );
    }

    // creat encrypted password
    const PEPPER = config.password_pepper;
    const hashedPassword = await bcrypt.hash(password + PEPPER, 15);

    const body = {
        fname, lname, email, phone, address
    }

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            ...body,
            auth: {
                upsert: {
                    update: { password: hashedPassword, },
                    create: { password: hashedPassword, email }
                }
            }
        },
        create: {
            ...body,
            auth: {
                create: {
                    email,
                    password: hashedPassword,
                }
            }
        },
        include: { auth: true }
    });

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
    }

    return user;
};

// Login
const loginUser = async (payload: { email: string, password: string, fcmToken?: string }) => {

    const user = await prisma.user.findFirst({
        where: {
            email: payload?.email,
            isDeleted: false,
            auth: { role: { not: Role.ADMIN } }
        },
        include: { auth: true }
    });

    if (!user) {
        // If user not found, throw error
        throw new AppError(httpStatus.NOT_FOUND, 'Account not found');
    }

    else {
        if (!user?.auth?.status) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked');
        }

        if (user?.auth?.isDeleted) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account is deleted');
        }

        if (!user?.auth?.isverified) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Your account is not verified');
        }

        // Handle verify password
        // const passwordMatched = await bcrypt.compare(payload?.password, user?.auth?.password);
        const passwordMatched = await bcrypt.compare(payload?.password + config.password_pepper, user?.auth?.password);

        if (!passwordMatched) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Please check your credentials and try again');
        }


        // Update FCM token if provided
        let updatedUser = user as User;
        if (payload?.fcmToken) {
            updatedUser = await prisma.user.update({
                where: { email: payload?.email },
                data: { fcmToken: payload.fcmToken },
            })
        }

        // Send notification if FCM token exists and user notification is unabled

        // Choose the most up-to-date FCM token to use
        // const tokenToUse = updatedUser?.fcmToken;

        // sendNotification(tokenToUse ? [tokenToUse] : [], {
        //     title: `Login successfully`,
        //     message: `New user login to your account`,
        //     receiverId: updatedUser.id,
        //     senderId: updatedUser.id,
        // }, updatedUser?.notification);


    }

    //update last login time
    await prisma.auth.update({
        where: { userId: user?.id },
        data: { last_loginAt: new Date() },
    })

    const jwtPayload: { userId: string; role: Role } = {
        userId: user?.id,
        role: user?.auth?.role
    };

    const role = user?.auth?.role

    const userDoc = (user as any);
    delete userDoc.auth;

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        60 * 60 * 24 * 7, //7 days
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        60 * 60 * 24 * 30, // 30 days
    );

    return {
        user: { ...userDoc, role },
        accessToken,
        refreshToken,
    };
};

//admin login
const adminLogin = async (payload: { email: string, password: string }) => {

    const user = await prisma.user.findFirst({ where: { email: payload?.email, isDeleted: false, auth: { role: Role.ADMIN } }, include: { auth: true } });

    if (!user) {
        // If user not found, throw error
        throw new AppError(httpStatus.NOT_FOUND, 'admin not found');
    } else {

        if (!user?.auth?.isverified) {
            throw new AppError(httpStatus.FORBIDDEN, 'Your account is not verified');
        }

        // Handle verify password
        const passwordMatched = await bcrypt.compare(payload?.password, user?.auth?.password);

        if (!passwordMatched) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Please check your credentials and try again');
        }
    }

    await prisma.auth.update({
        where: { userId: user?.id },
        data: { last_loginAt: new Date() },
    })

    const userDoc = (user as any);
    delete userDoc.auth;


    const jwtPayload: { userId: string; role: Role } = {
        userId: user?.id,
        role: user?.auth?.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        60 * 60 * 24 * 7, //7 days
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        60 * 60 * 24 * 30, //  30 days
    );

    return {
        user: userDoc,
        accessToken,
        refreshToken,
    };
};

// Change password
const changePassword = async (id: string, payload: { oldPassword: string, newPassword: string, confirmPassword: string }) => {

    const user = await prisma.user.findFirst({ where: { id }, include: { auth: true } });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const passwordMatched = await bcrypt.compare(payload?.oldPassword + config.password_pepper, user?.auth?.password as string);

    if (!passwordMatched) {
        throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
    }
    if (payload?.newPassword !== payload?.confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'New password and confirm password do not match',
        );
    }

    // creat encrypted password
    const PEPPER = config.password_pepper;
    const hashedPassword = await bcrypt.hash(payload?.newPassword + PEPPER, 15);


    const result = await prisma.user.update({
        where: { id },
        data: {
            auth: {
                update: {
                    data: {
                        password: hashedPassword,
                        passwordChangedAt: new Date(),
                    }
                }
            }
        }
    }
    );

    return result;
};


// Forgot password
const forgotPassword = async (email: string) => {
    const user = await prisma.user.findFirst({ where: { email }, include: { auth: true } });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const jwtPayload = {
        userId: user?.id,
        role: user?.auth?.role
    };

    const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
        expiresIn: '3m',
    });

    const currentTime = new Date();
    const otp = generateOtp();
    const expiresAt = moment(currentTime).add(3, 'minute').toDate();

    await prisma.user.update({
        where: { id: user?.id },
        data: {
            auth: {
                update: {
                    otp,
                    expiredAt: expiresAt,
                    otp_status: false
                }
            }
        }
    });

    const otpEmailPath = path.join(
        process.cwd(),
        'public',
        'view',
        'forgot_pass_mail.html'
    );

    await sendEmail(
        user?.email,
        'Your reset password OTP is',
        fs
            .readFileSync(otpEmailPath, 'utf8')
            .replace('{{otp}}', otp)
            .replace('{{email}}', user?.email),
    );


    return { email, token };
};


// Reset password
const resetPassword = async (token: string, payload: { newPassword: string, confirmPassword: string }) => {
    let decode;
    try {
        decode = jwt.verify(
            token,
            config.jwt_access_secret as string,
        ) as JwtPayload;
    } catch (err) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'Session has expired. Please try again',
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: decode?.userId }, select: {
            auth: true
        }
    })

    if (!user || !user?.auth) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (new Date() > user?.auth?.expiredAt) {
        throw new AppError(httpStatus.FORBIDDEN, 'Session has expired');
    }
    if (!user?.auth?.status) {
        throw new AppError(httpStatus.FORBIDDEN, 'OTP is not verified yet');
    }
    if (payload?.newPassword !== payload?.confirmPassword) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'New password and confirm password do not match',
        );
    }

    // creat encrypted password
    const PEPPER = config.password_pepper;
    const hashedPassword = await bcrypt.hash(payload?.newPassword + PEPPER, Number(config.bcrypt_salt_rounds));

    const result = await prisma.user.update({
        where: { id: decode?.userId },
        data: {
            auth: {
                update: {
                    password: hashedPassword,
                    otp: "0",
                    otp_status: true,
                }
            }
        }
    });

    return result;
};


// Refresh token
const refreshToken = async (token: string) => {
    // Checking if the given token is valid
    const decoded = verifyToken(token, config.jwt_refresh_secret as string);
    const { userId } = decoded;
    const user = await prisma.user.findFirst({ where: userId, include: { auth: true } });

    if (!user || !user?.auth) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const isDeleted = user?.auth?.isDeleted;

    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
    }

    const jwtPayload = {
        userId: user?.id,
        role: user.auth?.role,
    };

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        60 * 60 * 24 * 7, //7 days
    );

    const refreshToken = createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        60 * 60 * 24 * 30, //30 days
    );

    return {
        accessToken,
        refreshToken
    };
};


export const authService = {
    createUser,
    loginUser,
    forgotPassword,
    changePassword,
    resetPassword,
    refreshToken,
    adminLogin
}