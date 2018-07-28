/**
 * Interface representing error data.
 *
 * @export
 * @interface IError
 */
export interface IError {
    /**
     * Error message
     *
     * @type {string}
     * @memberof IError
     */
    message: string;
    /**
     * Name or type of error
     *
     * @type {string}
     * @memberof IError
     */
    name: string;
    /**
     * Stack trace for the location where the error was generated.
     *
     * @type {string}
     * @memberof IError
     */
    stackTrace?: string;
}
