import React from "react"
import { render, screen } from "@testing-library/react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DiscoverScreen } from "./DiscoverScreen"
import { TestWrapper } from "~Test"
import { PlatformOSType } from "react-native"
import { RootState } from "~Storage/Redux/Types"
import { InAppBrowserProvider } from "~Components/Providers/InAppBrowserProvider"
import { BaseToast } from "~Components"

jest.useFakeTimers()

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

const createWrapper = (platform: PlatformOSType) => {
    return ({ children, preloadedState }: { children: React.ReactNode; preloadedState: Partial<RootState> }) => (
        <TestWrapper preloadedState={preloadedState}>
            <InAppBrowserProvider platform={platform}>
                {children}
                <BaseToast />
            </InAppBrowserProvider>
        </TestWrapper>
    )
}

// Create a stack navigator
const Stack = createNativeStackNavigator()

// Mock Navigator component
const MockNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Discover" component={DiscoverScreen} />
    </Stack.Navigator>
)

describe("DiscoverScreen", () => {
    it("should render correctly on iOS", async () => {
        // Render the MockNavigator instead of DiscoverScreen directly
        render(<MockNavigator />, {
            wrapper: createWrapper("ios"),
        })

        // Add assertions here if needed
    })

    it("should render correctly on Android", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper("android"),
        })
    })

    it("should show the carousel", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper("ios"),
        })

        const carousel = await screen.findByTestId("VeBetterDao_carousel")
        expect(carousel).toBeOnTheScreen()
    })

    it("shouldn't show favorite apps if no favorite apps are available", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper("ios"),
        })

        const favoriteApps = await screen.queryByText("Favourites dApps")
        expect(favoriteApps).not.toBeOnTheScreen()
    })

    it("should show new dapps section", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper("ios"),
        })

        const newDapps = await screen.findByText("New dApps")
        expect(newDapps).toBeOnTheScreen()
    })

    it("should show trending dapps section", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper("ios"),
        })

        const trendingDapps = await screen.findByText("Trending & Popular")
        expect(trendingDapps).toBeOnTheScreen()
    })

    it("should show ecosystem dapps section", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper("ios"),
        })

        const ecosystemDapps = await screen.findByText("Ecosystem dApps")
        expect(ecosystemDapps).toBeOnTheScreen()
    })
})
