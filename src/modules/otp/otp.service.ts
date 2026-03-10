import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import moment from 'moment';
import config from '../../config';
import { generateOtp } from '../../utils/otpGenerator';
import prisma from '../../shared/prisma';
import fs from 'fs';
import path from 'path';
import { sendEmail } from '../../utils/mailSender';

const verifyOtp = async (token: string, otp: string | number) => {

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }
  let decode;

  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as Secret,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Session has expired. Please try to submit OTP within 3 minute',
    );
  }

  const user = await prisma.user.findFirst({ where: { id: decode?.userId }, include: { auth: true } })

  if (!user || !user?.auth) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }
  if (new Date() > user?.auth?.expiredAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'OTP has expired. Please resend it',
    );
  }

  if (user?.auth?.otp_status) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already verified, need to login');
  }

  if (Number(otp) !== Number(user?.auth?.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  const updateUser = await prisma.user.update(
    {
      where: { id: user?.id },
      data: {
        auth: {
          update: {
            data: {
              otp: "0",
              expiredAt: moment().add(3, 'minute').toDate(),
              otp_status: true,
              isverified: true
            }
          }
        }

      }
    },
  )

  const jwtPayload = {
    role: user?.auth?.role,
    userId: updateUser?.id,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '7d', //7 days
  });

  return { user: updateUser, accessToken: accessToken };
};

const resendOtp = async (email: string) => {
  const user = await prisma.user.findFirst({ where: { email }, include: { auth: true } })

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(3, 'minute').toDate();

  const updateOtp = await prisma.user.update(
    {
      where: { id: user?.id },
      data: {
        auth: {
          update: {
            data: {
              otp,
              expiredAt: expiresAt,
              otp_status: false,
            }
          }
        }
      }
    }
  );

  if (!updateOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to resend OTP. Please try again later',
    );
  }

  const jwtPayload = {
    userId: user?.id,
    role: user?.auth?.role
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '3m',
  });

  const otpEmailPath = path.join(
    process.cwd(),
    'public',
    'view',
    'otp_mail.html'
  );

  if (user) {
    await sendEmail(
      user?.email,
      'Your One Time OTP',
      fs
        .readFileSync(otpEmailPath, 'utf8')
        .replace('{{otp}}', otp)
        .replace('{{email}}', user?.email),
    );
  }

  return token;
};

export const otpServices = {
  verifyOtp,
  resendOtp,
};
