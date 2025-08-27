import { act, fireEvent, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { Share } from "react-native"
import { DiscoveryDApp } from "~Constants"
import { useDappBookmarking } from "~Hooks/useDappBookmarking"
import { useDAppActions } from "../../Hooks"
import { DappOptionsBottomSheetV2 } from "./DappOptionsBottomSheetV2"

jest.mock("../../Hooks", () => ({
    ...jest.requireActual("../../Hooks"),
    useDAppActions: jest.fn(),
}))

jest.mock("~Hooks/useDappBookmarking", () => ({
    ...jest.requireActual("~Hooks/useDappBookmarking"),
    useDappBookmarking: jest.fn(),
}))

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native")
    return {
        ...RN,
        NativeModules: {
            ...RN.NativeModules,
            PackageDetails: {
                getPackageInfo: jest.fn().mockResolvedValue({
                    packageName: "com.veworld.app",
                    versionName: "1.0.0",
                    versionCode: 1,
                    isOfficial: true,
                }),
            },
        },
        Share: { share: jest.fn() },
    }
})

describe("DappOptionsBottomSheetV2", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", async () => {
        const ref = { current: null }

        const onDAppPress = jest.fn()
        const toggleBookmark = jest.fn()

        ;(useDAppActions as jest.Mock).mockReturnValue({ onDAppPress })
        ;(useDappBookmarking as jest.Mock).mockReturnValue({ isBookMarked: false, toggleBookmark })

        TestHelpers.render.renderComponentWithProps(<DappOptionsBottomSheetV2 bsRef={ref as any} />, {
            wrapper: TestWrapper,
        })

        await act(() => {
            ;(ref.current as any)?.present({
                amountOfNavigations: 1,
                createAt: Date.now(),
                href: "https://vechain.org",
                isCustom: true,
                name: "Vechain",
            } satisfies DiscoveryDApp)
        })

        expect(screen.getByTestId("DAPP_OPTIONS_V2_OPEN_DAPP")).toBeVisible()
        await act(() => {
            fireEvent.press(screen.getByTestId("DAPP_OPTIONS_V2_OPEN_DAPP"))
        })

        expect(onDAppPress).toHaveBeenCalled()

        await act(() => {
            fireEvent.press(screen.getByTestId("DAPP_OPTIONS_V2_TOGGLE_FAVORITE"))
        })

        expect(toggleBookmark).toHaveBeenCalled()

        await act(() => {
            fireEvent.press(screen.getByTestId("DAPP_OPTIONS_V2_SHARE"))
        })

        expect(Share.share).toHaveBeenCalledWith({
            message: expect.any(String),
            url: "https://vechain.org",
        })
    })
})
