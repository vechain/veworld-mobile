import { VET, VTHO, defaultMainNetwork } from "~Constants"
import BalanceUtils from "./BalanceUtils"
import { TestHelpers } from "~Test"
import axios from "axios"
import MockAdapter from "axios-mock-adapter"

const { account1D1, token1, token2 } = TestHelpers.data
const thorAccountStub = TestHelpers.thor.stubs.account
const thorClient = TestHelpers.thor.mockThorInstance({})
const thorClientWithCallError = TestHelpers.thor.mockThorInstance({
    account: thorAccountStub({ shouldCallError: true }),
})
const mainNetwork = defaultMainNetwork

const mockedBalance = {
    balance: "0x47ff1f90327aa0f8e",
    energy: "0xcf624158d591398",
}

const decodedTokenBalance = "0x9184e72a000"

describe("BalanceUtils", () => {
    let mock: MockAdapter

    beforeAll(() => {
        mock = new MockAdapter(axios)
    })

    afterEach(() => {
        mock.reset()
    })

    it("VET - should return the correct balance", async () => {
        mock.onGet(
            `${mainNetwork.currentUrl}/accounts/${account1D1.address}`,
        ).reply(200, mockedBalance)

        const balance = await BalanceUtils.getBalanceFromBlockchain(
            VET.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balance?.balance).toEqual(mockedBalance.balance)
    })

    it("VTHO - should return the correct balance", async () => {
        mock.onGet(
            `${mainNetwork.currentUrl}/accounts/${account1D1.address}`,
        ).reply(200, mockedBalance)

        const balance = await BalanceUtils.getBalanceFromBlockchain(
            VTHO.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balance?.balance).toEqual(mockedBalance.energy)
    })

    it("VTHO - should throw network error", async () => {
        mock.onGet(
            `${mainNetwork.currentUrl}/accounts/${account1D1.address}`,
        ).networkError()

        const balanceRequest = async () =>
            await BalanceUtils.getBalanceFromBlockchain(
                VTHO.address,
                account1D1.address,
                mainNetwork,
                thorClient,
            )

        expect(balanceRequest).rejects.toThrowError(
            "Failed to get balance from external service",
        )
    })

    it("PLA Token - should return the correct balance", async () => {
        const balance = await BalanceUtils.getBalanceFromBlockchain(
            token1.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balance?.balance).toEqual(decodedTokenBalance)
    })
    it("SHA Token - should return the correct balance", async () => {
        const balance = await BalanceUtils.getBalanceFromBlockchain(
            token2.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balance?.balance).toEqual(decodedTokenBalance)
    })

    it("SHA token - should throw an error", async () => {
        const balanceRequest = async () =>
            await BalanceUtils.getBalanceFromBlockchain(
                token2.address,
                account1D1.address,
                mainNetwork,
                thorClientWithCallError,
            )

        expect(balanceRequest).rejects.toThrowError()
    })
})
