/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseCardGroup } from "./BaseCardGroup"
import { BaseText } from "../BaseText"

const findFirstView = async () =>
    await screen.findByTestId("first", {}, { timeout: 5000 })
const findSecondView = async () =>
    await screen.findByTestId("second", {}, { timeout: 5000 })

describe("BaseCardGroup", () => {
    it("renders correctly", async () => {
        render(
            <BaseCardGroup
                views={[
                    {
                        children: (
                            <BaseText typographyFont="buttonSecondary">
                                first
                            </BaseText>
                        ),
                        testID: "first",
                    },
                    {
                        children: (
                            <BaseText typographyFont="buttonSecondary">
                                second
                            </BaseText>
                        ),
                        testID: "second",
                    },
                ]}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findFirstView()
        await findSecondView()
    })
})
