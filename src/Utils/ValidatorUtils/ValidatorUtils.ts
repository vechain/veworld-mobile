import { Validator } from "~Constants"
import AddressUtils from "../AddressUtils"
import { components } from "~Generated/indexer/schema"

/**
 * Get validator information by address from the validators list
 * @param validators - List of validators
 * @param address - Validator address
 * @returns Validator object or undefined if not found
 */
export const getValidatorByAddress = (validators: Validator[], address: string): Validator | undefined => {
    return validators.find(validator => AddressUtils.compareAddresses(validator.address, address))
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

export const getCurrentCycleValidatorStake = (
    validator: components["schemas"]["PaginatedResponseValidator"]["data"][number],
): number => {
    if (!validator) return 0
    return validator.validatorVetStaked ?? 0
}

export const ValidatorUtils = {
    getValidatorByAddress,
    getValidatorName,
    getCurrentCycleValidatorStake,
}
