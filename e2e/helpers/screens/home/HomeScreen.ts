import { VERY_SHORT_TIMEOUT } from "../../constants"
import { waitFor, element } from "detox"

export const isActive = async (): Promise<boolean> => {
    return await waitFor(element(by.id("veworld-homepage")))
        .toBeVisible()
        .withTimeout(VERY_SHORT_TIMEOUT)
        .then(() => true)
        .catch(() => false)
}
