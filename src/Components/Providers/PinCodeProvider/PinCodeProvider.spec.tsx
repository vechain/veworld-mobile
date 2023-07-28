import { render } from "@testing-library/react-native"
import React from "react"
import {
    PinCodeProvider,
    usePinCode,
} from "~Components/Providers/PinCodeProvider/PinCodeProvider"
import { TestWrapper } from "~Test"

const CustomComponent = () => {
    const { isPinRequired } = usePinCode()

    return <div id={"isPinRequired"}>{isPinRequired}</div>
}

describe("PinCodeProvider", () => {
    it("usePinCode should work in PinCodeContext", async () => {
        render(
            <PinCodeProvider>
                <CustomComponent />
            </PinCodeProvider>,
            {
                wrapper: TestWrapper,
            },
        )
    })
})
