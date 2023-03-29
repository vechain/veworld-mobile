/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import { BaseModal } from "./BaseModal"
import { Text } from "react-native"

describe("BaseModal", () => {
    it("renders the children when isOpen is true", async () => {
        const { getByTestId } = render(
            <BaseModal isOpen={true} onClose={() => {}} testID={"BaseModal"}>
                <Text>Test</Text>
            </BaseModal>,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(getByTestId("BaseModal")).toBeTruthy())
        expect(getByTestId("BaseModal")).toBeVisible()
    })
})
