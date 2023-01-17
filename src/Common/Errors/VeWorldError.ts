import * as i18n from "../../i18n"
import { getErrorName, getErrorType } from "./Errors"

const I18_NAMESPACE = "veWorldErrors"

export class VeWorldError extends Error {
    public readonly statusCode: number
    public i18nID?: string

    constructor(statusCode: number, message: string, i18nID?: string) {
        super(message)
        this.statusCode = statusCode
        this.i18nID = i18nID
    }

    /**
     * Checks an unknown error to see if it is a VeWorldError
     *
     * If it is, and it has a valid translation, the translation is returned
     *
     * Otherwise, the default message is returned
     * @param error
     * @param defaultMessage
     */
    public static getErrorMessage(
        error: unknown,
        defaultMessage: string,
    ): string {
        if (!isVeWorldError(error)) return defaultMessage

        const vError = error as VeWorldError

        const errorType = getErrorType(vError.statusCode)
        if (!errorType) return defaultMessage

        const errorName = getErrorName(vError.statusCode, errorType)
        if (!errorName) return defaultMessage

        const i18nKey = `${errorType}.${errorName}.${vError.i18nID}`
        const keyWithNamespace = `${I18_NAMESPACE}:${i18nKey}`
        const i18nMessage = i18n.t(keyWithNamespace)

        if (i18nMessage !== i18nKey) return i18nMessage

        return defaultMessage
    }

    public serialize() {
        return {
            message: this.message,
            code: this.statusCode,
        }
    }
}

export const isVeWorldError = (error: unknown) => {
    return error instanceof Error && "i18nID" in error && "statusCode" in error
}
