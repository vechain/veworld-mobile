import { ERROR_EVENTS, VET, VTHO, defaultMainNetwork } from "~Constants"
import BalanceUtils from "./BalanceUtils"
import { TestHelpers } from "~Test"
var axios = require("axios")
import MockAdapter from "axios-mock-adapter"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"
import { error } from "~Utils/Logger"
import { ethers } from "ethers"
import { VIP180 } from "~Constants/Constants/Thor/abis"

const { account1D1, token1, token2, customToken } = TestHelpers.data
const thorAccountStub = TestHelpers.thor.stubs.account
const thorClient = TestHelpers.thor.mockThorInstance({})
const thorClientWithCallError = TestHelpers.thor.mockThorInstance({
    account: thorAccountStub({ shouldCallError: true }),
})

const createBalanceOfStub = (balances: string[]) => {
    return {
        ...thorClient,
        account(addr) {
            return {
                ...thorAccountStub({})(addr),
                method(abi) {
                    return {
                        asClause(..._args: any[]): Connex.Thor.Transaction["clauses"][0] {
                            if (!("name" in abi) || typeof abi.name !== "string")
                                throw new Error("Abi name not implemented")
                            return {
                                to: addr,
                                value: "0x0",
                                data: new ethers.utils.Interface([abi as any]).encodeFunctionData(abi.name, _args),
                            }
                        },
                        cache(_hints: string[]) {
                            return this
                        },
                        call(..._args: any[]): Promise<Connex.VM.Output & Connex.Thor.Account.WithDecoded> {
                            return Promise.resolve({
                                events: [],
                                data: "0x000000000000000000000000000000000000000000000000000009184e72a000",
                                vmError: "",
                                gasUsed: 1234,
                                reverted: false,
                                transfers: [],
                                decoded: ["0x9184e72a000"],
                            })
                        },

                        caller(_addr: string) {
                            return this
                        },
                        gas(_gas: number) {
                            return this
                        },
                        gasPayer(_addr: string) {
                            return this
                        },
                        gasPrice(_gp: string | number) {
                            return this
                        },
                        transact(..._args: any[]): Connex.Vendor.TxSigningService {
                            throw Error("Not implemented")
                        },
                        value(_val: string | number) {
                            return this
                        },
                    }
                },
            }
        },
        explain(clauses) {
            return {
                ...TestHelpers.thor.stubs.explain.explain(clauses),
                async execute() {
                    return clauses.map((_, idx) => ({
                        events: [],
                        transfers: [],
                        data: new ethers.utils.Interface([VIP180.balanceOf]).encodeFunctionResult("balanceOf", [
                            balances[idx],
                        ]),
                        vmError: "",
                        gasUsed: 100000,
                        reverted: false,
                    }))
                },
            }
        },
    } satisfies Connex.Thor
}

jest.mock("~Networking", () => ({
    getTokenDecimals: jest.fn(),
    getTokenSymbol: jest.fn(),
    getTokenName: jest.fn(),
}))

jest.mock("@sentry/react-native", () => ({ init: () => jest.fn() }))

