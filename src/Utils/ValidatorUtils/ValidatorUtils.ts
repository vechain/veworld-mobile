import { Validator, getValidatorLogoUrl } from "~Constants"

/**
 * Get validator information by address from the validators list
 * @param validators - List of validators
 * @param address - Validator address
 * @returns Validator object or undefined if not found
 */
export const getValidatorByAddress = (validators: Validator[], address: string): Validator | undefined => {
    return validators.find(validator => validator.address.toLowerCase() === address.toLowerCase())
}

/**
 * Get validator name by address from the validators list
 * @param validators - List of validators
 * @param address - Validator address
 * @returns Validator name or undefined if not found
 */
export const getValidatorName = (validators: Validator[], address: string): string | undefined => {
    const validator = getValidatorByAddress(validators, address)
    return validator?.name
}

/**
 * Get full validator logo URL by address from the validators list
 * @param validators - List of validators
 * @param address - Validator address
 * @returns Full logo URL or undefined if not found
 */
export const getValidatorLogoUrlByAddress = (validators: Validator[], address: string): string | undefined => {
    const validator = getValidatorByAddress(validators, address)
    return validator ? getValidatorLogoUrl(validator.logo) : undefined
}

export const ValidatorUtils = {
    getValidatorByAddress,
    getValidatorName,
    getValidatorLogoUrlByAddress,
}
