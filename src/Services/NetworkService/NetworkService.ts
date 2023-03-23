import { DriverNoVendor, SimpleNet } from "@vechain/connex-driver"
import { newThor } from "@vechain/connex-framework/dist/thor"
import { Network } from "~Model"

let currentDriver: DriverNoVendor | undefined

export const getConnexThor = (network: Network): Connex.Thor => {
    if (!currentDriver)
        currentDriver = new DriverNoVendor(
            new SimpleNet(network.currentUrl),
            network.genesis,
        )

    return newThor(currentDriver)
}
