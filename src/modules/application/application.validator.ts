import { body } from "express-validator";

export const jobApplicationValidator = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Must be a valid email address")
        .normalizeEmail(),

    body("resumeUrl")
        .trim()
        .notEmpty().withMessage("Resume link is required")
        .isURL().withMessage("Resume URL must be a valid URL"),

    body("coverLetter")
        .optional()
        .trim(),

    body("jobId")
        .trim()
        .notEmpty().withMessage("Job ID is required")
        .isUUID().withMessage("Job ID must be a valid UUID"),
];