import { renderHook } from "@testing-library/react-hooks"
import { InAppBrowserProvider, useInAppBrowser } from "./InAppBrowserProvider"
import React from "react"
import { act } from "@testing-library/react-native"
import { RootState } from "../../../Storage/Redux/Types"
import { Provider } from "react-redux"
import { BaseToast } from "react-native-toast-message"
import { getStore } from "../../../Test"
import { PlatformOSType } from "react-native"

jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
}))

jest.mock("react-native/Libraries/Settings/Settings", () => ({
    get: jest.fn(),
    set: jest.fn(),
}))

const mockedNavigate = jest.fn()
const mockedReplace = jest.fn()

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
    }
})

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            replace: mockedReplace,
            canGoBack: jest.fn(),
        }),
    }
})

const createWrapper = (platform: PlatformOSType) => {
    return ({ children, preloadedState }: { children: React.ReactNode; preloadedState: Partial<RootState> }) => (
        <Provider store={getStore(preloadedState)}>
            <InAppBrowserProvider platform={platform}>
                {children}
                <BaseToast />
            </InAppBrowserProvider>
        </Provider>
    )
}

describe("useInAppBrowser hook", () => {
    // This test is to ensure that the browser injects the integrity script on Android.
    // This is to inform Dapps that the app is officialy signed.
    it("should inject integrity script on Android informing if the app is officially signed", async () => {
        const { result, waitForNextUpdate } = renderHook(() => useInAppBrowser(), {
            wrapper: createWrapper("android"),
        })

        await act(async () => {
            await waitForNextUpdate()
        })

        const injectVechainScript = result.current.injectVechainScript()
        expect(injectVechainScript).toContain(
            'integrity: {"packageName":"com.veworld.app","versionName":"1.0.0","versionCode":1,"isOfficial":true}',
        )
        expect(result.current.isLoading).toBe(false)
    })

    it("should not inject the integrity script on iOS", async () => {
        const { result } = renderHook(() => useInAppBrowser(), {
            wrapper: createWrapper("ios"),
        })

        expect(result.current.injectVechainScript()).toContain("integrity: {}")
        expect(result.current.isLoading).toBe(false)
    })
})
