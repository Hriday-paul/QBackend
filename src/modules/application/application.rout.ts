import { Router } from "express";
import { applicationControler } from "./application.controler";
import { req_rate_limit } from "../../middleware/request_limit";
import { jobApplicationValidator } from "./application.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.post('/',
    req_rate_limit(),
    jobApplicationValidator,
    req_validator(),
    applicationControler.addNewApplication
);

export const applicationRouts = router;