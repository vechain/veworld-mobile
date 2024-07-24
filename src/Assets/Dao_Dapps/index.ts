import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"

const cleanify = require("./cleanify.png")
const mugshot = require("./mugshot.png")
const greencart = require("./greencart.png")
const nonfungiblebookclub = require("./nonfungiblebookclub.png")
const greenambassadorchallenge = require("./greenambassadorchallenge.png")
const evearn = require("./evearn.png")
const vyvo = require("./vyvo.png")
const carboneers = require("./carboneers.png")
const oily = require("./oily.png")

const localDaoDApps: VeBetterDaoDapp[] = [
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a",
        metadataURI: "bafkreiddzfwwbc2nhdzdxodrnblatzix26xupyjxpp65s6fwzwzdoxz45q",
        name: "Mugshot",
        teamWalletAddress: "0xbfe2122a82c0aea091514f57c7713c3118101eda",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3",
        metadataURI: "bafkreibcgvnzmp6hpccaphsdrkgx5estfbhxpgcsb6xcgigzwnknp2fyf4",
        name: "Cleanify",
        teamWalletAddress: "0x6b020e5c8e8574388a275cc498b27e3eb91ec3f2",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a",
        metadataURI: "bafkreif3wf422t4z6zyiztirmpplcdmemldk24dc3a4kow6ug5nznzmvhm",
        name: "GreenCart",
        teamWalletAddress: "0x4e506ee842ba8ccce88e424522506f5b860e5c9b",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0x821a9ae30590c7c11e0ebc03b27902e8cae0f320ad27b0f5bde9f100eebcb5a7",
        metadataURI: "bafkreibx7q6ytesoc4j2mxupegrsob555tbsesj3fc5rd4z7neyf5vy3jm",
        name: "Green Ambassador Challenge",
        teamWalletAddress: "0x15e74aeb00d367a5a20c61b469df30a25f0e602f",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0xcd9f16381818b575a55661602638102b2b8497a202bb2497bb2a3a2cd438e85d",
        metadataURI: "bafkreiegiuaukybbauhae3vdy2ktdqrehf4wzfg6rnfn5ebd36c2k6pmxa",
        name: "Oily",
        teamWalletAddress: "0xd52e3356231c9fa86bb9fab731f8c0c3f1018753",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9",
        metadataURI: "bafkreicz2cslyuzbmj2msmgyzpz2tqwmbyifb7yvb5jbnydp4yx4jnkfny",
        name: "EVearn",
        teamWalletAddress: "0xb2919e12d035a484f8414643b606b2a180224f54",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0xa30ddd53895674f3517ed4eb8f7261a4287ec1285fdd13b1c19a1d7009e5b7e3",
        metadataURI: "bafkreid3dbmrxe3orutmptc43me5gnvskz7hu53bjnlfgafwu6xb53w3mi",
        name: "Vyvo",
        teamWalletAddress: "0x61ffc950b04090f5ce857ebf056852a6d27b0c3c",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1719216830",
        id: "0x74133534672eca50a67f8b20bf17dd731b70d83f0a12e3500fca0793fca51c7d",
        metadataURI: "bafkreieqbiuvoh63gbr2k7xetdsxo3eractg5zd5st6arq5da5vnil5mti",
        name: "Non Fungible Book Club (NFBC)",
        teamWalletAddress: "0xcd093a08794dda7fbcc6d5839c85892f8da2e8be",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "1721578330",
        id: "0xe19c5e83670576cac1cee923e1f92990387bf701af06ff3e0c5f1be8d265c478",
        metadataURI: "bafkreihla5awp3y7utgbxv7ezt64aka5tbbup6bvsbvb3pkef57rydiwjm",
        name: "Carboneers",
        teamWalletAddress: "0x5b9bdbc0063c15cd50b06e8b9954332a534a0b6d",
    },
]

