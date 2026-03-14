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

// add feature a job
router.patch('/feature/:id',
    req_rate_limit(),
    auth(Role.ADMIN),
    jobControler.featureJob
)

//all feature jobs
router.get('/feature',
    jobControler.allFeatureJobs
)

// jobs counts by category
router.get('/categories',
    jobControler.getJobsByCategory
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

router.get('/:id',
    jobControler.jobDetails
)

router.delete('/:id',
    req_rate_limit(),
    auth(Role.ADMIN),
    jobControler.deleteJob
)

export const jobRouts = router;