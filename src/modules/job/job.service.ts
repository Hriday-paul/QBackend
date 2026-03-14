import httpStatus from 'http-status';
import { Company, EmploymentType, Job, JobCategory, JobStatus, JobType, Prisma } from "../../../generated/prisma/client";
import AppError from "../../error/AppError";
import { paginationHelper, TPaginationOptions } from "../../helper/pagination.helper";
import prisma from "../../shared/prisma";

// create new job
export const addNewJob = async (payload: Job) => {
    // destructure non adable fields
    const { createdAt, updatedAt, status, isFeature, ...moreFields } = payload;

    //checking company is exist or not
    const company = await prisma.company.findFirst({ where: { id: payload?.companyId } });
    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company does not exist")
    }

    // finally, save job to db
    const res = await prisma.job.create({ data: moreFields });
    return res;
}

// find all jobs with filter
const allJobs = async (query: Record<string, unknown>, options: TPaginationOptions) => {

    const AndConditions: Prisma.JobWhereInput[] = [{ status: JobStatus.ACTIVE }];
    const { limit, skip, sortBy, sortOrder, page } = paginationHelper.calculatePagination(options);

    const { searchTerm, job_type, employment_type, division, education, category } = query;

    // added search string to the query
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

    // added filter fields to the query
    if (category) {
        const splitCategory = (category as string).split(",");
        AndConditions.push({
            category: {
                in: splitCategory as JobCategory[]
            },
        });
    }

    if (job_type) {
        const splitJob_type = (job_type as string).split(",");
        AndConditions.push({
            job_type: {
                in: splitJob_type as JobType[]
            },
        });
    }

    if (employment_type) {
        const splitEmployment_type = (employment_type as string).split(",");
        AndConditions.push({
            employment_type: {
                in: splitEmployment_type as EmploymentType[]
            },
        });
    }

    if (division) {
        const splitDivision = (division as string).split(",");
        AndConditions.push({
            division: {
                in: splitDivision
            },
        });
    }
    if (education) {
        const splitEducation = (education as string).split(",");
        AndConditions.push({
            education: {
                hasSome: splitEducation
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
            company: true,
        },
    })

    // calculate total job count, for pagination
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

//job details
const jobDetails = async (jobId: string) => {
    const job = await prisma.job.findFirst({
        where: { id: jobId }, include: {
            company: true
        }
    })

    return job;
}

// update job
export const updateJob = async (jobId: string, payload: Job & { company: Company }) => {
    // destructure non editable fields
    const { createdAt, updatedAt, status, isFeature, company, ...moreFields } = payload;
    const res = await prisma.job.update({ where: { id: jobId }, data: moreFields });
    return res;
}

//delete a job
const deleteJob = async (jobId: string) => {
    //check the job is exist or not
    const existJob = await prisma.job.findFirst({ where: { id: jobId } });

    // throw err if job does not exist
    if (!existJob) {
        throw new AppError(httpStatus.NOT_FOUND, "Job does not exist");
    }

    //finally delete the job
    const res = await prisma.job.delete({ where: { id: jobId } });
    return res;
}

//feature a job
const featureJob = async (jobId: string) => {
    //check the job is exist or not
    const existJob = await prisma.job.findFirst({ where: { id: jobId } });

    // throw err if job does not exist
    if (!existJob) {
        throw new AppError(httpStatus.NOT_FOUND, "Job does not exist");
    }

    // checking job is active or not
    if (existJob?.status !== "ACTIVE") {
        throw new AppError(httpStatus.BAD_REQUEST, "Job is not active")
    }

    // checking job already featured
    if (existJob?.isFeature) {
        throw new AppError(httpStatus.CONFLICT, "Job already in Featured")
    }

    //finally feature the job
    const res = await prisma.job.update({ where: { id: jobId }, data: { isFeature: true } });
    return res;
}

//features job list
const allFeatureJobs = async () => {

    const res = await prisma.job.findMany({
        where: { status: JobStatus.ACTIVE, isFeature: true },
        include : {company : true},
        take: 8,
        orderBy: {
            createdAt: "desc",
        },
    });
    return res;
}

// jobs counts by category
const getJobsByCategory = async () => {
    const grouped = await prisma.job.groupBy({
        by: ["category"],
        where: { status: JobStatus.ACTIVE },
        _count: { category: true },
    });

    // Fill in 0 for categories with no jobs
    const result = Object.values(JobCategory).map((category) => {
        const found = grouped.find((g) => g.category === category);
        return {
            category,
            count: found?._count.category ?? 0,
        };
    });

    return result;
};

export const jobService = {
    addNewJob,
    allJobs,
    jobDetails,
    deleteJob,
    updateJob,
    featureJob,
    allFeatureJobs,
    getJobsByCategory
}