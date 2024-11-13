import { NotificationTags } from "./NotificationsProvider"

export const mapDappIdToNotificationTag = (dappId: string) => {
    switch (dappId) {
        case "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a":
            return NotificationTags.Mugshot
        case "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3":
            return NotificationTags.Cleanify
        case "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a":
            return NotificationTags.GreenCart
        case "0x821a9ae30590c7c11e0ebc03b27902e8cae0f320ad27b0f5bde9f100eebcb5a7":
            return NotificationTags.GreenAmbassador
        case "0xcd9f16381818b575a55661602638102b2b8497a202bb2497bb2a3a2cd438e85d":
            return NotificationTags.Oily
        case "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9":
            return NotificationTags.EVearn
        case "0xa30ddd53895674f3517ed4eb8f7261a4287ec1285fdd13b1c19a1d7009e5b7e3":
            return NotificationTags.Vyvo
        case "0x74133534672eca50a67f8b20bf17dd731b70d83f0a12e3500fca0793fca51c7d":
            return NotificationTags.NFBC
        case "0xe19c5e83670576cac1cee923e1f92990387bf701af06ff3e0c5f1be8d265c478":
            return NotificationTags.PauseYourCarbon
        case "0x6a825c7d259075d70a88cbd1932604ee3009777e14645ced6881a32b9c165ca4":
            return NotificationTags.GreenCommuter
        case "0x1cdf0d2cc9bb81296647c3b6baae1006471a719e67c6431155db920d71242afb":
            return NotificationTags.SolarWise
        case "0xca0b325c7d08aa29642c6a82e490c99bac53e5e53dce402faa1ec12b7e382409":
            return NotificationTags.Carbonlarity
        case "0x698555a1fc7b34a52900e3df2d68dd380fa3dfae3b3ed65dba0d230cdab17689":
            return NotificationTags.St3pr
        default:
            null
    }
}

export const mapNotificationTagToDappId = (tag: NotificationTags) => {
    switch (tag) {
        case NotificationTags.Mugshot:
            return "0x2fc30c2ad41a2994061efaf218f1d52dc92bc4a31a0f02a4916490076a7a393a"
        case NotificationTags.Cleanify:
            return "0x899de0d0f0b39e484c8835b2369194c4c102b230c813862db383d44a4efe14d3"
        case NotificationTags.GreenCart:
            return "0x9643ed1637948cc571b23f836ade2bdb104de88e627fa6e8e3ffef1ee5a1739a"
        case NotificationTags.GreenAmbassador:
            return "0x821a9ae30590c7c11e0ebc03b27902e8cae0f320ad27b0f5bde9f100eebcb5a7"
        case NotificationTags.Oily:
            return "0xcd9f16381818b575a55661602638102b2b8497a202bb2497bb2a3a2cd438e85d"
        case NotificationTags.EVearn:
            return "0x6c977a18d427360e27c3fc2129a6942acd4ece2c8aaeaf4690034931dc5ba7f9"
        case NotificationTags.Vyvo:
            return "0xa30ddd53895674f3517ed4eb8f7261a4287ec1285fdd13b1c19a1d7009e5b7e3"
        case NotificationTags.NFBC:
            return "0x74133534672eca50a67f8b20bf17dd731b70d83f0a12e3500fca0793fca51c7d"
        case NotificationTags.PauseYourCarbon:
            return "0xe19c5e83670576cac1cee923e1f92990387bf701af06ff3e0c5f1be8d265c478"
        case NotificationTags.GreenCommuter:
            return "0x6a825c7d259075d70a88cbd1932604ee3009777e14645ced6881a32b9c165ca4"
        case NotificationTags.SolarWise:
            return "0x1cdf0d2cc9bb81296647c3b6baae1006471a719e67c6431155db920d71242afb"
        case NotificationTags.Carbonlarity:
            return "0xca0b325c7d08aa29642c6a82e490c99bac53e5e53dce402faa1ec12b7e382409"
        case NotificationTags.St3pr:
            return "0x698555a1fc7b34a52900e3df2d68dd380fa3dfae3b3ed65dba0d230cdab17689"
        default:
            return null
    }
}
