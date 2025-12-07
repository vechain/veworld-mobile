import { render, screen } from "@testing-library/react-native"
import * as React from "react"
import { TestWrapper } from "~Test"

import { SendContextProvider } from "~Components/Reusable"
import { RootState } from "~Storage/Redux/Types"

import { ReceiverScreen } from "./ReceiverScreen"

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <SendContextProvider>{children}</SendContextProvider>
        </TestWrapper>
    )
}

describe("ReceiverScreen", () => {
    it("should render correctly", () => {
        render(<ReceiverScreen />, {
            wrapper: createWrapper({}),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toBeOnTheScreen()
        expect(screen.getByTestId("Send_Receiver_Address_Scan_Button")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()
        expect(screen.getByTestId("Send_Receiver_Addresses_List_Empty_State")).toBeOnTheScreen()
    })
})
