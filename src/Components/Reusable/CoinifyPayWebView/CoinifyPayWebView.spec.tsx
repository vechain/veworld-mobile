import { render, screen } from "@testing-library/react-native"
import React from "react"
import { InAppBrowserProvider } from "~Components/Providers"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { CoinifyPayWebView } from "./CoinifyPayWebView"

const { account1D1, account2D1 } = TestHelpers.data
const amount = 100

jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
}))

jest.mock("react-native/Libraries/Settings/Settings", () => ({
    get: jest.fn(),
    set: jest.fn(),
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
    }
})

const mockedNavigate = jest.fn()
const mockedReplace = jest.fn()

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            replace: mockedReplace,
            getState: jest.fn(),
            canGoBack: jest.fn(),
        }),
    }
})

const createWrapper = ({
    children,
    preloadedState,
}: {
    children: React.ReactNode
    preloadedState: Partial<RootState>
}) => {
    return (
        <TestWrapper preloadedState={preloadedState}>
            <InAppBrowserProvider platform={"android"}>{children}</InAppBrowserProvider>
        </TestWrapper>
    )
}

describe("CoinifyPayWebView component", () => {
    it("render correctly buy view", async () => {
        render(<CoinifyPayWebView currentAmount={amount} destinationAddress={account1D1.address} target="buy" />, {
            wrapper: createWrapper,
        })

        const webview = screen.getByTestId("CoinifyPayWebView")
        expect(webview).toBeOnTheScreen()
    })
    it("render correct sell view", async () => {
        render(<CoinifyPayWebView currentAmount={amount} destinationAddress={account2D1.address} target="sell" />, {
            wrapper: createWrapper,
        })

        const webview = screen.getByTestId("CoinifyPayWebView")
        expect(webview).toBeOnTheScreen()
    })
    it("render correct trade-history view", async () => {
        render(
            <CoinifyPayWebView currentAmount={amount} destinationAddress={account2D1.address} target="trade-history" />,
            {
                wrapper: createWrapper,
            },
        )

        const webview = screen.getByTestId("CoinifyPayWebView")
        expect(webview).toBeOnTheScreen()
    })
})
