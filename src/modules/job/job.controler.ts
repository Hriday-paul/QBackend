import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { jobService } from "./job.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import pick from "../../shared/pick";
import { PaginateOptions } from "../../helper/pagination.helper";

//create job
const addNewJob = catchAsync(async (req: Request, res: Response) => {

    const result = await jobService.addNewJob(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Job created successfully',
        data: result
    });
})

// retrive jobs by query
const allJobs = catchAsync(async (req: Request, res: Response) => {

    const query = pick(req.query, ["searchTerm", "job_type", "employment_type", "division", "education", "category"]);
    const options = pick(req.query, PaginateOptions);

    const result = await jobService.allJobs(query, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Jobs retrived successfully',
        data: result
    });
})

//update a job
const updateJob = catchAsync(async (req: Request, res: Response) => {

    const result = await jobService.updateJob(req.params?.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Job updated successfully',
        data: result
    });
})

//delete a job
const deleteJob = catchAsync(async (req: Request, res: Response) => {

    const result = await jobService.deleteJob(req.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Job deleted successfully',
        data: result
    });
})


export const jobControler = {
    addNewJob,
    allJobs,
    updateJob,
    deleteJob
}