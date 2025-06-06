import React from "react"
import { TestWrapper } from "~Test"
import { ManageCustomTokenScreen } from "./ManageCustomTokenScreen"
import { render } from "@testing-library/react-native"
import { Driver, Net, Wallet } from "@vechain/connex-driver"
import { genesises } from "~Constants"

const net: Net = {
    baseURL: "https://sync-testnet.vechain.org/",
    http: (_method, _path, _params) => {
        return Promise.resolve()
    },
    openWebSocketReader: (_url: string) => ({
        read: () => Promise.resolve({}),
        open: () => {},
        close: () => {},
    }),
}
const driver = new Driver(net, genesises.main, {
    id: "test",
    number: 0,
    timestamp: 0,
    gasLimit: 0,
    parentID: "test",
    txsFeatures: 0,
})

jest.spyOn(Driver, "connect").mockImplementation((_net: Net, _wallet?: Wallet): Promise<Driver> => {
    return Promise.resolve(driver)
})

jest.mock("~Hooks/useVns/useVns", () => ({
    useVns: () => ({
        name: "grenos.vet",
        address: "0x",
    }),
}))

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
}))

describe("ManageCustomTokenScreen", () => {
    afterEach(() => {
        driver.close()
    })
    test("should render correctly", async () => {
        render(<ManageCustomTokenScreen />, {
            wrapper: TestWrapper,
        })
    })
})
