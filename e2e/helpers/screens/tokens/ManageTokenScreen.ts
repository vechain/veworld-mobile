import { SHORT_TIMEOUT } from "../../constants"

export const isActive = async (): Promise<boolean> => {
    return await waitFor(element(by.text("Manage Tokens")))
        .toExist()
        .withTimeout(SHORT_TIMEOUT)
        .then(() => true)
        .catch(() => false)
}
