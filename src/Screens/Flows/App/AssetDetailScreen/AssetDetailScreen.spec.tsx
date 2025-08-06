import { useRoute } from "@react-navigation/native"
import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { FeatureFlags } from "~Api/FeatureFlags/endpoint"
import { FeatureFlagsProvider, useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import { Routes } from "~Navigation"
import { RootState } from "~Storage/Redux/Types"

import { ethers } from "ethers"
import { AssetDetailScreen } from "./AssetDetailScreen"

const { VETWithCompleteInfo } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
        </TestWrapper>
    )
}

jest.mock("react-native-wagmi-charts", () => {
    return {
        useLineChartDatetime: jest.fn(),
        LineChart: {
            default: jest.fn(),
            Provider: jest.fn(),
        },
    }
})

const navigationMock = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
    dispatch: jest.fn(),
    getState: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    getId: jest.fn(),
    reset: jest.fn(),
    getParent: jest.fn(),
    removeListener: jest.fn(),
    pop: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    popToTop: jest.fn(),
}

const mockedFeatureFlags: FeatureFlags = {
    marketsProxyFeature: {
        enabled: true,
        url: "https://coin-api.veworld.vechain.org",
        fallbackUrl: "https://api.coingecko.com/api/v3",
    },
    pushNotificationFeature: {
        enabled: true,
    },
    subdomainClaimFeature: {
        enabled: true,
    },
    paymentProvidersFeature: {
        "coinbase-pay": {
            android: true,
            iOS: false,
        },
        transak: {
            android: true,
            iOS: true,
        },
        coinify: {
            android: true,
            iOS: false,
        },
    },
    discoveryFeature: {
        bannersAutoplay: true,
        showStellaPayBanner: false,
        showStargateBanner: true,
    },
    forks: {
        GALACTICA: {
            transactions: {
                ledger: false,
            },
        },
    },
    betterWorldFeature: {
        appsScreen: {
            enabled: false,
        },
    },
}

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useRoute: jest.fn(),
}))

jest.mock("~Hooks/Staking", () => ({
    useUserNodes: jest.fn(),
    useUserStargateNfts: jest.fn(),
}))

jest.mock("~Hooks/useNFTMetadata", () => ({
    useNFTMetadata: jest.fn().mockReturnValue({ fetchMetadata: jest.fn() }),
}))

describe("AssetDetailScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render", () => {
        ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
        ;(useRoute as jest.Mock).mockReturnValue({
            name: Routes.HOME,
        })
        ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [] })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [] })
        render(
            <AssetDetailScreen
                navigation={navigationMock}
                route={{ params: { token: VETWithCompleteInfo }, key: "test", name: Routes.TOKEN_DETAILS }}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        expect(screen.getByText("Vechain")).toBeOnTheScreen()
    })

    it("should render stargate banner if token is VET and there are no nodes", () => {
        ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
        ;(useRoute as jest.Mock).mockReturnValue({
            name: Routes.HOME,
        })
        ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [] })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [] })
        render(
            <AssetDetailScreen
                navigation={navigationMock}
                route={{ params: { token: VETWithCompleteInfo }, key: "test", name: Routes.TOKEN_DETAILS }}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        expect(screen.getByText("Vechain")).toBeOnTheScreen()
        expect(screen.getByTestId("token_screen_carousel")).toBeOnTheScreen()
    })

    it("should not render carousel but the staking section if there are nodes", () => {
        ;(useFeatureFlags as jest.Mock).mockReturnValue(mockedFeatureFlags)
        ;(useRoute as jest.Mock).mockReturnValue({
            name: Routes.HOME,
        })
        ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [{}] })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({
            ownedStargateNfts: [
                {
                    vetAmountStaked: ethers.utils.parseEther("1").toString(),
                    accumulatedRewards: ethers.utils.parseEther("1").toString(),
                    claimableRewards: ethers.utils.parseEther("1").toString(),
                    levelId: "8",
                    tokenId: "8",
                },
            ],
        })
        render(
            <AssetDetailScreen
                navigation={navigationMock}
                route={{ params: { token: VETWithCompleteInfo }, key: "test", name: Routes.TOKEN_DETAILS }}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        expect(screen.getByText("Vechain")).toBeOnTheScreen()
        expect(screen.queryByTestId("token_screen_carousel")).toBeNull()
        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_8")).toBeOnTheScreen()
        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_LOCKED")).toBeOnTheScreen()
        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_REWARDS")).toBeOnTheScreen()
        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_CLAIMABLE")).toBeOnTheScreen()
    })
})
