import { Company } from "../../../generated/prisma/client";
import prisma from "../../shared/prisma"

const allCompanies = async () => {
    const result = await prisma.company.findMany();
    return result;
}

const addNewCompany = async (payload: Company) => {
    const result = await prisma.company.create({ data: payload });
    return result;
}

export const companyService = {
    allCompanies,
    addNewCompany
}