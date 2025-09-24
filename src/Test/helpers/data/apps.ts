import { X2ECategoryType } from "~Model/DApp"

export const mockApp1 = {
    id: "app-1",
    teamWalletAddress: "0x1234567890123456789012345678901234567890",
    name: "A App",
    metadataURI: "https://example.com/metadata1.json",
    createdAtTimestamp: "1640995200",
    appAvailableForAllocationVoting: true,
    categories: [X2ECategoryType.NUTRITION],
    description: "A nutrition app",
    external_url: "https://example.com/app1",
    logo: "https://example.com/icon1.png",
    banner: "https://example.com/banner1.png",
    screenshots: ["https://example.com/screenshot1.png"],
    social_urls: [{ name: "twitter", url: "https://twitter.com/app1" }],
    app_urls: [{ code: "web", url: "https://example.com/app1" }],
    tweets: ["Great nutrition app!"],
    ve_world: { banner: "https://example.com/veworld-banner1.png" },
}

export const mockApp2 = {
    id: "app-2",
    teamWalletAddress: "0x2345678901234567890123456789012345678901",
    name: "B App",
    metadataURI: "https://example.com/metadata2.json",
    createdAtTimestamp: "1640995201",
    appAvailableForAllocationVoting: false,
    categories: [X2ECategoryType.PLASTIC_WASTE_RECYCLING],
    description: "A recycling app",
    external_url: "https://example.com/app2",
    logo: "https://example.com/icon2.png",
    banner: "https://example.com/banner2.png",
    screenshots: ["https://example.com/screenshot2.png"],
    social_urls: [{ name: "twitter", url: "https://twitter.com/app2" }],
    app_urls: [{ code: "web", url: "https://example.com/app2" }],
    tweets: ["Great recycling app!"],
    ve_world: { banner: "https://example.com/veworld-banner2.png" },
}

export const mockApp3 = {
    id: "app-3",
    teamWalletAddress: "0x3456789012345678901234567890123456789012",
    name: "C App",
    metadataURI: "https://example.com/metadata3.json",
    createdAtTimestamp: "1640995202",
    appAvailableForAllocationVoting: true,
    categories: [X2ECategoryType.NUTRITION, X2ECategoryType.FITNESS_WELLNESS],
    description: "A nutrition and fitness app",
    external_url: "https://example.com/app3",
    logo: "https://example.com/icon3.png",
    banner: "https://example.com/banner3.png",
    screenshots: ["https://example.com/screenshot3.png"],
    social_urls: [{ name: "twitter", url: "https://twitter.com/app3" }],
    app_urls: [{ code: "web", url: "https://example.com/app3" }],
    tweets: ["Great fitness app!"],
    ve_world: { banner: "https://example.com/veworld-banner3.png" },
}

export const mockApp4 = {
    id: "app-4",
    teamWalletAddress: "0x4567890123456789012345678901234567890123",
    name: "D App",
    metadataURI: "https://example.com/metadata4.json",
    createdAtTimestamp: "1640995203",
    appAvailableForAllocationVoting: false,
    categories: undefined,
    description: "An app without categories",
    external_url: "https://example.com/app4",
    logo: "https://example.com/icon4.png",
    banner: "https://example.com/banner4.png",
    screenshots: ["https://example.com/screenshot4.png"],
    social_urls: [{ name: "twitter", url: "https://twitter.com/app4" }],
    app_urls: [{ code: "web", url: "https://example.com/app4" }],
    tweets: ["App without categories!"],
    ve_world: { banner: "https://example.com/veworld-banner4.png" },
}

export const mockApps = [mockApp1, mockApp2, mockApp3, mockApp4]
