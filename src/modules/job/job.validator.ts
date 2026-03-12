import { body, validationResult } from "express-validator";

export const createJobValidator = [
    // Required fields
    body("title")
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .trim(),

    body("description")
        .notEmpty().withMessage("Description is required")
        .isString().withMessage("Description must be a string")
        .trim(),

    body("category")
        .notEmpty().withMessage("Category is required")
        .isIn([
            "DESIGN",
            "SALES",
            "MARKETING",
            "FINANCE",
            "TECHNOLOGY",
            "ENGINEERING",
            "BUSINESS",
            "HUMAN_RESOURCE",
        ])
        .withMessage(
            "category must be one of: DESIGN, SALES, MARKETING, FINANCE, TECHNOLOGY, ENGINEERING, BUSINESS, HUMAN_RESOURCE"
        ),

    body("street")
        .notEmpty().withMessage("Street is required")
        .isString().withMessage("Street must be a string")
        .trim(),

    body("division")
        .notEmpty().withMessage("Division is required")
        .isString().withMessage("Division must be a string")
        .trim(),

    body("companyId")
        .notEmpty().withMessage("Company ID is required")
        .isUUID().withMessage("Company ID must be a valid UUID"),

    // Optional string fields
    body("responsibilities")
        .optional()
        .isString().withMessage("Responsibilities must be a string")
        .trim(),

    body("requirements")
        .optional()
        .isString().withMessage("Requirements must be a string")
        .trim(),

    body("benefits")
        .optional()
        .isString().withMessage("Benefits must be a string")
        .trim(),

    body("experience")
        .optional()
        .isString().withMessage("Experience must be a string")
        .trim(),

    // Array fields
    body("education")
        .optional()
        .isArray().withMessage("Education must be an array")
        .custom((val: string[]) => val.every((v) => typeof v === "string"))
        .withMessage("Each education entry must be a string"),

    body("gender")
        .optional()
        .isArray().withMessage("Gender must be an array")
        .custom((val: string[]) => val.every((v) => typeof v === "string"))
        .withMessage("Each gender entry must be a string"),

    // Salary fields
    body("salaryMin")
        .optional()
        .isInt({ min: 0 }).withMessage("Salary min must be a non-negative integer"),

    body("salaryMax")
        .optional()
        .isInt({ min: 0 }).withMessage("Salary max must be a non-negative integer")
        .custom((max, { req }) => {
            if (req.body.salaryMin !== undefined && max < req.body.salaryMin) {
                throw new Error("salaryMax must be greater than or equal to salaryMin");
            }
            return true;
        }),

    body("currency")
        .optional()
        .isString().withMessage("Currency must be a string")
        .isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code (e.g. USD)")
        .toUpperCase(),

    // Enum fields
    body("job_type")
        .optional()
        .isIn(["Onsite", "Remote"]).withMessage("job_type must be 'Onsite' or 'Remote'"),

    body("employment_type")
        .optional()
        .isIn(["Fulltime", "Parttime"]).withMessage("employment_type must be 'Fulltime' or 'Parttime'"),

    // Deadline
    body("deadline")
        .optional()
        .isString().withMessage("Deadline must be a valid date string")
];

export const editJobValidator = [
    // Optional string fields
    body("title")
        .optional()
        .isString().withMessage("Title must be a string")
        .trim(),

    body("description")
        .optional()
        .isString().withMessage("Description must be a string")
        .trim(),

    body("category")
        .optional()
        .isIn([
            "DESIGN",
            "SALES",
            "MARKETING",
            "FINANCE",
            "TECHNOLOGY",
            "ENGINEERING",
            "BUSINESS",
            "HUMAN_RESOURCE",
        ])
        .withMessage(
            "category must be one of: DESIGN, SALES, MARKETING, FINANCE, TECHNOLOGY, ENGINEERING, BUSINESS, HUMAN_RESOURCE"
        ),

    body("street")
        .optional()
        .isString().withMessage("Street must be a string")
        .trim(),

    body("division")
        .optional()
        .isString().withMessage("Division must be a string")
        .trim(),

    body("companyId")
        .optional()
        .isUUID().withMessage("Company ID must be a valid UUID"),

    body("responsibilities")
        .optional()
        .isString().withMessage("Responsibilities must be a string")
        .trim(),

    body("requirements")
        .optional()
        .isString().withMessage("Requirements must be a string")
        .trim(),

    body("benefits")
        .optional()
        .isString().withMessage("Benefits must be a string")
        .trim(),

    body("experience")
        .optional()
        .isString().withMessage("Experience must be a string")
        .trim(),

    // Array fields
    body("education")
        .optional()
        .isArray().withMessage("Education must be an array")
        .custom((val: string[]) => val.every((v) => typeof v === "string"))
        .withMessage("Each education entry must be a string"),

    body("gender")
        .optional()
        .isArray().withMessage("Gender must be an array")
        .custom((val: string[]) => val.every((v) => typeof v === "string"))
        .withMessage("Each gender entry must be a string"),

    // Salary fields
    body("salaryMin")
        .optional()
        .isInt({ min: 0 }).withMessage("Salary min must be a non-negative integer"),

    body("salaryMax")
        .optional()
        .isInt({ min: 0 }).withMessage("Salary max must be a non-negative integer")
        .custom((max, { req }) => {
            if (req.body.salaryMin !== undefined && max < req.body.salaryMin) {
                throw new Error("salaryMax must be greater than or equal to salaryMin");
            }
            return true;
        }),

    body("currency")
        .optional()
        .isString().withMessage("Currency must be a string")
        .isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code (e.g. USD)")
        .toUpperCase(),

    // Enum fields
    body("job_type")
        .optional()
        .isIn(["Onsite", "Remote"]).withMessage("job_type must be 'Onsite' or 'Remote'"),

    body("employment_type")
        .optional()
        .isIn(["Fulltime", "Parttime"]).withMessage("employment_type must be 'Fulltime' or 'Parttime'"),

    // Deadline
    body("deadline")
        .optional()
        .isString().withMessage("Deadline must be a valid date string")
];