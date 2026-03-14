import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { applicationService } from "./application.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import pick from "../../shared/pick";
import { PaginateOptions } from "../../helper/pagination.helper";

//create new application
const addNewApplication = catchAsync(async (req: Request, res: Response) => {

    const result = await applicationService.addNewApplication(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Application submited successfully',
        data: result
    });
})

// retrive applications
const allApplications = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, PaginateOptions);

    const result = await applicationService.allApplications(options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Applications retrived successfully',
        data: result
    });
})

export const applicationControler = {
    addNewApplication,
    allApplications
}