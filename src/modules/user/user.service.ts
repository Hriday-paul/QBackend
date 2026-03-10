import { Prisma, User } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../error/AppError";
import { paginationHelper, TPaginationOptions } from "../../helper/pagination.helper";
import prisma from "../../shared/prisma";
import httpStatus from 'http-status'

// update user profile
const updateProfile = async (payload: User, userId: string, image?: { url: string, key: string }) => {

    const { phone, fname, lname, fcmToken, address, countries, profession } = payload

    const updateFields: Partial<User> = { phone, fname, lname, fcmToken, address, countries, profession };

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof User] === undefined || updateFields[key as keyof User] === null) {
            delete updateFields[key as keyof User];
        }
    });

    // check updated field found or not
    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const data: any = {
        ...updateFields,
    };

    if (image) {
        data.picture = {
            upsert: {
                update: image,   // update existing picture
                create: image    // create new picture if not exists
            }
        };
    }

    const result = await prisma.user.update({ where: { id: userId }, data })

    return result
}

//get all users
const allUsers = async (query: Record<string, unknown>, options: TPaginationOptions) => {

    const AndConditions: Prisma.UserWhereInput[] = [{ isDeleted: false, auth: { role: { not: Role.ADMIN } } }];
    const { limit, skip, sortBy, sortOrder, page } = paginationHelper.calculatePagination(options);

    const { searchTerm, role } = query;

    if (searchTerm) {
        AndConditions.push({
            OR: [
                {
                    fname: {
                        contains: searchTerm as string,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: searchTerm as string,
                        mode: "insensitive",
                    },
                },
                {
                    phone: {
                        contains: searchTerm as string,
                        mode: "insensitive",
                    },
                }
            ],
        });
    }

    if (role) {
        AndConditions.push({
            auth: {
                role
            }
        });
    }

    const whereConditions: Prisma.UserWhereInput = AndConditions.length > 0 ? { AND: AndConditions } : {};

    const result = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            auth: { select: { status: true } },
            picture: true,
        },
    })

    const total = await prisma.user.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
}

const getUserById = async (id: string) => {
    const result = await prisma.user.findFirst({ where: { id }, include: { picture: true, businessCard: true } });
    return result;
};

//user status update
const status_update_user = async (payload: { status: boolean }, id: string) => {

    const result = await prisma.user.update({
        where: {
            id,
            auth: { role: { not: Role.ADMIN } }
        },
        data: {
            auth: { update: { data: { status: payload?.status } } }
        }
    })

    return result
}

const deletemyAccount = async (userId: string) => {

    const exist = await prisma.user.findFirst({ where: { id: userId } });

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'User not found',
        );
    }

    const res = await prisma.user.update({
        where: { id: userId, auth: { role: { not: Role.ADMIN } } },
        data: { isDeleted: true }
    });

    return res;
}

const userDetails = async (userId: string) => {
    const res = await prisma.user.findFirst({ where: { id: userId }, include: { picture: true, businessCard: true } });
    return res;
}

const UpdateNotification = async (payload: { status: boolean, fcmToken?: string }, userId: string) => {

    const res = await prisma.user.update({
        where: { id: userId },
        data: {
            notification: payload?.status,
            fcmToken: payload?.fcmToken
        }
    });
    return res;

}

type ProfileCompletionResult = {
    completion: number;      // 0-100
    missingFields: string[]; // list of incomplete fields
};

const getProfileCompletion = async (userId: string): Promise<ProfileCompletionResult> => {

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Account not found");
    }

    type FieldConfig = { weight: number; label?: string };
    const FIELD_CONFIG: Record<keyof any, FieldConfig> = {
        fname: { weight: 10, label: "First Name" },
        lname: { weight: 5, label: "Last Name" },
        email: { weight: 10, label: "Email" },
        phone: { weight: 10, label: "Phone" },
        countries: { weight: 5, label: "Country" },
        address: { weight: 10, label: "Address" },
        profession: { weight: 10, label: "Profession" },
        picture: { weight: 15, label: "Profile Picture" },
        businessCard: { weight: 25, label: "Business Card" },
    };

    let filledWeight = 0;
    const missingFields: string[] = [];

    // total weight is sum of all field weights
    const totalWeight = Object.values(FIELD_CONFIG).reduce(
        (acc, field) => acc + field.weight,
        0
    );

    // iterate over FIELD_CONFIG
    for (const key in FIELD_CONFIG) {
        const fieldKey = key as keyof User;
        const { weight, label } = FIELD_CONFIG[fieldKey]!;
        const value = user[fieldKey];

        const isEmpty = value === null || value === undefined || (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
            missingFields.push(label!);
        } else {
            filledWeight += weight;
        }
    }

    const completion = Math.min(Math.round((filledWeight / totalWeight) * 100), 100);

    return { completion, missingFields };
};

export const userService = {
    updateProfile,
    getUserById,
    allUsers,
    status_update_user,
    deletemyAccount,
    userDetails,
    getProfileCompletion,
    UpdateNotification,
}