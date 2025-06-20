import { render, screen } from "@testing-library/react-native"
import React from "react"
import { InAppBrowserProvider } from "~Components/Providers"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { CoinifyPayWebView } from "./CoinifyPayWebView"

const { account1D1, account2D1 } = TestHelpers.data
const amount = 100

// Mock react-native-webview
jest.mock("react-native-webview", () => {
    const { View } = jest.requireActual("react-native")
    return {
        __esModule: true,
        default: jest.fn(({ testID, ...props }) => <View testID={testID} {...props} />),
    }
})

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

// Mock the hooks used by CoinifyPayWebView
jest.mock("~Hooks", () => ({
    ...jest.requireActual("~Hooks"),
    useThemedStyles: jest.fn(() => ({
        styles: {
            webView: { flex: 1, opacity: 1 },
            floatingButton: { textTransform: "uppercase" },
            container: { flex: 1 },
        },
        theme: {
            isDark: false,
            colors: {
                background: "#F2F2F7",
                text: "#0B0043",
                card: "#FFFFFF",
                primary: "#0B0043",
                border: "#0B0043",
            },
        },
    })),
    useAnalyticTracking: jest.fn(() => jest.fn()),
    useTokenWithCompleteInfo: jest.fn(() => ({
        symbol: "VET",
        decimals: 18,
        address: "0x0000000000000000000000000000456E65726779",
        name: "VeChain",
    })),
    useTheme: jest.fn(() => ({
        colors: {
            background: "#FFFFFF",
            text: "#000000",
            card: "#F5F5F5",
        },
        isDark: false,
    })),
    useSetSelectedAccount: jest.fn(() => ({
        onSetSelectedAccount: jest.fn(),
    })),
    useBottomSheetModal: jest.fn(() => ({
        present: jest.fn(),
        dismiss: jest.fn(),
        onOpen: jest.fn(),
        onClose: jest.fn(),
    })),
    useTabBarBottomMargin: jest.fn(() => ({
        iosOnlyTabBarBottomMargin: 0,
    })),
}))

// Mock the entire i18n module
jest.mock("~i18n", () => {
    const ReactMock = jest.requireActual("react")
    return {
        useI18nContext: jest.fn(() => ({
            LL: {
                SIGN_TRANSACTION: jest.fn(() => "Sign Transaction"),
            },
        })),
        loadLocale_sync: jest.fn(),
        TypesafeI18n: jest.fn(({ children }) => ReactMock.createElement("div", {}, children)),
        loadAllLocales_sync: jest.fn(),
        loadFormatters_sync: jest.fn(),
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

// Mock the useCoinifyPay hook
jest.mock("./Hooks", () => ({
    useCoinifyPay: jest.fn(() => ({
        generateOnRampURL: jest.fn(() => "https://mock-coinify-url.com"),
        generateOffRampURL: jest.fn(() => "https://mock-coinify-url.com"),
        generateTradeHistoryURL: jest.fn(() => "https://mock-coinify-url.com"),
    })),
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
