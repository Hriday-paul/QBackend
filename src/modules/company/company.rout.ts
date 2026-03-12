import { Router } from "express";
import { companyControler } from "./company.controler";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get('/', companyControler.allCompanies);
router.post('/',
    //  auth(Role.ADMIN),
    companyControler.addNewCompany);

export const companyRouts = router;
