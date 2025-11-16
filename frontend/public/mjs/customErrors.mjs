/**
 * Custom error class to represent backend-related errors.
 */
export class BackendError extends Error {

    /**
     * Creates an instance of BackendError.
     * @param {string} message A descriptive error message.
     * @param {number} httpStatusCode The HTTP status code associated with the error.
     * @param {Array} errorArray An array of error details from the backend.
     */
    constructor(message, httpStatusCode, errorArray) {
        super(message);

        // Maintains proper stack trace for where our error was thrown (non-standard)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BackendError);
        }

        this.name = "BackendError";
        this.httpStatusCode = httpStatusCode;
        this.errorArray = errorArray;
    }
}