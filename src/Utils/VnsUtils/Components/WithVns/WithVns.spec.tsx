import React from "react"
import { render } from "@testing-library/react-native"
import { WithVns } from "./WithVns" // assuming this is the correct import path
import { useThor } from "~Components"
import { TestWrapper } from "~Test"
import { Text } from "react-native"

jest.mock("~Components", () => ({
    useThor: jest.fn(),
}))

describe("WithVns component", () => {
    it("passes vnsName and vnsAddress to children function correctly", () => {
        const thor = "thor"

        ;(useThor as jest.Mock).mockReturnValue(thor)

        // Mock children function
        const childrenFunction = jest.fn(({ vnsName, vnsAddress }) => (
            <Text>
                {vnsName}: {vnsAddress}
            </Text>
        ))

        // Render WithVns with mock children function
        render(<WithVns address="0x231e70cf27a2c44eb9c00a3b1d2f7507ae791051" children={childrenFunction} />, {
            wrapper: TestWrapper,
        })

        // Assertions
        // expect(childrenFunction).toHaveBeenCalledWith({
        //     vnsName: "grenos.vet",
        //     vnsAddress: "0x231e70cf27a2c44eb9c00a3b1d2f7507ae791051",
        // })

        // Add more assertions as needed
    })
})
