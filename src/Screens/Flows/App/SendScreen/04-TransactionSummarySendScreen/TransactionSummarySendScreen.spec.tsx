import React from "react"
import { TestWrapper } from "~Test"
import { TransactionSummarySendScreen } from "./04-TransactionSummarySendScreen"
import { render, screen } from "@testing-library/react-native"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import {
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"

type NavigationScreenPropAlias = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.TRANSACTION_SUMMARY_SEND
>

type NavigationType = NativeStackNavigationProp<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.TRANSACTION_SUMMARY_SEND,
    undefined
>

type RouteType = RouteProp<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.TRANSACTION_SUMMARY_SEND
>

const findElement = async () =>
    await screen.findByTestId(
        "Transaction_Summary_Send_Screen",
        {},
        { timeout: 5000 },
    )

const route = {
    key: "string",
    name: Routes.NFT_DETAILS,
    path: "string",
    params: {
        initialRoute: Routes.HOME,
        amount: "0x01",
        address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        token: {
            address: "VET",
            balance: {
                accountAddress: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                balance: "0x470de4df820000",
                genesisId:
                    "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
                position: undefined,
                timeUpdated: "2023-05-24T13:14:07.205Z",
                tokenAddress: "VET",
            },
            custom: false,
            decimals: 18,
            genesisId:
                "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
            icon: "soe image url",
            name: "Vechain",
            symbol: "VET",
        },
    },
}

const createTestProps = (): unknown & NavigationScreenPropAlias => ({
    navigation: {
        navigate: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

jest.mock("~Common/Hooks/useCheckIdentity/useCheckIdentity", () => ({
    useCheckIdentity: () => ({
        ConfirmIdentityBottomSheet: "ConfirmIdentityBottomSheet",
        checkIdentityBeforeOpening: jest.fn(),
    }),
}))

describe("TransactionSummarySendScreen", () => {
    it("should render correctly", async () => {
        render(<TransactionSummarySendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })

        await findElement()
    })
})
