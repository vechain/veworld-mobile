import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { render, screen } from "@testing-library/react-native"
import React from "react"
import { BaseToast } from "~Components"
import { useVeBetterDaoActiveDapps, useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { DiscoverScreen } from "./DiscoverScreen"

jest.useFakeTimers()

jest.mock("~Hooks/useFetchFeaturedDApps")
jest.mock("./Hooks", () => ({
    useDAppActions: jest.fn().mockReturnValue({ onDAppPress: jest.fn() }),
}))

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

const createWrapper = ({
    children,
    preloadedState,
}: {
    children: React.ReactNode
    preloadedState: Partial<RootState>
}) => (
    <TestWrapper preloadedState={preloadedState}>
        {children}
        <BaseToast />
    </TestWrapper>
)

// Create a stack navigator
const Stack = createNativeStackNavigator()

// Mock Navigator component
const MockNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Discover" component={DiscoverScreen} />
    </Stack.Navigator>
)

describe("DiscoverScreen", () => {
    beforeAll(() => {
        ;(useVeBetterDaoActiveDapps as jest.Mock).mockImplementation(() => ({
            data: [],
            isLoading: false,
        }))
        ;(useVeBetterDaoDapps as jest.Mock).mockImplementation(() => ({
            data: [],
            isFetching: false,
        }))
    })

    it("should render correctly on Android", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper,
        })
    })

    it("should show the carousel", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper,
        })

        const carousel = await screen.findByTestId("VeBetterDao_carousel")
        expect(carousel).toBeOnTheScreen()
    })

    it("shouldn't show favorite apps if no favorite apps are available", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper,
        })

        const favoriteApps = await screen.queryByText("Favourites dApps")
        expect(favoriteApps).not.toBeOnTheScreen()
    })

    it("should show new dapps section", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper,
        })

        const newDapps = await screen.findByText("Recently Added")
        expect(newDapps).toBeOnTheScreen()
    })

    it("should show trending dapps section", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper,
        })

        const trendingDapps = await screen.findByText("Trending & Popular")
        expect(trendingDapps).toBeOnTheScreen()
    })

    it("should show ecosystem dapps section", async () => {
        render(<MockNavigator />, {
            wrapper: createWrapper,
        })

        const ecosystemDapps = await screen.findByText("Ecosystem")
        expect(ecosystemDapps).toBeOnTheScreen()
    })
})
