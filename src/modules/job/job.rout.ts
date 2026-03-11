import { Router } from "express";
import { apiLimiter } from "../auth/auth.rout";
import { jobControler } from "./job.controler";
import req_validator from "../../middleware/req_validation";
import { createJobValidator } from "./job.validator";

const router = Router();

router.post('/',
    apiLimiter,
    createJobValidator,
    req_validator(),
    jobControler.addNewJob
)
router.get('/',
    jobControler.allJobs
)

export const jobRouts = router;