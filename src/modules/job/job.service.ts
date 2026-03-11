import { EmploymentType, Job, JobCategory, JobStatus, JobType, Prisma } from "../../../generated/prisma/client";
import { paginationHelper, TPaginationOptions } from "../../helper/pagination.helper";
import prisma from "../../shared/prisma";

// create new job
export const addNewJob = async(payload : Job)=>{
    // destructure non adable fields
    const {createdAt, updatedAt, status, ...moreFields} = payload;
    const res = await prisma.job.create({data : moreFields});
    return res;
}

const allJobs = async (query: Record<string, unknown>, options: TPaginationOptions) => {

    const AndConditions: Prisma.JobWhereInput[] = [{status : JobStatus.ACTIVE}];
    const { limit, skip, sortBy, sortOrder, page } = paginationHelper.calculatePagination(options);

    const { searchTerm, job_type, employment_type, division, education, category} = query;

    if (searchTerm) {
        AndConditions.push({
            OR: [
                {
                    title: {
                        contains: searchTerm as string,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: searchTerm as string,
                        mode: "insensitive",
                    },
                }
            ],
        });
    }

    if (category) {
        const splitCategory = (category as string).split(",");
        AndConditions.push({
            category: {
                in : splitCategory as JobCategory[]
            },
        });
    }

    if (job_type) {
        const splitJob_type = (job_type as string).split(",");
        AndConditions.push({
            job_type: {
                in : splitJob_type as JobType[]
            },
        });
    }

    if (employment_type) {
        const splitEmployment_type = (employment_type as string).split(",");
        AndConditions.push({
            employment_type: {
                in : employment_type as EmploymentType[]
            },
        });
    }

    if (division) {
        const splitDivision = (division as string).split(",");
        AndConditions.push({
            division: {
                in : splitDivision
            },
        });
    }
    if (education) {
        const splitEducation = (education as string).split(",");
        AndConditions.push({
            education: {
                hasSome : splitEducation
            },
        });
    }

     const whereConditions: Prisma.JobWhereInput = AndConditions.length > 0 ? { AND: AndConditions } : {};

    const result = await prisma.job.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            company : true,
        },
    })

    const total = await prisma.job.count({
        where: whereConditions,
    });

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

export const jobService = {
    addNewJob,
    allJobs
}