import { address } from "thor-devkit"
import { FormInstance } from "antd"
/**
 * Can be used to validate a form field via its rules field in the following way
 * @param _ unused, just for signature compatibility
 * @param value what we want to validate
 * @returns A promise rejected or not based on the validation result
 * @example
 * <Form.Item
    label={LL.WALLET_LABEL_address()}
    name="address"
    rules={[
    {
        validator: validateAddress,
        message: LL.SETTINGS_LABEL_enter_valid_address"),
    },
    ]}
>
    <Input name={"address"} />
    </Form.Item>
 */
export const validateAddress = (_: unknown, value: string): Promise<void> => {
    try {
        //new RegExp("^0x[a-fA-F0-9]{40}$")
        address.toChecksumed(value)
        return Promise.resolve()
    } catch (e) {
        return Promise.reject()
    }
}

/**
 * Check if the value provided exist in a specific key of the array
 * @param array
 * @param key
 * @param exclude optional value to exclude from the validation via deep equality
 * @param compareFunction optional validation function to use instead of ===
 * @returns a closure compatible with a <Form.Item> validator
 */
export const validateAlreadyExist =
    <T>(
        array: T[],
        key: keyof T,
        exclude?: T,
        compareFunction?: (value1: unknown, value2: unknown) => boolean,
    ) =>
    (_: unknown, value: string): Promise<void> => {
        const compare = compareFunction
            ? compareFunction
            : (value1: unknown, value2: unknown) => value1 === value2
        const isExclude = exclude && compare(value, exclude[key])
        if (isExclude) return Promise.resolve()
        const valueExist = array.find(item => {
            return compare(item[key], value)
        })

        if (valueExist) return Promise.reject()
        else return Promise.resolve()
    }

/**
 * Check if the value provided match a provided form field
 * @param form the form instance used to retrieve the value to validate against
 * @param fieldToCompare the field of the form to validate against
 * @param compareFunction optional validation function to use instead of ===
 * @returns a closure compatible with a <Form.Item> validator
 */
export const validateFieldsMatch =
    <T>(
        form: FormInstance<T>,
        fieldToCompare: keyof T & string,
        compareFunction?: (value1: unknown, value2: unknown) => boolean,
    ) =>
    (_: unknown, value: string): Promise<void> => {
        const otherField = form.getFieldValue(fieldToCompare)
        const validationResult = compareFunction
            ? compareFunction(value, otherField)
            : value === otherField
        return validationResult ? Promise.resolve() : Promise.reject()
    }

export default {
    validateAddress,
    validateAlreadyExist,
    validateFieldsMatch,
}
