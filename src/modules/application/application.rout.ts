import { Router } from "express";
import { applicationControler } from "./application.controler";
import { req_rate_limit } from "../../middleware/request_limit";
import { jobApplicationValidator } from "./application.validator";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post('/',
    req_rate_limit(),
    jobApplicationValidator,
    req_validator(),
    applicationControler.addNewApplication
);

router.get('/',
    auth(Role.ADMIN),
    applicationControler.allApplications
);

export const applicationRouts = router;