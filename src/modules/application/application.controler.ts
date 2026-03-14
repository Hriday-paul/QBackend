import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { applicationService } from "./application.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

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

export const applicationControler = {
    addNewApplication
}