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

const clausesStubs = TestHelpers.data.clauses

describe("GasUtils", () => {
    describe("estimateGas", () => {
        it("should return the estimated gas - no clauses", async () => {
            const estimated = await GasUtils.estimateGas(thor, [], 0, "0x")
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 36001,
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
                [
                    ...clausesStubs,
                    {
                        to: "0x0000000000000000000000000000456e65726779",
                        data: "0x",
                    } as Connex.VM.Clause,
                ],
                0,
                "0x",
            )
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 100001,
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
                clausesStubs,
                0,
                "0x",
                TestHelpers.data.account1D1.address,
            )
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 84001,
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
        it("should run correctly with suggested gas", async () => {
            const reverted = await GasUtils.estimateGas(
                thorExplainExecuteVmError,
                [],
                50000,
                "0x",
                TestHelpers.data.account1D1.address,
            )
            expect(reverted).toStrictEqual({
                caller: "0x",
                gas: 50000,
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
