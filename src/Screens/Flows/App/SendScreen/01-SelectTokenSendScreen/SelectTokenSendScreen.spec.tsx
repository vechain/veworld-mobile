import React from "react"
import { TestWrapper } from "~Test"
import { SelectTokenSendScreen } from "./01-SelectTokenSendScreen"
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
    Routes.SELECT_TOKEN_SEND
>

type NavigationType = NativeStackNavigationProp<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_TOKEN_SEND,
    undefined
>

type RouteType = RouteProp<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_TOKEN_SEND
>

const findElement = async () =>
    await screen.findByTestId("Select_Token_Send_Screen", {}, { timeout: 5000 })

const route = {
    key: "string",
    name: Routes.NFT_DETAILS,
    path: "string",
    params: {
        initialRoute: Routes.HOME,
    },
}

const createTestProps = (): unknown & NavigationScreenPropAlias => ({
    navigation: {
        navigate: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

describe("SelectTokenSendScreen", () => {
    it("should render correctly", async () => {
        render(<SelectTokenSendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
