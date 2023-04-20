/*eslint-disable no-console*/
export const mockLedgerAccount = {
    publicKey:
        "042e7f024c8af943a41af6b74a8be59c57daf978282fb0118674cba85cac0fe68eeca595a4a84f93f76ab8d648e40e5ec880691787cbfe6607de578a4217d4c15c",
    address: "0x2749808b9d2d2ec0aef731a357cac6f2f468a58d",
    chainCode:
        "9f2e11c29c3838b32cc4160acb8c163db2d85e8a795af8844210ad81edd3eaef",
}

export const mockDeviceModel = {
    id: "nanoX",
    productName: "Ledger Nano X",
    usbOnly: false,
}

export const mockTransport = {
    deviceModel: mockDeviceModel,
    close(): Promise<void> {
        console.log("Closed transport")
        return Promise.resolve()
    },
    on(eventName: string) {
        console.log("Created event for: " + eventName)
    },
}
