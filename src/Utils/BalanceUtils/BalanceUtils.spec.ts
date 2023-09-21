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

const tokenWithBalance = {
    address: "0x645d2019ed39e58db76af602317d177b53ba8b9d",
    balance: {
        accountAddress: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
        balance: "0",
        genesisId:
            "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        position: 2,
        timeUpdated: "2023-08-14T13:18:27.544Z",
        tokenAddress: "0x645d2019ed39e58db76af602317d177b53ba8b9d",
        isHidden: false,
    },
    custom: false,
    decimals: 18,
    desc: "Plair is a decentralized gaming ecosystem disrupting the amateur gaming market",
    genesisId:
        "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    icon: "https://vechain.github.io/token-registry//assets/dfe7a792d85cfd1483b03228fd1d51a383a3c7b5.png",
    name: "Plair",
    symbol: "PLA",
    totalSupply: "100000000000000000000000000000",
}

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

    it("SHA token - should return undefined", async () => {
        const balanceRequest = await BalanceUtils.getBalanceFromBlockchain(
            token2.address,
            account1D1.address,
            mainNetwork,
            thorClientWithCallError,
        )

        expect(balanceRequest).toBeUndefined()
    })

    it("should return the correct indication for token balance", async () => {
        const isTokenWithBalance =
            BalanceUtils.getIsTokenWithBalance(tokenWithBalance)

        expect(isTokenWithBalance).toEqual(false)

        const isTokenWithBalance2 = BalanceUtils.getIsTokenWithBalance({
            ...tokenWithBalance,
            balance: {
                ...tokenWithBalance.balance,
                balance: "0x4563918244f400000",
            },
        })

        expect(isTokenWithBalance2).toEqual(true)
    })
})
