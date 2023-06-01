import React from "react"
import { TestWrapper } from "~Test"
import { ManageCustomTokenScreen } from "./ManageCustomTokenScreen"
import { render } from "@testing-library/react-native"
import { Driver, Net, Wallet } from "@vechain/connex-driver"
import { genesises } from "~Common/Constant/Thor/ThorConstants"

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

jest.spyOn(Driver, "connect").mockImplementation(
    (_net: Net, _wallet?: Wallet): Promise<Driver> => {
        return Promise.resolve(driver)
    },
)

//TODO: this test leaves an open handle (ConnexProvier)
describe("ManageCustomTokenScreen", () => {
    afterEach(() => {
        driver.close()
    })
    test("should render correctly", async () => {
        render(<ManageCustomTokenScreen />, {
            wrapper: TestWrapper,
        })
        // await findElement()
    })
})
