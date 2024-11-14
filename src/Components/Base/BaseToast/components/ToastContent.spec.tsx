import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { ToastContent } from "./ToastContent"
import { successToastStyles } from "../util"
import { ColorTheme } from "~Constants"
import TestHelpers from "../../../../Test/helpers"

const { account1D1, account2D1 } = TestHelpers.data

const successStyles = successToastStyles(ColorTheme("light"))
const onPress = jest.fn()
const testID = "test"
const findToast = () => {
    return screen.findByTestId(testID)
}
const findToastSenderAddress = () => {
    return screen.findByTestId("transactionAccountSender")
}
const findToastTxDirectionIcon = () => {
    return screen.findByTestId("transactionDirection")
}
const findToastRecipientAddress = () => {
    return screen.findByTestId("transactionAccountRecipient")
}

describe("ToastContent", () => {
    it("should render correctly - no onPress", async () => {
        render(<ToastContent icon={"close"} styles={successStyles} text3="Link text" testID={testID} />, {
            wrapper: TestWrapper,
        })
        const toast = await findToast()
        expect(toast).toBeVisible()
    })
    it("should render correctly - onPress", async () => {
        render(
            <ToastContent icon={"close"} styles={successStyles} text3="Link text" onPress={onPress} testID={testID} />,
            {
                wrapper: TestWrapper,
            },
        )
        const toast = await findToast()
        act(() => {
            fireEvent.press(toast)
        })
        expect(onPress).toHaveBeenCalled()
    })
    it("should render correctly with sender and recipient", async () => {
        render(
            <ToastContent
                addresses={{ sender: account1D1.address, recipient: account2D1.address }}
                icon={"close"}
                styles={successStyles}
                text3="Link text"
                testID={testID}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const senderAddress = await findToastSenderAddress()
        const txDirection = await findToastTxDirectionIcon()
        const recipientAddress = await findToastRecipientAddress()
        expect(senderAddress).toBeVisible()
        expect(txDirection).toBeVisible()
        expect(recipientAddress).toBeVisible()
    })
    it("should render correctly only the sender", async () => {
        render(
            <ToastContent
                addresses={{ sender: account1D1.address }}
                icon={"close"}
                styles={successStyles}
                text3="Link text"
                testID={testID}
            />,
            {
                wrapper: TestWrapper,
            },
        )
        const senderAddress = await findToastSenderAddress()
        expect(senderAddress).toBeVisible()
    })
})
