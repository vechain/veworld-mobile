import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useTransactionBuilder } from "~Hooks/useTransactionBuilder/useTransactionBuilder"
import TestData from "../../Test/helpers"

const { vetTransaction1 } = TestData.data

describe("useTransactionBuilder", () => {
    it("should be defined", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.buildTransaction).toBeDefined()
    })

    it("should throw an error if no gas is provided", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current.buildTransaction).toThrow()
    })

    it("should build with provided gas", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: false,
                    providedGas: 21000,
                }),
            { wrapper: TestWrapper },
        )

        const tx = result.current.buildTransaction()
        expect(tx).toBeDefined()
        expect(tx.body.clauses).toEqual(vetTransaction1.body.clauses)
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
                }),
            { wrapper: TestWrapper },
        )

        const tx = result.current.buildTransaction()
        expect(tx).toBeDefined()
        expect(tx.body.clauses).toEqual(vetTransaction1.body.clauses)
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
                }),
            { wrapper: TestWrapper },
        )

        const tx = result.current.buildTransaction()
        expect(tx.body.dependsOn).toEqual(dependsOn)
    })

    it("delegated txs should have feature defined", async () => {
        const { result } = renderHook(
            () =>
                useTransactionBuilder({
                    clauses: vetTransaction1.body.clauses,
                    isDelegated: true,
                    providedGas: 21000,
                }),
            { wrapper: TestWrapper },
        )

        const tx = result.current.buildTransaction()

        expect(tx.body.reserved).toEqual({ features: 1 })
    })
})
