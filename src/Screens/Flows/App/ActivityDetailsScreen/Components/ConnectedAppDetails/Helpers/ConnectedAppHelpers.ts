import { RequestMethods } from "~Constants"
import { TranslationFunctions } from "~i18n"

export const wcMethodsToRequestTranslations = (
    methods: string[],
    LL: TranslationFunctions,
) => {
    let translations: string[] = []

    if (methods.includes(RequestMethods.REQUEST_TRANSACTION))
        translations.push(LL.CONNECTION_REQUEST_TRANSACTION_DESCRIPTION())

    if (
        methods.includes(RequestMethods.IDENTIFY) ||
        methods.includes(RequestMethods.SIGN)
    )
        translations.push(LL.CONNECTION_REQUEST_SIGN_DESCRIPTION())

    if (!translations.length) return ""

    // Return `translations` as a single string where each element is separated by new line
    return translations.join("\n")
}
