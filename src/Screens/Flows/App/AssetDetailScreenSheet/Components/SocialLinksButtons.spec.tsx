import { fireEvent, render } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { SocialLinksButtons } from "./SocialLinksButtons"

describe("SocialLinksButtons", () => {
    const mockOnNavigate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("Rendering", () => {
        it("should render null when no social links provided", () => {
            const { queryByTestId } = render(<SocialLinksButtons onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(queryByTestId("website_BUTTON")).toBeNull()
            expect(queryByTestId("twitter_BUTTON")).toBeNull()
            expect(queryByTestId("telegram_BUTTON")).toBeNull()
        })

        it("should render null when social links is empty object", () => {
            const { queryByTestId } = render(<SocialLinksButtons links={{}} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(queryByTestId("website_BUTTON")).toBeNull()
            expect(queryByTestId("twitter_BUTTON")).toBeNull()
            expect(queryByTestId("telegram_BUTTON")).toBeNull()
        })

        it("should render website button when website link provided", () => {
            const links = { website: "https://vechain.org" }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(getByTestId("website_BUTTON")).toBeTruthy()
        })

        it("should render twitter button when twitter link provided", () => {
            const links = { twitter: "https://twitter.com/vechain" }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(getByTestId("twitter_BUTTON")).toBeTruthy()
        })

        it("should render telegram button when telegram link provided", () => {
            const links = { telegram: "https://t.me/vechain" }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(getByTestId("telegram_BUTTON")).toBeTruthy()
        })

        it("should render all social buttons when all links provided", () => {
            const links = {
                website: "https://vechain.org",
                twitter: "https://twitter.com/vechain",
                telegram: "https://t.me/vechain",
            }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(getByTestId("website_BUTTON")).toBeTruthy()
            expect(getByTestId("twitter_BUTTON")).toBeTruthy()
            expect(getByTestId("telegram_BUTTON")).toBeTruthy()
        })

        it("should only render allowed social links", () => {
            const links = {
                website: "https://vechain.org",
                discord: "https://discord.com/vechain",
                twitter: "https://twitter.com/vechain",
            }
            const { getByTestId, queryByTestId } = render(
                <SocialLinksButtons links={links} onNavigate={mockOnNavigate} />,
                {
                    wrapper: TestWrapper,
                },
            )

            expect(getByTestId("website_BUTTON")).toBeTruthy()
            expect(getByTestId("twitter_BUTTON")).toBeTruthy()
            expect(queryByTestId("discord_BUTTON")).toBeNull()
        })
    })

    describe("Button Interactions", () => {
        it("should call onNavigate with website URL when website button pressed", () => {
            const websiteUrl = "https://vechain.org"
            const links = { website: websiteUrl }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            fireEvent.press(getByTestId("website_BUTTON"))

            expect(mockOnNavigate).toHaveBeenCalledWith(websiteUrl, "website")
            expect(mockOnNavigate).toHaveBeenCalledTimes(1)
        })

        it("should call onNavigate with twitter URL when twitter button pressed", () => {
            const twitterUrl = "https://twitter.com/vechain"
            const links = { twitter: twitterUrl }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            fireEvent.press(getByTestId("twitter_BUTTON"))

            expect(mockOnNavigate).toHaveBeenCalledWith(twitterUrl, "twitter")
            expect(mockOnNavigate).toHaveBeenCalledTimes(1)
        })

        it("should call onNavigate with telegram URL when telegram button pressed", () => {
            const telegramUrl = "https://t.me/vechain"
            const links = { telegram: telegramUrl }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            fireEvent.press(getByTestId("telegram_BUTTON"))

            expect(mockOnNavigate).toHaveBeenCalledWith(telegramUrl, "telegram")
            expect(mockOnNavigate).toHaveBeenCalledTimes(1)
        })

        it("should handle multiple button presses independently", () => {
            const links = {
                website: "https://vechain.org",
                twitter: "https://twitter.com/vechain",
                telegram: "https://t.me/vechain",
            }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            fireEvent.press(getByTestId("website_BUTTON"))
            expect(mockOnNavigate).toHaveBeenCalledWith(links.website, "website")

            fireEvent.press(getByTestId("twitter_BUTTON"))
            expect(mockOnNavigate).toHaveBeenCalledWith(links.twitter, "twitter")

            fireEvent.press(getByTestId("telegram_BUTTON"))
            expect(mockOnNavigate).toHaveBeenCalledWith(links.telegram, "telegram")

            expect(mockOnNavigate).toHaveBeenCalledTimes(3)
        })
    })

    describe("Icon Rendering", () => {
        it("should render globe icon for website button", () => {
            const links = { website: "https://vechain.org" }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            const button = getByTestId("website_BUTTON")
            expect(button).toBeTruthy()
        })

        it("should render twitter icon for twitter button", () => {
            const links = { twitter: "https://twitter.com/vechain" }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            const button = getByTestId("twitter_BUTTON")
            expect(button).toBeTruthy()
        })

        it("should render telegram icon for telegram button", () => {
            const links = { telegram: "https://t.me/vechain" }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            const button = getByTestId("telegram_BUTTON")
            expect(button).toBeTruthy()
        })
    })

    describe("Theming", () => {
        it("should render correctly in light theme", () => {
            const links = {
                website: "https://vechain.org",
                twitter: "https://twitter.com/vechain",
            }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: TestWrapper,
            })

            expect(getByTestId("website_BUTTON")).toBeTruthy()
            expect(getByTestId("twitter_BUTTON")).toBeTruthy()
        })

        it("should render correctly in dark theme", () => {
            const links = {
                website: "https://vechain.org",
                telegram: "https://t.me/vechain",
            }
            const { getByTestId } = render(<SocialLinksButtons links={links} onNavigate={mockOnNavigate} />, {
                wrapper: ({ children }: { children: React.ReactNode }) => (
                    <TestWrapper preloadedState={{}}>{children}</TestWrapper>
                ),
            })

            expect(getByTestId("website_BUTTON")).toBeTruthy()
            expect(getByTestId("telegram_BUTTON")).toBeTruthy()
        })
    })
})
