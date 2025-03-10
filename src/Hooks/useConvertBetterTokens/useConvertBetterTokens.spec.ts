import { act, renderHook } from "@testing-library/react-hooks"
import { useConvertBetterTokens } from "./useConvertBetterTokens"
import { Routes } from "~Navigation"
import { BigNutils } from "~Utils"
import { TestWrapper, TestHelpers } from "~Test"
import { abi, Transaction } from "thor-devkit"
import { abis, B3TR, VOT3 } from "~Constants"
import { ethers } from "ethers"

const mockedNavigate = jest.fn()
const mockedReplace = jest.fn()

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            replace: mockedReplace,
        }),
    }
})

describe("useConvertBetterTokens", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("navigate to convert B3TR token to VOT3", async () => {
        const amount = "1"
        const { result } = renderHook(() => useConvertBetterTokens(), { wrapper: TestWrapper })
        const { convertB3tr } = result.current

        await act(async () => convertB3tr(amount))

        const spender = VOT3.address
        const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()

        const approveData = new abi.Function(abis.VeBetterDao.B3trAbis.approve).encode(spender, formattedAmount)
        const convertData = new abi.Function(abis.VeBetterDao.Vot3Abis.convertToVOT3).encode(formattedAmount)

        const b3trMockedClauses: Transaction.Clause[] = [
            {
                to: B3TR.address,
                data: approveData,
                value: "0x0",
            },
            {
                to: VOT3.address,
                data: convertData,
                value: "0x0",
            },
        ]

        expect(mockedReplace).toHaveBeenCalledWith(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
            amount: BigNutils(amount).toString,
            transactionClauses: b3trMockedClauses,
            token: TestHelpers.data.B3TRWithCompleteInfo,
        })
    })

    it("navigate to convert VOT3 to B3TR", async () => {
        const amount = "1"
        const { result } = renderHook(() => useConvertBetterTokens(), { wrapper: TestWrapper })
        const { convertVot3 } = result.current

        await act(async () => convertVot3(amount))

        const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()

        const convertData = new abi.Function(abis.VeBetterDao.Vot3Abis.convertToB3TR).encode(formattedAmount)

        const vot3MockedClauses: Transaction.Clause[] = [
            {
                to: VOT3.address,
                data: convertData,
                value: "0x0",
            },
        ]

        expect(mockedReplace).toHaveBeenCalledWith(Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN, {
            amount: BigNutils(amount).toString,
            transactionClauses: vot3MockedClauses,
            //Sending B3TR here because VOT3 doesn't have exchange rate since is the same of B3TR
            token: TestHelpers.data.B3TRWithCompleteInfo,
        })
    })
})
