import { JobApplication } from "../../../generated/prisma/client";
import prisma from "../../shared/prisma";

const addNewApplication = async (payload: JobApplication) => {
    const res = await prisma.jobApplication.create({ data: payload });
    return res;
}

export const applicationService = {
    addNewApplication
}