import React from "react"
import { TestWrapper } from "~Test"
import { ReportNFTTransactionScreen } from "./ReportNFTTransactionScreen"
import { render, screen } from "@testing-library/react-native"
import { RootStackParamListNFT, Routes } from "~Navigation"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { RouteProp } from "@react-navigation/native"

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
}))

jest.mock("~Components/Reusable/GasFeeSpeed/GasFeeSpeed", () => ({
    GasFeeSpeed: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock("~Hooks/useFormatFiat/useFormatFiat", () => ({
    useFormatFiat: () => ({
        formatFiat: jest.fn(() => "$0.00"),
    }),
}))

jest.mock("~Hooks/useTransactionScreen", () => ({
    useTransactionScreen: () => ({
        selectedDelegationOption: "no-delegation",
        onSubmit: jest.fn(),
        isPasswordPromptOpen: false,
        handleClosePasswordModal: jest.fn(),
        onPasswordSuccess: jest.fn(),
        setSelectedFeeOption: jest.fn(),
        selectedFeeOption: "regular",
        resetDelegation: jest.fn(),
        setSelectedDelegationAccount: jest.fn(),
        setSelectedDelegationUrl: jest.fn(),
        selectedDelegationAccount: null,
        selectedDelegationUrl: null,
        isDisabledButtonState: false,
        gasOptions: {
            slow: { value: "0x1" },
            regular: { value: "0x2" },
            fast: { value: "0x3" },
        },
        gasUpdatedAt: new Date().toISOString(),
        isGalactica: false,
        isBaseFeeRampingUp: false,
        speedChangeEnabled: true,
    }),
}))

type NavigationScreenPropAlias = NativeStackScreenProps<RootStackParamListNFT, Routes.REPORT_NFT_TRANSACTION_SCREEN>

type NavigationType = NativeStackNavigationProp<RootStackParamListNFT, Routes.REPORT_NFT_TRANSACTION_SCREEN, undefined>

type RouteType = RouteProp<RootStackParamListNFT, Routes.REPORT_NFT_TRANSACTION_SCREEN>

const findElement = async () => await screen.findByTestId("Report_NFT_Screen", {}, { timeout: 5000 })

const route = {
    key: "string",
    name: Routes.REPORT_NFT_TRANSACTION_SCREEN,
    path: "string",
    params: {
        nftAddress: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        transactionClauses: [
            {
                to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                value: "0x0",
                data: "0x12345",
            },
        ],
    },
}

const createTestProps = (): unknown & NavigationScreenPropAlias => ({
    navigation: {
        navigate: jest.fn(),
        goBack: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

describe("ReportNFTTransactionScreen", () => {
    it("should render correctly", async () => {
        render(<ReportNFTTransactionScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })

        await findElement()
    })
})
