import { HDNode, mnemonic } from "thor-devkit"
import { Contact, ContactType } from "~Model"
import { AddressUtils, CryptoUtils } from "~Common"

export const hdnode = HDNode.fromMnemonic(mnemonic.generate())

export const getContact = (pathIndex: number, type: ContactType): Contact => {
    return {
        alias: `${ContactType.KNOWN ? "Known" : "Cached"} Contact ${pathIndex}`,
        address: AddressUtils.getAddressFromXPub(
            CryptoUtils.xPubFromHdNode(hdnode),
            pathIndex,
        ),
        type,
    }
}
