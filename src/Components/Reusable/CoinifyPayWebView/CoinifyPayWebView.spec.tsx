import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"
import { CoinifyPayWebView } from "./CoinifyPayWebView"

const { account1D1, account2D1 } = TestHelpers.data
const amount = 100

jest.mock("~Components/Providers/InAppBrowserProvider", () => ({
    useInAppBrowser: jest.fn().mockReturnValue({
        originWhitelist: ["http://", "https://", "about:*", "blob:"],
    } as any),
}))

// Mock react-native-webview
jest.mock("react-native-webview", () => {
    const { View } = jest.requireActual("react-native")
    return {
        __esModule: true,
        default: jest.fn(({ testID, ...props }) => <View testID={testID} {...props} />),
    }
})

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

// Mock the AnimatedFloatingButton component
jest.mock("../AnimatedFloatingButton", () => ({
    AnimatedFloatingButton: jest.fn(({ children, ...props }) => {
        const { View } = jest.requireActual("react-native")
        return (
            <View testID="AnimatedFloatingButton" {...props}>
                {children}
            </View>
        )
    }),
}))

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

describe("CoinifyPayWebView component", () => {
    it("render correctly buy view", async () => {
        render(<CoinifyPayWebView currentAmount={amount} destinationAddress={account1D1.address} target="buy" />, {
            wrapper: TestWrapper,
        })

        const webview = screen.getByTestId("CoinifyPayWebView")
        expect(webview).toBeOnTheScreen()
    })
    it("render correct sell view", async () => {
        render(<CoinifyPayWebView currentAmount={amount} destinationAddress={account2D1.address} target="sell" />, {
            wrapper: TestWrapper,
        })

        const webview = screen.getByTestId("CoinifyPayWebView")
        expect(webview).toBeOnTheScreen()
    })
    it("render correct trade-history view", async () => {
        render(
            <CoinifyPayWebView currentAmount={amount} destinationAddress={account2D1.address} target="trade-history" />,
            {
                wrapper: TestWrapper,
            },
        )

        const webview = screen.getByTestId("CoinifyPayWebView")
        expect(webview).toBeOnTheScreen()
    })
})
