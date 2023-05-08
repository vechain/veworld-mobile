import { renderHook } from "@testing-library/react-hooks"
import { useAppInitState, AppInitState } from "./useAppInitState"
import {
    selectHasOnboarded,
    selectIsResettingApp,
} from "~Storage/Redux/Selectors"
import { TestWrapper } from "~Test"

jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectHasOnboarded: jest.fn(),
    selectIsResettingApp: jest.fn(),
}))

describe("useAppInitState", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it("returns INIT_STATE if user has not onboarded yet", async () => {
        ;(selectIsResettingApp as unknown as jest.Mock).mockImplementationOnce(
            () => false,
        )
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementationOnce(
            () => false,
        )

        const { result, waitForNextUpdate } = renderHook(useAppInitState, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate()
        expect(result.current).toEqual(AppInitState.INIT_STATE)
    })

    it("returns RESETTING_STATE if app is resetting", async () => {
        ;(selectIsResettingApp as unknown as jest.Mock).mockImplementationOnce(
            () => true,
        )
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementationOnce(
            () => false,
        )

        const { result, waitForNextUpdate } = renderHook(useAppInitState, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate()
        expect(result.current).toEqual(AppInitState.RESETTING_STATE)
    })

    it("returns ONBOARDED_STATE if app is onboarded", async () => {
        ;(selectIsResettingApp as unknown as jest.Mock).mockImplementationOnce(
            () => false,
        )
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementationOnce(
            () => true,
        )

        const { result, waitForNextUpdate } = renderHook(useAppInitState, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate()
        expect(result.current).toEqual(AppInitState.ONBOARDED_STATE)
    })
})
