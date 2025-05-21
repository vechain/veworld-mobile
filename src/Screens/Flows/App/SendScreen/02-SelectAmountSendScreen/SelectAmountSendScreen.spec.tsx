import React from "react"
import { TestWrapper } from "~Test"
import { SelectAmountSendScreen } from "./02-SelectAmountSendScreen"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { RootStackParamListHome, Routes } from "~Navigation"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"
import { useExchangeRate } from "~Api/Coingecko"

type NavigationScreenPropAlias = NativeStackScreenProps<RootStackParamListHome, Routes.SELECT_AMOUNT_SEND>

type NavigationType = NativeStackNavigationProp<RootStackParamListHome, Routes.SELECT_AMOUNT_SEND, undefined>

type RouteType = RouteProp<RootStackParamListHome, Routes.SELECT_AMOUNT_SEND>

const findElement = async () => await screen.findByTestId("Select_Amount_Send_Screen", {}, { timeout: 5000 })

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useExchangeRate: jest.fn().mockReturnValue({
        data: undefined,
    }),
}))

const route = {
    key: "string",
    name: Routes.NFT_DETAILS,
    path: "string",
    params: {
        initialRoute: Routes.HOME,
        token: {
            address: "VET",
            balance: {
                accountAddress: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                balance: "0x470de4df820000",
                genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
                position: undefined,
                timeUpdated: "2023-05-24T13:14:07.205Z",
                tokenAddress: "VET",
            },
            custom: false,
            decimals: 18,
            genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
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

describe("SelectAmountSendScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", async () => {
        render(<SelectAmountSendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()

        const tokenSymbol = await screen.findByTestId("SendScreen_tokenSymbol")
        expect(tokenSymbol).toHaveTextContent("VET")
    })

    it("should change to fiat input mode", async () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({
            data: 0.12,
        })

        render(<SelectAmountSendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()

        const switchInputMode = await screen.findByTestId("SendScreen_switchInputMode")

        await act(async () => {
            fireEvent.press(switchInputMode)
        })

        const currencySymbol = await screen.findByTestId("SendScreen_currencySymbol")
        expect(currencySymbol).toBeOnTheScreen()
    })

    it("should set input to max token amount when max button is pressed", async () => {
        render(<SelectAmountSendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()

        const maxButton = await screen.findByTestId("SendScreen_maxButton")

        await act(async () => {
            fireEvent.press(maxButton)
        })

        const inputField = await screen.findByTestId("SendScreen_amountInput")
        expect(inputField.props.value).toBe("0.02")
    })

    it("should set input to max fiat amount when max button is pressed in fiat input mode", async () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({
            data: 0.2,
        })

        render(<SelectAmountSendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })
        await findElement()

        const maxButton = await screen.findByTestId("SendScreen_maxButton")
        const switchInputMode = await screen.findByTestId("SendScreen_switchInputMode")

        await act(async () => {
            fireEvent.press(switchInputMode)
        })

        await act(async () => {
            fireEvent.press(maxButton)
        })

        const inputField = await screen.findByTestId("SendScreen_amountInput")
        expect(inputField.props.value).toBe("0.01")
    })
})
