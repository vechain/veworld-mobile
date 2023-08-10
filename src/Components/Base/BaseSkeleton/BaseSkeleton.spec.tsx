import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseSkeleton } from "./BaseSkeleton"
import { TestWrapper } from "~Test"
import { ICustomViewStyle } from "react-native-skeleton-content-nonexpo/lib/Constants"

const baseSkeletonTestId = "BaseSkeleton"

const findBaseSkeleton = async () =>
    await screen.findByTestId(baseSkeletonTestId, {}, { timeout: 5000 })

describe("BaseSkeleton", () => {
    it("renders correctly with default values", async () => {
        render(
            <BaseSkeleton
                testID={baseSkeletonTestId}
                boneColor="#e1e1e1"
                highlightColor="#f2f2f2"
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseSkeleton = await findBaseSkeleton()
        expect(baseSkeleton).toBeVisible()
    })

    it("renders correctly with custom layout", async () => {
        const customLayout: ICustomViewStyle[] = [
            {
                flexDirection: "row",
                alignItems: "flex-start",
                children: [
                    {
                        width: "50%",
                        height: 40,
                    },
                ],
            },
        ]

        render(
            <BaseSkeleton
                testID={baseSkeletonTestId}
                boneColor="#e1e1e1"
                highlightColor="#f2f2f2"
                layout={customLayout}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseSkeleton = await findBaseSkeleton()
        expect(baseSkeleton).toBeVisible()
    })

    it("renders correctly with customs styles and width", async () => {
        const containerStyle = {
            height: "100%",
        }

        render(
            <BaseSkeleton
                testID={baseSkeletonTestId}
                containerStyle={containerStyle}
                boneColor="#e1e1e1"
                highlightColor="#f2f2f2"
                width={200}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        let baseSkeleton = await findBaseSkeleton()
        expect(baseSkeleton).toBeVisible()

        render(
            <BaseSkeleton
                testID={baseSkeletonTestId}
                containerStyle={containerStyle}
                boneColor="#e1e1e1"
                highlightColor="#f2f2f2"
            />,
            {
                wrapper: TestWrapper,
            },
        )

        baseSkeleton = await findBaseSkeleton()
        expect(baseSkeleton).toBeVisible()
    })

    it("renders correctly with custom width and height", async () => {
        render(
            <BaseSkeleton
                testID={baseSkeletonTestId}
                boneColor="#e1e1e1"
                highlightColor="#f2f2f2"
                width={200}
                height={50}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const baseSkeleton = await findBaseSkeleton()
        expect(baseSkeleton).toBeVisible()
    })
})
