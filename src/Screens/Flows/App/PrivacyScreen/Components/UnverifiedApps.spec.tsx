import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React, { createRef } from "react"

import { useBottomSheetModal } from "~Hooks/useBottomSheet"
import { TestHelpers, TestWrapper } from "~Test"

import moment from "moment"
import { CURRENCY, CURRENCY_FORMATS, SYMBOL_POSITIONS, ThemeEnum } from "~Constants"
import { AmountInputMode } from "~Model"
import { UnverifiedApps } from "./UnverifiedApps"

const setDeveloperAppsEnabled = jest
    .fn()
    .mockImplementation(payload => ({ type: "userPreferences/setDeveloperAppsEnabled", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    setDeveloperAppsEnabled: (...args: any[]) => setDeveloperAppsEnabled(...args),
}))

jest.mock("~Hooks/useBottomSheet", () => ({
    useBottomSheetModal: jest.fn(),
}))

describe("UnverifiedApps", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should trigger the bottomsheet if the toggle is toggled to on", () => {
        const ref = createRef()
        const onOpenPlain = jest.fn()
        ;(useBottomSheetModal as jest.Mock).mockReturnValue({
            ref,
            onOpenPlain,
        })

        render(<UnverifiedApps />, {
            wrapper: TestWrapper,
        })

        act(() => {
            fireEvent.press(screen.getByTestId("UNVERIFIED_APP_TOGGLE"))
        })

        expect(onOpenPlain).toHaveBeenCalled()
        expect(setDeveloperAppsEnabled).not.toHaveBeenCalled()
    })
    it("should not trigger the bottomsheet if the toggle is toggled to off", () => {
        const ref = createRef()
        const onOpenPlain = jest.fn()
        ;(useBottomSheetModal as jest.Mock).mockReturnValue({
            ref,
            onOpenPlain,
        })

        TestHelpers.render.renderComponentWithProps(<UnverifiedApps />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    userPreferences: {
                        balanceVisible: true,
                        currency: CURRENCY.USD,
                        theme: ThemeEnum.SYSTEM,
                        hideTokensWithNoBalance: false,
                        isPinCodeRequired: true,
                        currencyFormat: CURRENCY_FORMATS.SYSTEM,
                        symbolPosition: SYMBOL_POSITIONS.BEFORE,
                        language: "en" as const,
                        isSentryTrackingEnabled: true,
                        devFeaturesEnabled: true,
                        isAnalyticsTrackingEnabled: true,
                        lastReviewTimestamp: moment().subtract(3, "weeks").add(3, "days").toISOString(),
                        lastVersionCheck: moment().toISOString(),
                        lastNotificationReminder: null,
                        developerAppsEnabled: true,
                        defaultAmountInputMode: AmountInputMode.FIAT,
                    },
                },
            },
        })

        act(() => {
            fireEvent.press(screen.getByTestId("UNVERIFIED_APP_TOGGLE"))
        })

        expect(setDeveloperAppsEnabled).toHaveBeenCalledWith(false)
    })
})
