import { renderHook } from "@testing-library/react-hooks"
import { waitFor } from "@testing-library/react-native"
import { useLegderConfig } from "./useLedgerConfig"
import { TestHelpers } from "~Test"
import { LedgerConfig } from "~Utils/LedgerUtils/LedgerUtils"

const { mockLedgerApp } = TestHelpers.data
const appWithClausesAndContractsEnabled = {
    ...mockLedgerApp,
    getAppConfiguration: jest
        .fn()
        .mockResolvedValue(
            Buffer.from(LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED, "hex"),
        ),
}

const appWithClausesEnabled = {
    ...mockLedgerApp,
    getAppConfiguration: jest
        .fn()
        .mockResolvedValue(
            Buffer.from(LedgerConfig.CLAUSE_ONLY_ENABLED, "hex"),
        ),
}
const appWithContractsEnabled = {
    ...mockLedgerApp,
    getAppConfiguration: jest
        .fn()
        .mockResolvedValue(
            Buffer.from(LedgerConfig.CONTRACT_ONLY_ENABLED, "hex"),
        ),
}
const appWithClausesAndContractsDisabled = {
    ...mockLedgerApp,
    getAppConfiguration: jest
        .fn()
        .mockResolvedValue(
            Buffer.from(LedgerConfig.CLAUSE_AND_CONTRACT_DISABLED, "hex"),
        ),
}

const appWithInvalidConfig = {
    ...mockLedgerApp,
    getAppConfiguration: jest.fn().mockImplementation(() => {
        throw new Error("Invalid config")
    }),
}

describe("useLedgerConfig", () => {
    it("no APP - should return the correct values", () => {
        const { result } = renderHook(() => useLegderConfig({ app: undefined }))
        expect(result.current).toEqual({
            config: undefined,
            clausesEnabled: false,
            contractEnabled: false,
            getLedgerConfig: expect.any(Function),
        })
    })
    it("APP with clauses and contracts enabled - should return the correct values", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useLegderConfig({
                // @ts-ignore
                app: appWithClausesAndContractsEnabled,
                reloadConfigTimeout: 100,
            }),
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            config: LedgerConfig.CLAUSE_AND_CONTRACT_ENABLED,
            clausesEnabled: true,
            contractEnabled: true,
            getLedgerConfig: expect.any(Function),
        })
    })
    it("APP with clauses and contracts disabled - should return the correct values", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useLegderConfig({
                // @ts-ignore
                app: appWithClausesAndContractsDisabled,
                reloadConfigTimeout: 100,
            }),
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            config: LedgerConfig.CLAUSE_AND_CONTRACT_DISABLED,
            clausesEnabled: false,
            contractEnabled: false,
            getLedgerConfig: expect.any(Function),
        })
    })
    it("APP with contracts only enabled - should return the correct values", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useLegderConfig({
                // @ts-ignore
                app: appWithContractsEnabled,
                reloadConfigTimeout: 100,
            }),
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            config: LedgerConfig.CONTRACT_ONLY_ENABLED,
            clausesEnabled: false,
            contractEnabled: true,
            getLedgerConfig: expect.any(Function),
        })
    })
    it("APP with clauses only enabled - should return the correct values", async () => {
        const { result, waitForNextUpdate } = renderHook(() =>
            useLegderConfig({
                // @ts-ignore
                app: appWithClausesEnabled,
                reloadConfigTimeout: 100,
            }),
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            config: LedgerConfig.CLAUSE_ONLY_ENABLED,
            clausesEnabled: true,
            contractEnabled: false,
            getLedgerConfig: expect.any(Function),
        })
    })

    it("getAppConfig throw error - should call the callback", async () => {
        const onGetLedgerConfigError = jest.fn()
        renderHook(() =>
            useLegderConfig({
                // @ts-ignore
                app: appWithInvalidConfig,
                reloadConfigTimeout: 100,
                onGetLedgerConfigError,
            }),
        )
        await waitFor(() => expect(onGetLedgerConfigError).toBeCalledTimes(1), {
            timeout: 1000,
        })
    })
})
