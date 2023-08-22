import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseFlashList } from "./BaseFlashList"

const baseFlashlistTestId = "BaseFlashlist"
const findBaseFlashlist = async () =>
    await screen.findByTestId(baseFlashlistTestId, {}, { timeout: 5000 })

describe("BaseFlashList", () => {
    it("renders correctly", async () => {
        render(
            <BaseFlashList
                testID={baseFlashlistTestId}
                renderItem={undefined}
                data={undefined}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseFlashlist = await findBaseFlashlist()
        expect(baseFlashlist).toBeVisible()
    })
})
