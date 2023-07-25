import { renderHook } from "@testing-library/react-hooks"
import { AppInitState, useAppInitState } from "./useAppInitState"
import { selectHasOnboarded } from "~Storage/Redux/Selectors"
import { TestWrapper } from "~Test"

jest.mock("~Storage/Redux/Selectors", () => ({
    ...jest.requireActual("~Storage/Redux/Selectors"),
    selectHasOnboarded: jest.fn(),
}))

describe("useAppInitState", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it("returns INIT_STATE if user has not onboarded yet", async () => {
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementationOnce(
            () => false,
        )

        const { result, waitForNextUpdate } = renderHook(useAppInitState, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate({ timeout: 5000 })
        expect(result.current).toEqual(AppInitState.INIT_STATE)
    })

    it("returns ONBOARDED_STATE if app is onboarded", async () => {
        ;(selectHasOnboarded as unknown as jest.Mock).mockImplementationOnce(
            () => true,
        )

        const { result, waitForNextUpdate } = renderHook(useAppInitState, {
            wrapper: TestWrapper,
        })
        await waitForNextUpdate({ timeout: 5000 })
        expect(result.current).toEqual(AppInitState.ONBOARDED_STATE)
    })
})
