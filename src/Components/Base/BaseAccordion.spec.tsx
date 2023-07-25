/* eslint-disable i18next/no-literal-string */
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseAccordion } from "./BaseAccordion"
import { View } from "react-native"

const headerTestId = "headerTestId"
const findHeader = async () =>
    await screen.findByTestId(headerTestId, {}, { timeout: 5000 })
const bodyTestId = "bodyTestId"
const findBody = async () =>
    await screen.findByTestId(bodyTestId, {}, { timeout: 5000 })

const chevronTestId = "chevron"

const dataLength = 10
const itemHeight = 90

const findChevron = async () =>
    await screen.findByTestId(chevronTestId, {}, { timeout: 5000 })

describe("BaseAccordion", () => {
    it("renders correctly with default props", async () => {
        render(
            <BaseAccordion
                extraData={dataLength}
                itmeHeight={itemHeight}
                headerComponent={
                    <View testID={headerTestId}>HeaderComponent</View>
                }
                headerStyle={{}}
                headerOpenedStyle={{}}
                headerClosedStyle={{}}
                chevronContainerStyle={{}}
                bodyComponent={<View testID={bodyTestId}>BodyComponent</View>}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const header = await findHeader()
        expect(header).toBeVisible()

        const chevron = await findChevron()
        expect(chevron).toBeVisible()

        const body = await findBody()
        expect(body).not.toBeVisible()
    })
})
