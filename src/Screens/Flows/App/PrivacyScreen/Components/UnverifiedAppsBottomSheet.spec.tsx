import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"

import { TestWrapper } from "~Test"

import { UnverifiedAppsBottomSheet } from "./UnverifiedAppsBottomSheet"

const setDeveloperAppsEnabled = jest
    .fn()
    .mockImplementation(payload => ({ type: "userPreferences/setDeveloperAppsEnabled", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    setDeveloperAppsEnabled: (...args: any[]) => setDeveloperAppsEnabled(...args),
}))

describe("UnverifiedAppsBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should be able to close", () => {
        const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any

        render(<UnverifiedAppsBottomSheet bsRef={bsRef} />, { wrapper: TestWrapper })

        const spiedClose = jest.spyOn(bsRef.current, "close")

        act(() => {
            fireEvent.press(screen.getByTestId("UNVERIFIED_APPS_BS_BACK"))
        })

        expect(spiedClose).toHaveBeenCalled()
    })
    it("should be able to allow", () => {
        const bsRef = { current: { present: jest.fn(), close: jest.fn() } } as any

        render(<UnverifiedAppsBottomSheet bsRef={bsRef} />, { wrapper: TestWrapper })

        const spiedClose = jest.spyOn(bsRef.current, "close")

        act(() => {
            fireEvent.press(screen.getByTestId("UNVERIFIED_APPS_BS_ALLOW"))
        })

        expect(setDeveloperAppsEnabled).toHaveBeenCalledWith(true)
        expect(spiedClose).toHaveBeenCalled()
    })
})
