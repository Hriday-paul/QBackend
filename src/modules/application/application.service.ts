import { JobApplication, Prisma } from "../../../generated/prisma/client";
import { paginationHelper, TPaginationOptions } from "../../helper/pagination.helper";
import prisma from "../../shared/prisma";

const addNewApplication = async (payload: JobApplication) => {
    const res = await prisma.jobApplication.create({ data: payload });
    return res;
}
const allApplications = async (options: TPaginationOptions) => {

    const { limit, skip, sortBy, sortOrder, page } = paginationHelper.calculatePagination(options);

    const result = await prisma.jobApplication.findMany({
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include : {
            job : true
        }
    })

    // calculate total job count, for pagination
    const total = await prisma.job.count({});

    return {
        meta: {
            total,
            totalPage: Math.ceil(total / limit),
            page,
            limit,
        },
        data: result,
    };

}

export const applicationService = {
    addNewApplication,
    allApplications
}