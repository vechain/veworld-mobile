import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { VbdCarouselItem } from "./VbdCarouselItem"

describe("VbdCarouselItem", () => {
    it("should render a normal dapp", () => {
        render(
            <VbdCarouselItem
                app={{
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: new Date().toISOString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "ID",
                    logo: "https://google.com",
                    metadataURI: "metadata_uri",
                    name: "TEST APP",
                    screenshots: [],
                    social_urls: [],
                    teamWalletAddress: "",
                    appAvailableForAllocationVoting: true,
                    categories: [],
                    tweets: [],
                    ve_world: { banner: "https://vechain.org" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("VBD_CAROUSEL_ITEM_APP_NAME")).toHaveTextContent("TEST APP")
        expect(screen.getByTestId("VBD_CAROUSEL_ITEM_APP_DESCRIPTION")).toHaveTextContent("TEST DESCRIPTION")
        expect(screen.queryByTestId("CATEGORY_CHIP")).toBeNull()
    })

    it("should render category if it is there", () => {
        render(
            <VbdCarouselItem
                app={{
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: new Date().toISOString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "ID",
                    logo: "https://google.com",
                    metadataURI: "metadata_uri",
                    name: "TEST APP",
                    screenshots: [],
                    social_urls: [],
                    teamWalletAddress: "",
                    appAvailableForAllocationVoting: true,
                    categories: ["education-learning"],
                    tweets: [],
                    ve_world: { banner: "https://vechain.org" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId("CATEGORY_CHIP")).toBeVisible()
    })

    it("should not render an unknown category", () => {
        render(
            <VbdCarouselItem
                app={{
                    app_urls: [],
                    banner: "banner",
                    createdAtTimestamp: new Date().toISOString(),
                    description: "TEST DESCRIPTION",
                    external_url: "https://vechain.org",
                    id: "ID",
                    logo: "https://google.com",
                    metadataURI: "metadata_uri",
                    name: "TEST APP",
                    screenshots: [],
                    social_urls: [],
                    teamWalletAddress: "",
                    appAvailableForAllocationVoting: true,
                    categories: ["education-learning-test"],
                    tweets: [],
                    ve_world: { banner: "https://vechain.org" },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.queryByTestId("CATEGORY_CHIP")).toBeNull()
    })
})
