import axios from "axios"
import BigNumber from "bignumber.js"
import { Transaction } from "thor-devkit"
import { GasPriceCoefficient, MAX_TX_GAS_LIMIT } from "~Constants"
import { TestHelpers } from "~Test"
import GasUtils from "./GasUtils"
import { TransactionClause } from "@vechain/sdk-core"

const url = "https://mainnet.vechain.org"

const clausesStubs = TestHelpers.data.clauses as TransactionClause[]

jest.mock("axios", () => ({
    get: jest.fn(() => ({
        headers: {
            get: jest.fn(() => "2.1.0"),
        },
    })),
    post: jest.fn(),
    create: jest.fn(),
}))

describe("GasUtils", () => {
    describe("estimateGas", () => {
        const output = (overrides: Partial<Connex.VM.Output> = {}): Connex.VM.Output => ({
            data: "0x000000000000000000000000000000000000000000000000000009184e72a000",
            events: [],
            transfers: [],
            gasUsed: 591,
            reverted: false,
            vmError: "",
            revertReason: "",
            ...overrides,
        })

        /** Simulates clauses that pass only when offered at least `minGas`. */
        const mockNode = (minGas: number, out = output()) => {
            ;(axios.post as jest.Mock).mockImplementation(async (_url: string, body: { gas: number }) => ({
                data: [
                    body.gas >= minGas
                        ? out
                        : output({
                              // A proxy burns ~63/64 of the budget before the inner call dies.
                              gasUsed: Math.floor((body.gas * 63) / 64),
                              reverted: true,
                              vmError: "execution reverted",
                              revertReason: "",
                          }),
                ],
            }))
        }

        const offeredGas = () => (axios.post as jest.Mock).mock.calls.map(([, body]) => body.gas)

        const INTRINSIC = Transaction.intrinsicGas(
            clausesStubs.map(item => ({ to: item.to, value: item.value || "0x0", data: item.data || "0x" })),
        )
        const MAX_EXEC = MAX_TX_GAS_LIMIT - INTRINSIC

        beforeEach(() => {
            ;(axios.post as jest.Mock).mockReset()
        })

        it("should return the estimated gas - no clauses", async () => {
            mockNode(0)

            const estimated = await GasUtils.estimateGas(url, [], 0, "0x")

            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 36591,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice: "10000000000000",
                outputs: [output()],
                exceedsTxGasLimit: false,
            })
            // Simulated once at 20M, then re-verified at the budget that will be sent.
            expect(offeredGas()).toEqual([20000000, 591 + 15000])
            expect(axios.post).toHaveBeenCalledWith(
                `${url}/accounts/*?revision=best`,
                expect.objectContaining({ caller: "0x", clauses: [] }),
            )
        })

        it("should return the estimated gas - clauses", async () => {
            mockNode(0)

            const estimated = await GasUtils.estimateGas(
                url,
                [
                    ...clausesStubs,
                    {
                        to: "0x0000000000000000000000000000456e65726779",
                        data: "0x",
                    } as TransactionClause,
                ],
                0,
                "0x",
            )
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 100591,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice: "10000000000000",
                outputs: [output()],
                exceedsTxGasLimit: false,
            })
        })

        it("should return the estimated gas - gasPayer", async () => {
            mockNode(0)

            const estimated = await GasUtils.estimateGas(
                url,
                clausesStubs,
                0,
                "0x",
                TestHelpers.data.account1D1.address,
            )
            expect(estimated).toStrictEqual({
                caller: "0x",
                gas: 84591,
                reverted: false,
                revertReason: "",
                vmError: "",
                baseGasPrice: "10000000000000",
                outputs: [output()],
                exceedsTxGasLimit: false,
            })
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ gasPayer: TestHelpers.data.account1D1.address }),
            )
        })

        it("should return the estimated gas - reverted", async () => {
            const out = output({ gasUsed: 36591, reverted: true, revertReason: "revertReason" })
            ;(axios.post as jest.Mock).mockResolvedValue({ data: [out] })

            const reverted = await GasUtils.estimateGas(url, [], 0, "0x", TestHelpers.data.account1D1.address)
            expect(reverted).toStrictEqual({
                caller: "0x",
                gas: 72591,
                reverted: true,
                revertReason: "revertReason",
                vmError: "",
                baseGasPrice: "10000000000000",
                outputs: [out],
                exceedsTxGasLimit: false,
            })
            // A call that reverts regardless of gas is not re-simulated.
            expect(offeredGas()).toEqual([20000000])
        })

        it("should return the estimated gas - vmError", async () => {
            const out = output({ reverted: true, vmError: "vmError", revertReason: "vmError" })
            ;(axios.post as jest.Mock).mockResolvedValue({ data: [out] })

            const reverted = await GasUtils.estimateGas(url, [], 0, "0x", TestHelpers.data.account1D1.address)
            expect(reverted).toStrictEqual({
                caller: "0x",
                gas: 36591,
                reverted: true,
                revertReason: "vmError",
                vmError: "vmError",
                baseGasPrice: "10000000000000",
                outputs: [out],
                exceedsTxGasLimit: false,
            })
        })

        it("should run correctly with suggested gas", async () => {
            const out = output({ vmError: "vmError", revertReason: "vmError" })
            ;(axios.post as jest.Mock).mockResolvedValue({ data: [out] })

            const reverted = await GasUtils.estimateGas(url, [], 50000, "0x", TestHelpers.data.account1D1.address)
            expect(reverted).toStrictEqual({
                caller: "0x",
                gas: 50000,
                reverted: false,
                revertReason: "vmError",
                vmError: "vmError",
                baseGasPrice: "10000000000000",
                outputs: [out],
                exceedsTxGasLimit: false,
            })
            // Provided gas is simulated once, at the provided exec budget.
            expect(offeredGas()).toEqual([50000 - 21000])
        })

        it("should charge only intrinsic gas when nothing executes", async () => {
            mockNode(0, output({ gasUsed: 0 }))

            const estimated = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

            expect(estimated).toMatchObject({ gas: INTRINSIC, exceedsTxGasLimit: false })
            expect(offeredGas()).toEqual([20000000])
        })

        it("should bump the estimate when a proxy hop makes exec + headroom revert", async () => {
            const EXEC = 965483
            // One DELEGATECALL hop: 63/64 of the budget has to cover EXEC.
            const minGas = Math.ceil((EXEC * 64) / 63)
            mockNode(minGas, output({ gasUsed: EXEC }))

            const res = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

            expect(res.gas - INTRINSIC).toBeGreaterThanOrEqual(minGas)
            expect(res.gas - INTRINSIC).toBeLessThan(minGas + 20000)
            expect(res).toMatchObject({ reverted: false, exceedsTxGasLimit: false })
            expect(offeredGas()).toHaveLength(3)
        })

        it("should bisect when the call chain needs more than the proxy probes", async () => {
            const EXEC = 965483
            const minGas = Math.ceil(EXEC * 1.25)
            mockNode(minGas, output({ gasUsed: EXEC }))

            const res = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

            expect(res.gas - INTRINSIC).toBeGreaterThanOrEqual(minGas)
            expect(res.gas - INTRINSIC).toBeLessThan(minGas + 100000)
            expect(offeredGas().length).toBeLessThanOrEqual(2 + 4 + 1 + 8)
            expect(Math.max(...offeredGas().slice(1))).toBeLessThanOrEqual(MAX_EXEC)
        })

        it("should throw when the node is unreachable", async () => {
            ;(axios.post as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"))

            await expect(GasUtils.estimateGas(url, clausesStubs, 0, "0x")).rejects.toThrow("ECONNREFUSED")
        })

        describe("per-transaction gas cap", () => {
            it("should flag an estimate above the cap without re-simulating", async () => {
                const exec = 18000000
                mockNode(0, output({ gasUsed: exec }))

                const res = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

                expect(res).toMatchObject({
                    gas: INTRINSIC + exec + 15000,
                    reverted: false,
                    exceedsTxGasLimit: true,
                })
                expect(offeredGas()).toEqual([20000000])
            })

            it("should flag a call that runs out of gas at the simulation budget", async () => {
                mockNode(21000000)

                const res = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

                expect(res).toMatchObject({ reverted: true, exceedsTxGasLimit: true })
                expect(res.gas).toBeGreaterThan(MAX_TX_GAS_LIMIT)
                expect(offeredGas()).toEqual([20000000])
            })

            it("should never step the verified budget above the cap", async () => {
                // Fits at 20M, but the proxy hop pushes the real need past the cap.
                const exec = MAX_EXEC - 100000
                mockNode(MAX_EXEC + 1, output({ gasUsed: exec }))

                const res = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

                expect(res).toMatchObject({ reverted: false, exceedsTxGasLimit: true })
                expect(Math.max(...offeredGas().slice(1))).toBe(MAX_EXEC)
            })

            it("should accept a budget that passes exactly at the cap", async () => {
                const exec = MAX_EXEC - 100000
                mockNode(MAX_EXEC, output({ gasUsed: exec }))

                const res = await GasUtils.estimateGas(url, clausesStubs, 0, "0x")

                expect(res).toMatchObject({ gas: MAX_TX_GAS_LIMIT, exceedsTxGasLimit: false })
            })

            it("should flag provided gas above the cap", async () => {
                mockNode(0)
                const provided = MAX_TX_GAS_LIMIT + 1

                const res = await GasUtils.estimateGas(url, clausesStubs, provided, "0x")

                expect(res).toMatchObject({ gas: provided, exceedsTxGasLimit: true })
                expect(offeredGas()).toHaveLength(1)
            })
        })
    })

    describe("formatGasMillions", () => {
        it("should format gas in millions with one decimal", () => {
            expect(GasUtils.formatGasMillions(MAX_TX_GAS_LIMIT)).toBe("16.8M")
            expect(GasUtils.formatGasMillions(20912345)).toBe("20.9M")
        })
    })

    describe("gasToVtho", () => {
        describe("when the gas coefficient is regular", () => {
            it("should return the regular fee", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.REGULAR,
                })
                expect(gasFee).toStrictEqual("0.21")
            })
        })
        describe("when the gas coefficient is medium", () => {
            it("should return the medium fee", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.MEDIUM,
                })
                expect(gasFee).toStrictEqual("0.31")
            })
        })
        describe("when the gas coefficient is high", () => {
            it("should return the medium fee", async () => {
                const { gasFee } = await GasUtils.gasToVtho({
                    gas: new BigNumber(21000),
                    baseGasPrice: new BigNumber("10000000000000"),
                    gasPriceCoefficient: GasPriceCoefficient.HIGH,
                })
                expect(gasFee).toStrictEqual("0.42")
            })
        })
        describe("when the gas coefficient is medium and decimals are 2", () => {
            it("should return the medium fee with 2 decimals", async () => {
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