jest.mock("~Utils/Logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
}))

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
        genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
        position: 2,
        timeUpdated: "2023-08-14T13:18:27.544Z",
        tokenAddress: "0x645d2019ed39e58db76af602317d177b53ba8b9d",
        isHidden: false,
    },
    custom: false,
    decimals: 18,
    desc: "Plair is a decentralized gaming ecosystem disrupting the amateur gaming market",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
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
        jest.clearAllMocks()
    })

    it("VET - should return the correct balance", async () => {
        mock.onGet(`${mainNetwork.currentUrl}/accounts/${account1D1.address}`).reply(200, mockedBalance)

        const balance = await BalanceUtils.getBalanceFromBlockchain(
            VET.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balance?.balance).toEqual(mockedBalance.balance)
    })

    it("VTHO - should return the correct balance", async () => {
        mock.onGet(`${mainNetwork.currentUrl}/accounts/${account1D1.address}`).reply(200, mockedBalance)

        const balance = await BalanceUtils.getBalanceFromBlockchain(
            VTHO.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balance?.balance).toEqual(mockedBalance.energy)
    })

    it("VTHO - should throw network error", async () => {
        mock.onGet(`${mainNetwork.currentUrl}/accounts/${account1D1.address}`).networkError()

        const balanceRequest = async () =>
            await BalanceUtils.getBalanceFromBlockchain(VTHO.address, account1D1.address, mainNetwork, thorClient)

        await expect(balanceRequest).rejects.toThrow("Failed to get balance from external service")
        expect(error).toHaveBeenCalledWith(ERROR_EVENTS.TOKENS, new Error("Network Error"))
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
        const isTokenWithBalance = BalanceUtils.getIsTokenWithBalance(tokenWithBalance)

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

    it("getBalanceAndTokenInfoFromBlockchain - should return balance and token details", async () => {
        mock.onGet(`${mainNetwork.currentUrl}/accounts/${account1D1.address}`).reply(200, mockedBalance)

        const symbolMock = "MTKN"
        const decimalsMock = 18
        const nameMock = "MyToken"

        ;(getTokenDecimals as jest.Mock).mockResolvedValue(decimalsMock)
        ;(getTokenSymbol as jest.Mock).mockResolvedValue(symbolMock)
        ;(getTokenName as jest.Mock).mockResolvedValue(nameMock)

        const balanceAndTokens = await BalanceUtils.getBalanceAndTokenInfoFromBlockchain(
            customToken.address,
            account1D1.address,
            mainNetwork,
            thorClient,
        )

        expect(balanceAndTokens).not.toBeUndefined()
        expect(balanceAndTokens?.tokenName).toEqual("MyToken")
        expect(balanceAndTokens?.tokenSymbol).toEqual("MTKN")
        expect(balanceAndTokens?.tokenDecimals).toEqual(18)
        expect(balanceAndTokens?.balance).toEqual(decodedTokenBalance)
    })

    it("getBalanceAndTokenInfoFromBlockchain - should return undefined", async () => {
        const balanceAndTokens = await BalanceUtils.getBalanceAndTokenInfoFromBlockchain(
            token1.address,
            account1D1.address,
            mainNetwork,
            thorClientWithCallError,
        )

        expect(balanceAndTokens).toBeUndefined()
    })

    describe("getBalancesFromBlockchain", () => {
        it("should not include VTHO if VET is included", async () => {
            mock.onGet(`${mainNetwork.currentUrl}/accounts/${account1D1.address}`).reply(200, mockedBalance)

            const result = await BalanceUtils.getBalancesFromBlockchain(
                [VET.address],
                account1D1.address,
                mainNetwork,
                thorClient,
            )

            expect(result[0].balance).toEqual(mockedBalance.balance)
        })
        it("should not include VET if VTHO is included", async () => {
            mock.onGet(`${mainNetwork.currentUrl}/accounts/${account1D1.address}`).reply(200, mockedBalance)

            const result = await BalanceUtils.getBalancesFromBlockchain(
                [VTHO.address],
                account1D1.address,
                mainNetwork,
                thorClient,
            )

            expect(result[0].balance).toEqual(mockedBalance.energy)
        })
        it("should get balances for one ERC-20", async () => {
            const balance = ethers.utils.parseEther("3.3").toHexString()
            const result = await BalanceUtils.getBalancesFromBlockchain(
                [token1.address],
                account1D1.address,
                mainNetwork,
                createBalanceOfStub([balance]),
            )

            expect(result).toHaveLength(1)
            expect(result[0].balance).toEqual(balance)
        })
        it("should get balances for multiple ERC-20s", async () => {
            const [balance1, balance2] = [
                ethers.utils.parseEther("3.3").toHexString(),
                ethers.utils.parseEther("4.5").toHexString(),
            ]
            const result = await BalanceUtils.getBalancesFromBlockchain(
                [token1.address, token2.address],
                account1D1.address,
                mainNetwork,
                createBalanceOfStub([balance1, balance2]),
            )

            expect(result).toHaveLength(2)
            expect(result[0].balance).toBe(balance1)
            expect(result[1].balance).toBe(balance2)
        })
    })
})
