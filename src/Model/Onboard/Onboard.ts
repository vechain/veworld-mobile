export enum PinVerificationError {
    EDIT_PIN = "EDIT_PIN",
    VALIDATE_PIN = "VALIDATE_PIN",
}

type PinErrorType = `${PinVerificationError}`

export type PinVerificationErrorType = {
    type: PinErrorType | undefined
    value: boolean
}
