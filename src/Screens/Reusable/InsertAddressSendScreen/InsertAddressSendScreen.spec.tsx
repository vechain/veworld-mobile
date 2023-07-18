import React from "react"
import { TestWrapper } from "~Test"
import { InsertAddressSendScreen } from "./InsertAddressSendScreen"
import { render, screen } from "@testing-library/react-native"
import {
    RootStackParamListHome,
    RootStackParamListNFT,
    Routes,
} from "~Navigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"

type NavigationType = NativeStackNavigationProp<
    RootStackParamListHome & RootStackParamListNFT,
    Routes.INSERT_ADDRESS_SEND,
    undefined
>

type RouteType = RouteProp<
    RootStackParamListHome & RootStackParamListNFT,
    Routes.INSERT_ADDRESS_SEND
>

const findElement = async () =>
    await screen.findByTestId(
        "Insert_Address_Send_Screen",
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

const createTestProps = (): any => ({
    navigation: {
        navigate: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

describe("InsertAddressSendScreen", () => {
    it("should render correctly", async () => {
        render(<InsertAddressSendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
