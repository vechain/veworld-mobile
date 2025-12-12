import React from "react"
import { render, screen } from "@testing-library/react-native"
import { TestHelpers, TestWrapper } from "~Test"
import { useFetchValidators } from "~Hooks/useFetchValidators"
import { useNodesByTokenId, useValidatorExit } from "~Hooks/Staking"
import { ValidatorDelegationExitedBottomSheet } from "./ValidatorDelegationExitedBottomSheet"

const { validatorExitEventMock, StargateNodeMock, validatorExitEventsMock } = TestHelpers.data

jest.mock("~Hooks/useFetchValidators", () => ({
    useFetchValidators: jest.fn(),
}))

jest.mock("~Hooks/Staking", () => ({
    useValidatorExit: jest.fn(),
    useNodesByTokenId: jest.fn(),
}))

describe("ValidatorDelegationExitedBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render the component", () => {
        ;(useFetchValidators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useValidatorExit as jest.Mock).mockReturnValue({
            data: {
                "0x79bvalidator": [validatorExitEventMock],
            },
            isLoading: false,
        })
        ;(useNodesByTokenId as jest.Mock).mockReturnValue({
            data: [StargateNodeMock],
            isLoading: false,
        })

        render(<ValidatorDelegationExitedBottomSheet />, {
            wrapper: TestWrapper,
        })

        expect(
            screen.getByText(
                // eslint-disable-next-line max-len
                "The validator 0x79b…tor is no longer active. A new validator must be selected to continue earning rewards.",
            ),
        ).toBeOnTheScreen()
    })

    it("should render the component with multiple validators", () => {
        ;(useFetchValidators as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useValidatorExit as jest.Mock).mockReturnValue({
            data: {
                "0x79bvalidator": [validatorExitEventsMock[0]],
                "0x79b68validator": [validatorExitEventsMock[1]],
            },
            isLoading: false,
        })
        ;(useNodesByTokenId as jest.Mock).mockReturnValue({
            data: [StargateNodeMock],
            isLoading: false,
        })

        render(<ValidatorDelegationExitedBottomSheet />, {
            wrapper: TestWrapper,
        })

        expect(
            screen.getByText(
                // eslint-disable-next-line max-len
                "The validator 0x79b…tor, 0x79b…tor are no longer active. New validator must be selected to continue earning rewards.",
            ),
        ).toBeOnTheScreen()
    })
})