const localDaoDAppsMetadata: VeBetterDaoDAppMetadata[] = [
    {
        name: "Mugshot",
        description:
            "Discover Mugshot, the groundbreaking DApp reshaping how coffee lovers embrace sustainability. By simply snapping a pic of your coffee routine, you join a vibrant community committed to eco-friendly practices.",
        logo: "ipfs://bafybeiewitofu7v7cndsaq3vbvkg6uburhg6wrb3ddtpw5dr2sv4ucqaba/media/logo.jpeg",
        banner: "ipfs://bafybeiewitofu7v7cndsaq3vbvkg6uburhg6wrb3ddtpw5dr2sv4ucqaba/media/banner.jpeg",
        external_url: "https://mugshot.vet/",
        screenshots: [],
        app_urls: [],
        social_urls: [],
        tweets: ["1801334584593772863"],
        weworld: {
            banner: mugshot,
        },
    },
    {
        name: "Cleanify",
        description:
            "Clean to earn: dive into Cleanify, the cutting-edge dApp powered by VechainThor, revolutionizing the drive for a cleaner planet. Earn rewards while actively contributing to environmental preservation through organized group cleanups at beaches, streets, and parks.",
        logo: "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/logo.jpeg",
        banner: "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/banner.jpeg",
        external_url: "https://cleanify.vet/",
        screenshots: [
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot1.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot2.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot3.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot4.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot5.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot6.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot7.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot8.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot9.jpeg",
            "ipfs://bafybeihnnfh7zxpeue76c6fu6jqr5vr2a5vidza7lu6mxbndiiyuh2zo7u/media/screenshot10.jpeg",
        ],
        app_urls: [],
        social_urls: [{ name: "Twitter", url: "https://x.com/cleanify_vet" }],
        tweets: ["1770429956151013558", "1807918713607225847"],
        weworld: {
            banner: cleanify,
        },
    },
    {
        name: "GreenCart",
        description:
            "Shop, Scan, Earn!  Turn your grocery receipts into rewards with our sustainable shopping app. Make every purchase count for a greener future",
        external_url: "http://greencart.vet/",
        logo: "ipfs://bafybeig4lj2j2wal67lglwz2x7rs4kf6bgmmvizcoaxgrqwgi2efv73t2q/images/logo.png",
        banner: "ipfs://bafybeig4lj2j2wal67lglwz2x7rs4kf6bgmmvizcoaxgrqwgi2efv73t2q/images/banner.png",
        screenshots: [],
        social_urls: [
            {
                name: "Twitter",
                url: "https://twitter.com/greencart_vet",
            },
        ],
        app_urls: [],
        weworld: {
            banner: greencart,
        },
    },
    {
        name: "Green Ambassador Challenge",
        description:
            'The Green Ambassador Challenge is an educational platform that offers challenges on various topics to help users learn about sustainability.\n\nWe make learning fun by turning it into a game. Users can earn B3TR tokens as they complete challenges, making it enjoyable and rewarding. This knowledge helps users make eco-friendly choices in their daily lives, turning them into true "Green Ambassadors."',
        logo: "ipfs://bafybeign624xl7cmmsbj3o55rqc6mv36jg6wktqno3a5f3g3q3ucy4wpxe/media/logo.jpeg",
        banner: "ipfs://bafybeign624xl7cmmsbj3o55rqc6mv36jg6wktqno3a5f3g3q3ucy4wpxe/media/banner.jpeg",
        external_url: "https://greenambassadorchallenge.com/",
        screenshots: [
            "ipfs://bafybeign624xl7cmmsbj3o55rqc6mv36jg6wktqno3a5f3g3q3ucy4wpxe/media/screenshot1.jpeg",
            "ipfs://bafybeign624xl7cmmsbj3o55rqc6mv36jg6wktqno3a5f3g3q3ucy4wpxe/media/screenshot2.jpeg",
        ],
        app_urls: [],
        social_urls: [
            { name: "Twitter", url: "https://x.com/GreenAmbChal" },
            { name: "Telegram", url: "https://t.me/greenambassadorchallenge" },
        ],
        tweets: ["1808139581788745899", "1806683246924554397"],
        weworld: {
            banner: greenambassadorchallenge,
        },
    },
    {
        name: "Oily",
        description:
            "Oily dApp by UCO Network enables users to engage in the UCO economy through learning, mapping, and recycling. Educate yourself on sustainable practices, connect with local restaurants and share about their cooking oil disposal habits, and conveniently dispose of your household cooking oil. Earn rewards for your contributions through our 'learn to earn,' 'map to earn,' and 'recycle to earn' initiatives. Join today and get rewarded!",
        external_url: "https://oily.uco.network",
        logo: "ipfs://bafybeibszdfo4ey7t3qbxyni5dzwbhs6xkqhhfs2l65ew3t5wjqc4xkzny/images/logo.png",
        banner: "ipfs://bafybeibszdfo4ey7t3qbxyni5dzwbhs6xkqhhfs2l65ew3t5wjqc4xkzny/images/banner.png",
        screenshots: [],
        social_urls: [
            {
                name: "Twitter",
                url: "https://x.com/UCONetwork",
            },
        ],
        app_urls: [],
        weworld: {
            banner: oily,
        },
    },
    {
        name: "EVearn",
        description:
            "The EVEarn app rewards your eco-friendly actions. Earn $B3TR tokens by charging your electric vehicle. Simply connect your Tesla to the VeWorld wallet by uploading your VIN number, and snap photos of your charging sessions to start earning rewards!",
        external_url: "https://www.evearn.org",
        logo: "ipfs://bafybeibc2usjmwruvmb24wcowfeznkjl5xesz377ux2sjtwe4me6xos7hm/images/logo.png",
        banner: "ipfs://bafybeibc2usjmwruvmb24wcowfeznkjl5xesz377ux2sjtwe4me6xos7hm/images/banner.png",
        screenshots: [],
        social_urls: [
            {
                name: "Twitter",
                url: "https://twitter.com/EvearnB3TR",
            },
        ],
        app_urls: [],
        weworld: {
            banner: evearn,
        },
    },
    {
        name: "Vyvo",
        description:
            "Experience the health revolution with Vyvo Smart Chain, where blockchain, IoT, and AI unite to transform how we manage well-being. We inspire individuals to actively monitor their health and, in return, reward them.",
        external_url: "https://www.vyvo.com/",
        logo: "ipfs://bafybeiengbyocshmx6ac5dtxd5hivuj7qdewpgyfwslmn6z5mdkeb4pjua/images/logo.png",
        banner: "ipfs://bafybeiengbyocshmx6ac5dtxd5hivuj7qdewpgyfwslmn6z5mdkeb4pjua/images/banner.png",
        screenshots: [],
        social_urls: [
            {
                name: "Discord",
                url: "https://discord.com/invite/vyvosmartchain",
            },
            {
                name: "Telegram",
                url: "https://t.me/VyvoSmartChainEN",
            },
        ],
        app_urls: [],
        weworld: {
            banner: vyvo,
        },
    },
    {
        name: "NFBC",
        description:
            "Non-Fungible Book Club’s (NFBC) audio streaming DApp offers a sustainable alternative to traditional literary consumption. Partake in minting and streaming audiobook content and help reduce the waste products of the traditional print industry. With a free, and fee-delegated array of audiobook titles to enjoy, visit the NFBC BETA DApp and claim your audio NFTs today!",
        logo: "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/logo.jpeg",
        banner: "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/banner.jpeg",
        external_url: "https://www.nfbclub.com/",
        screenshots: [
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot1.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot2.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot3.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot4.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot5.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot6.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot7.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot8.jpeg",
            "ipfs://bafybeigydxvvtzcct36rnxy7dqaad3xrxb7itokv5uxym2vavii4cilyiq/media/screenshot9.jpeg",
        ],
        app_urls: [],
        social_urls: [
            { name: "Twitter", url: "https://x.com/NonFungibleBC" },
            { name: "Discord", url: "https://discord.gg/yneWB6ugYN" },
        ],
        tweets: ["1810795837800468960", "1810669891651043421", "1810497604104688059", "1810294260413202665"],
        weworld: {
            banner: nonfungiblebookclub,
        },
    },
    {
        name: "Carboneers",
        description:
            "In collaboration with farming communities in India and Ghana, Carboneers stores carbon dioxide while regenerating degraded soils. The soil fertility is good for the farmers and the carbon storage can be used by you, to pause your carbon footprint! Carboneers helps you understand your carbon footprint and introduces a new concept; Carbon Years. By buying 1 Carbon Year, one ton of carbon dioxide is stored for 1 year. And for every Carbon Year, you will receive B3TR tokens, the more Carbon Years, the B3TR. And on top of that, for every B3TR you receive, our farmers will also receive B3TR!",
        external_url: "https://pauseyourcarbon.com/",
        logo: "ipfs://bafybeieboabgcw4npck7626vwzergos6y4mn73jayqubgexuzmxsqifp5a/media/logo.png",
        banner: "ipfs://bafybeieboabgcw4npck7626vwzergos6y4mn73jayqubgexuzmxsqifp5a/media/banner.png",
        screenshots: [],
        social_urls: [
            {
                name: "Twitter",
                url: "https://x.com/the_Carboneers",
            },
            {
                name: "Linkedin",
                url: "https://www.linkedin.com/company/carboneersunitedbv",
            },
        ],
        app_urls: [],
        weworld: {
            banner: carboneers,
        },
    },
]

const localDaoDAppsPlaceholder = [
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "",
        id: "",
        metadataURI: "",
        name: "",
        teamWalletAddress: "",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "",
        id: "",
        metadataURI: "",
        name: "",
        teamWalletAddress: "",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "",
        id: "",
        metadataURI: "",
        name: "",
        teamWalletAddress: "",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "",
        id: "",
        metadataURI: "",
        name: "",
        teamWalletAddress: "",
    },
    {
        appAvailableForAllocationVoting: true,
        createdAtTimestamp: "",
        id: "",
        metadataURI: "",
        name: "",
        teamWalletAddress: "",
    },
]

export { localDaoDAppsMetadata, localDaoDApps, localDaoDAppsPlaceholder }
