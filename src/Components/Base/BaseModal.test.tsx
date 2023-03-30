/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseModal } from "./BaseModal"
import { Text } from "react-native"

const baseModalTestId = "BaseModal"
const findBaseModal = async () =>
    await screen.findByTestId(baseModalTestId, { timeout: 5000 })

describe("BaseModal", () => {
    it("renders the children when isOpen is true", async () => {
        render(
            <BaseModal
                isOpen={true}
                onClose={() => {}}
                testID={baseModalTestId}>
                <Text>Test</Text>
            </BaseModal>,
            {
                wrapper: TestWrapper,
            },
        )
        const baseModal = await findBaseModal()
        expect(baseModal).toBeVisible()
    })
})
