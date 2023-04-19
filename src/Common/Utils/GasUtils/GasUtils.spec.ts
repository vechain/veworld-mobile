import { TestHelpers } from "~Test"
import GasUtils from "./GasUtils"
import BigNumber from "bignumber.js"

const thor = TestHelpers.thor.mockThorInstance({})
const thorExplainExecuteVmError = TestHelpers.thor.mockThorInstance({
    explain: (clauses: Connex.VM.Clause[]) => ({
        ...TestHelpers.thor.stubs.explain.explain(clauses),
        execute:
            TestHelpers.thor.stubs.explain.stubs.execute.vmErrorExecuteStub,
    }),
})
const thorExplainExecuteReverts = TestHelpers.thor.mockThorInstance({
    explain: (clauses: Connex.VM.Clause[]) => ({
        ...TestHelpers.thor.stubs.explain.explain(clauses),
        execute:
            TestHelpers.thor.stubs.explain.stubs.execute.revertingExecuteStub,
    }),
})

describe("GasUtils", () => {
    describe("estimateGas", () => {
        it("should return the estimated gas - no clauses", async () => {
            const estimated = await GasUtils.estimateGas(thor, [], 0, "0x")
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 21000,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice:
                    "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it("should return the estimated gas - clauses", async () => {
            const estimated = await GasUtils.estimateGas(
                thor,
                TestHelpers.data.clauses,
                0,
                "0x",
            )
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 53000,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice:
                    "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it("should return the estimated gas - gasPayer", async () => {
            const estimated = await GasUtils.estimateGas(
                thor,
                TestHelpers.data.clauses,
                0,
                "0x",
                TestHelpers.data.account1D1.address,
            )
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 53000,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice:
                    "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it("should return the estimated gas - reverted", async () => {
            const reverted = await GasUtils.estimateGas(
                thorExplainExecuteReverts,
                [],
                0,
                "0x",
                TestHelpers.data.account1D1.address,
            )
            expect(reverted).toStrictEqual({
                caller: "0x",
                gas: 36001,
                reverted: true,
                revertReason: "revertReason",
                vmError: "",
                baseGasPrice:
                    "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it("should return the estimated gas - vmError", async () => {
            const reverted = await GasUtils.estimateGas(
                thorExplainExecuteVmError,
                [],
                0,
                "0x",
                TestHelpers.data.account1D1.address,
            )
            expect(reverted).toStrictEqual({
                caller: "0x",
                gas: 36001,
                reverted: false,
                revertReason: "vmError",
                vmError: "vmError",
                baseGasPrice:
                    "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })
    })

    describe("calculateFee", () => {
        it("should return the calculated fee", async () => {
            const fee = await GasUtils.calculateFee(thor, 0, 0)
            expect(fee).toStrictEqual(new BigNumber(0))
        })
    })
})
