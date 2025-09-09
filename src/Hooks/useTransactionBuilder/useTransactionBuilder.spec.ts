import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useTransactionBuilder } from "~Hooks/useTransactionBuilder/useTransactionBuilder"
import TestData from "../../Test/helpers"
import { DEVICE_TYPE } from "../../Model/Wallet/enum"
import { Transaction } from "@vechain/sdk-core"
import BigNumberUtils from "../../Utils/BigNumberUtils"
import { B3TR } from "../../Constants"

const { vetTransaction1 } = TestData.data

const mockUseSmartWallet = jest.fn().mockReturnValue({
    isAuthenticated: true,
    isInitialized: true,
    buildTransaction: jest.fn().mockResolvedValue(
        Transaction.of({
            ...vetTransaction1.body,
            gas: 21000,
        }),
    ),
})

jest.mock("~Hooks/useSmartWallet", () => ({
    ...jest.requireActual("~Hooks/useSmartWallet"),
    useSmartWallet: (...args: unknown[]) => mockUseSmartWallet(...args),
}))

describe("useTransactionBuilder", () => {
    it("should be defined", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                    gas: {
                        caller: "string",
                        gas: 21000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                        baseGasPrice: "21000",
                    },
                    deviceType: DEVICE_TYPE.LOCAL_MNEMONIC,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.buildTransaction).toBeDefined()
    })

    it("should build with provided gas", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                    gas: {
                        caller: "string",
                        gas: 21000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                        baseGasPrice: "21000",
                    },
                    deviceType: DEVICE_TYPE.LOCAL_MNEMONIC,
                    providedGas: 21000,
                }),
            { wrapper: TestWrapper },
        )

        const tx = await result.current.buildTransaction()
        expect(tx).toBeDefined()
        expect(tx.body.clauses).toEqual(vetTransaction1.body.clauses)
        expect(tx.body.gas).toEqual(21000)
    })

    it("should build with gas from estimate", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                    gas: {
                        caller: "string",
                        gas: 21000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                        baseGasPrice: "21000",
                    },
                    deviceType: DEVICE_TYPE.LOCAL_MNEMONIC,
                }),
            { wrapper: TestWrapper },
        )

        const tx = await result.current.buildTransaction()
        expect(tx).toBeDefined()
        expect(tx.body.clauses).toEqual(vetTransaction1.body.clauses)
        expect(tx.body.gas).toEqual(21000)
    })

    it("dependsOn should be defined", async () => {
        const dependsOn = "0x1234"

        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                    providedGas: 21000,
                    dependsOn,
                    gas: {
                        caller: "string",
                        gas: 21000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                        baseGasPrice: "21000",
                    },
                    deviceType: DEVICE_TYPE.LOCAL_MNEMONIC,
                }),
            { wrapper: TestWrapper },
        )

        const tx = await result.current.buildTransaction()
        expect(tx.body.dependsOn).toEqual(dependsOn)
    })

    it("delegated txs should have feature defined", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: true,
                    providedGas: 21000,
                    gas: {
                        caller: "string",
                        gas: 21000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                        baseGasPrice: "21000",
                    },
                    deviceType: DEVICE_TYPE.LOCAL_MNEMONIC,
                }),
            { wrapper: TestWrapper },
        )

        const tx = await result.current.buildTransaction()

        expect(tx.body.reserved).toBeDefined()
        expect(tx.body.reserved).toEqual({ features: 1 })
    })

    it("should build with smart wallet transaction for a smart wallet device", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: true,
                    gas: {
                        caller: "string",
                        gas: 21000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                        baseGasPrice: "21000",
                    },
                    deviceType: DEVICE_TYPE.SMART_WALLET,
                    providedGas: 21000,
                    genericDelgationDetails: {
                        token: B3TR.name,
                        tokenAddress: B3TR.address,
                        fee: BigNumberUtils("1000000000000000000"),
                        depositAccount: "0x1234567890123456789012345678901234567890",
                    },
                }),
            { wrapper: TestWrapper },
        )

        const tx = await result.current.buildTransaction()

        expect(mockUseSmartWallet().buildTransaction).toHaveBeenCalledWith(
            vetTransaction1.body.clauses,
            expect.objectContaining({ isDelegated: true }),
            expect.objectContaining({
                token: B3TR.name,
                tokenAddress: B3TR.address,
                fee: BigNumberUtils("1000000000000000000"),
                depositAccount: "0x1234567890123456789012345678901234567890",
            }),
        )
        expect(tx).toBeDefined()
        expect(tx.body.clauses).toEqual(vetTransaction1.body.clauses)
        expect(tx.body.gas).toEqual(21000)
    })
})
