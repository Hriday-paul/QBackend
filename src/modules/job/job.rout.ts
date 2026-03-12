import { Router } from "express";
import { jobControler } from "./job.controler";
import req_validator from "../../middleware/req_validation";
import { createJobValidator, editJobValidator } from "./job.validator";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { req_rate_limit } from "../../middleware/request_limit";

const router = Router();

router.post('/',
    req_rate_limit(),
    createJobValidator,
    req_validator(),
    auth(Role.ADMIN),
    jobControler.addNewJob
)

router.patch('/:id',
    req_rate_limit(),
    editJobValidator,
    req_validator(),
    auth(Role.ADMIN),
    jobControler.updateJob
)

router.get('/',
    jobControler.allJobs
)

router.delete('/:id',
    req_rate_limit(),
    auth(Role.ADMIN),
    jobControler.deleteJob
)

export const jobRouts = router;