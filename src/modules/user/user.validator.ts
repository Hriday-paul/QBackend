import { check, param } from "express-validator";

export const statusUpdateValidator = [
    check('status').not().isEmpty().withMessage('status is required').isBoolean().withMessage("status must be boolean").toBoolean(),
]