import BigNumber from "bignumber.js"
import { GasPriceCoefficient } from "~Constants"
import { TestHelpers } from "~Test"
import GasUtils from "./GasUtils"

const url = "https://mainnet.vechain.org"
const thor = TestHelpers.thor.mockThorInstance({})
const thorExplainExecuteVmError = TestHelpers.thor.mockThorInstance({
    explain: (clauses: Connex.VM.Clause[]) => ({
        ...TestHelpers.thor.stubs.explain.explain(clauses),
        execute: TestHelpers.thor.stubs.explain.stubs.execute.vmErrorExecuteStub,
    }),
})
const thorExplainExecuteReverts = TestHelpers.thor.mockThorInstance({
    explain: (clauses: Connex.VM.Clause[]) => ({
        ...TestHelpers.thor.stubs.explain.explain(clauses),
        execute: TestHelpers.thor.stubs.explain.stubs.execute.revertingExecuteStub,
    }),
})

const clausesStubs = TestHelpers.data.clauses
const axiosMock = {
    get: jest.fn(() => ({
        headers: {
            get: jest.fn(() => "2.0.0"),
        },
    })),
    post: jest.fn(),
    create: jest.fn(),
}

describe("GasUtils", () => {
    beforeAll(() => {
        jest.mock("axios", () => axiosMock)
    })
    describe("estimateGas", () => {
        it("should return the estimated gas - no clauses", async () => {
            jest.mock("axios", () => axiosMock)

            axiosMock.post.mockReturnValue({
                data: [
                    {
                        data: "asdfasdf",
                        vmError: "",
                        gasUsed: 36001,
                        reverted: false,
                        revertReason: "",
                        events: [],
                        transfers: [],
                    },
                ],
            })
            const estimated = await GasUtils.estimateGas(url, thor, [], 0, "0x")

            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 36001,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it.skip("should return the estimated gas - clauses", async () => {
            const estimated = await GasUtils.estimateGas(
                url,
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
                baseGasPrice: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it.skip("should return the estimated gas - gasPayer", async () => {
            const estimated = await GasUtils.estimateGas(
                url,
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
                baseGasPrice: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it.skip("should return the estimated gas - reverted", async () => {
            const reverted = await GasUtils.estimateGas(
                url,
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
                baseGasPrice: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })

        it.skip("should return the estimated gas - vmError", async () => {
            const reverted = await GasUtils.estimateGas(
                url,
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
                baseGasPrice: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })
        it.skip("should run correctly with suggested gas", async () => {
            const reverted = await GasUtils.estimateGas(
                url,
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
                baseGasPrice: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            })
        })
    })

    describe("gasToVtho", () => {
        describe("when the gas coefficient is regular", () => {
            it.skip("should return the regular fee", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.REGULAR,
                })
                expect(gasFee).toStrictEqual("0.21")
            })
        })
        describe("when the gas coefficient is medium", () => {
            it.skip("should return the medium fee", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.MEDIUM,
                })
                expect(gasFee).toStrictEqual("0.31")
            })
        })
        describe("when the gas coefficient is high", () => {
            it.skip("should return the medium fee", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.HIGH,
                })
                expect(gasFee).toStrictEqual("0.42")
            })
        })
        describe("when the gas coefficient is medium and decimals are 2", () => {
            it.skip("should return the medium fee with 2 decimals", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.MEDIUM,
                })
                expect(gasFee).toStrictEqual("0.31")
            })
        })
    })
})
