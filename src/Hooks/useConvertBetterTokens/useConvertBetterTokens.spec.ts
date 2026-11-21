import { act, renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import { abi, Transaction } from "thor-devkit"
import { abis, B3TR, VOT3 } from "~Constants"
import { Routes } from "~Navigation"
import { TestHelpers, TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { useConvertBetterTokens } from "./useConvertBetterTokens"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { useGetVot3Delegatee } from "~Hooks/VeBetterDao/useGetVot3Delegatee"

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

jest.mock("~Hooks/useTokenBalance", () => ({
    useTokenBalance: jest.fn(),
}))

jest.mock("~Hooks/VeBetterDao/useGetVot3Delegatee", () => ({
    useGetVot3Delegatee: jest.fn(),
}))

describe("useConvertBetterTokens", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useGetVot3Delegatee as jest.Mock).mockReturnValue({ data: undefined, isSuccess: false })
    })
    it("navigate to convert B3TR token to VOT3", async () => {
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: TestHelpers.data.B3TRWithBalance.balance,
        })
        const amount = "1"
        const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()
        const { result } = renderHook(() => useConvertBetterTokens(), { wrapper: TestWrapper })
        const { convertB3tr } = result.current

        await act(async () => convertB3tr(formattedAmount, amount))

        const spender = VOT3.address

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
        ;(useTokenBalance as jest.Mock).mockReturnValue({
            data: TestHelpers.data.B3TRWithBalance.balance,
        })
        const amount = "1"
        const formattedAmount = ethers.utils.parseEther(amount.toString()).toString()
        const { result } = renderHook(() => useConvertBetterTokens(), { wrapper: TestWrapper })
        const { convertVot3 } = result.current

        await act(async () => convertVot3(formattedAmount, amount))

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

    describe("smart wallet accounts", () => {
        const { smartWalletDevice } = TestHelpers.data

        const smartWalletAccount = {
            address: "0xCf130b42AE33C5531277B4b7c0F1D994B8732957",
            alias: "Smart Account 1",
            index: 0,
            rootAddress: smartWalletDevice.rootAddress,
            visible: true,
        }

        const smartWalletState = {
            accounts: {
                accounts: [smartWalletAccount],
                selectedAccount: smartWalletAccount.address,
            },
            devices: [smartWalletDevice],
        }

        it("prepends a VOT3 self-delegate clause when the smart account has no delegatee", async () => {
            ;(useTokenBalance as jest.Mock).mockReturnValue({
                data: TestHelpers.data.B3TRWithBalance.balance,
            })
            ;(useGetVot3Delegatee as jest.Mock).mockReturnValue({
                data: ethers.constants.AddressZero,
                isSuccess: true,
            })
            const amount = "1"
            const formattedAmount = ethers.utils.parseEther(amount).toString()
            const { result } = renderHook(() => useConvertBetterTokens(), {
                wrapper: TestWrapper,
                initialProps: { preloadedState: smartWalletState },
            })

            expect(result.current.isConvertB3trDisabled).toBe(false)

            await act(async () => result.current.convertB3tr(formattedAmount, amount))

            const delegateData = new abi.Function(abis.VeBetterDao.Vot3Abis.delegate).encode(smartWalletAccount.address)
            const approveData = new abi.Function(abis.VeBetterDao.B3trAbis.approve).encode(
                VOT3.address,
                formattedAmount,
            )
            const convertData = new abi.Function(abis.VeBetterDao.Vot3Abis.convertToVOT3).encode(formattedAmount)

            expect(mockedReplace).toHaveBeenCalledWith(
                Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN,
                expect.objectContaining({
                    transactionClauses: [
                        {
                            to: VOT3.address,
                            data: delegateData,
                            value: "0x0",
                        },
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
                    ],
                }),
            )
        })

        it("does not prepend a delegate clause when the smart account already has a delegatee", async () => {
            ;(useTokenBalance as jest.Mock).mockReturnValue({
                data: TestHelpers.data.B3TRWithBalance.balance,
            })
            ;(useGetVot3Delegatee as jest.Mock).mockReturnValue({
                data: smartWalletAccount.address,
                isSuccess: true,
            })
            const amount = "1"
            const formattedAmount = ethers.utils.parseEther(amount).toString()
            const { result } = renderHook(() => useConvertBetterTokens(), {
                wrapper: TestWrapper,
                initialProps: { preloadedState: smartWalletState },
            })

            await act(async () => result.current.convertB3tr(formattedAmount, amount))

            const approveData = new abi.Function(abis.VeBetterDao.B3trAbis.approve).encode(
                VOT3.address,
                formattedAmount,
            )
            const convertData = new abi.Function(abis.VeBetterDao.Vot3Abis.convertToVOT3).encode(formattedAmount)

            expect(mockedReplace).toHaveBeenCalledWith(
                Routes.CONVERT_BETTER_TOKENS_TRANSACTION_SCREEN,
                expect.objectContaining({
                    transactionClauses: [
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
                    ],
                }),
            )
        })

        it("blocks the conversion while the smart account delegatee is unknown", () => {
            ;(useTokenBalance as jest.Mock).mockReturnValue({
                data: TestHelpers.data.B3TRWithBalance.balance,
            })
            ;(useGetVot3Delegatee as jest.Mock).mockReturnValue({
                data: undefined,
                isSuccess: false,
            })
            const amount = "1"
            const formattedAmount = ethers.utils.parseEther(amount).toString()
            const { result } = renderHook(() => useConvertBetterTokens(), {
                wrapper: TestWrapper,
                initialProps: { preloadedState: smartWalletState },
            })

            expect(result.current.isConvertB3trDisabled).toBe(true)
            expect(() => result.current.convertB3tr(formattedAmount, amount)).toThrow("VOT3 delegatee not loaded")
            expect(mockedReplace).not.toHaveBeenCalled()
        })
    })
})
