import { Certificate } from "thor-devkit"
import { mockLedgerAccount } from "./ledger"

export const mockedCertificate: Certificate = {
    purpose: "identification",
    payload: {
        type: "text",
        content: "Hello World",
    },
    signature: "0x1234567890",
    domain: "www.vechain.com",
    timestamp: 1234567890,
    signer: mockLedgerAccount.address,
}
