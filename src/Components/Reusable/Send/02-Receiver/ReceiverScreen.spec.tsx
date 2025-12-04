import * as React from "react"
import { render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { SendContextProvider } from "~Components/Reusable"
import { ReceiverScreen } from "./ReceiverScreen"
import { RootState } from "~Storage/Redux/Types"

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
