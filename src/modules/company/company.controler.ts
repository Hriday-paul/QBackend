import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { companyService } from "./company.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"

//all company list
const allCompanies = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.allCompanies();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Companies retrived successfully',
        data: result
    });
})


const addNewCompany = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.addNewCompany(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New company added successfully',
        data: result
    });
})

export const companyControler = {
    allCompanies,
    addNewCompany
}