import React from "react"
import { TestWrapper } from "~Test"
import { ActivityDetailsScreen } from "./ActivityDetailsScreen"
import { render, screen } from "@testing-library/react-native"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"

type NavigationScreenPropAlias = NativeStackScreenProps<
    RootStackParamListHome,
    Routes.ACTIVITY_DETAILS
>

type NavigationType = NativeStackNavigationProp<
    RootStackParamListHome,
    Routes.ACTIVITY_DETAILS,
    undefined
>

type RouteType = RouteProp<RootStackParamListHome, Routes.ACTIVITY_DETAILS>

const findElement = async () =>
    await screen.findByTestId("Activity_Details_Screen", {}, { timeout: 5000 })

const route = {
    key: "Activity_Details-JmbYuqHip5VCOsfgl6wib",
    name: "Activity_Details",
    params: {
        activity: {
            amount: 100397577200000000000,
            blockNumber: 14526348,
            clauses: [
                {
                    data: "0xa9059cbb000000000000000000000000995711adca070c8f6cc9ca98a5b9c5a99b8350b1000000000000000000000000000000000000000000000005714bd888c3db6000",
                    to: "0x0000000000000000000000000000456e65726779",
                    value: "0x0",
                },
            ],
            delegated: false,
            direction: "+",
            from: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
            gasPayer: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
            gasUsed: 36646,
            genesisId:
                "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
            id: "0x01cf0b07db9cf4ce749098c3ede88fb1263ab84d0a0ade3d16a9488edac38743",
            isTransaction: true,
            status: "SUCCESS",
            timestamp: 1675786670000,
            to: ["0x995711adca070c8f6cc9ca98a5b9c5a99b8350b1"],
            tokenAddress: "0x0000000000000000000000000000456e65726779",
            type: "FUNGIBLE_TOKEN",
        },
        token: {
            address: "0x0000000000000000000000000000456e65726779",
            custom: false,
            decimals: 18,
            desc: "Represents the underlying cost of using VeChainThor",
            genesisId:
                "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
            icon: "https://vechain.github.io/token-registry//assets/3ac553ea77911248ab4519bca020e0aa2891a6c6.png",
            links: ["", ""],
            name: "VeThor",
            symbol: "VTHO",
            totalSupply: "Infinite",
            website: "https://www.vechain.org/",
            whitePaper: "https://www.vechain.org/whitepaper/",
        },
    },
    path: undefined,
}

const createTestProps = (): unknown & NavigationScreenPropAlias => ({
    navigation: {
        navigate: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

describe("ActivityDetailsScreen", () => {
    it("should render correctly", async () => {
        render(<ActivityDetailsScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })

        screen.debug()

        await findElement()
    }, 10000)
})
