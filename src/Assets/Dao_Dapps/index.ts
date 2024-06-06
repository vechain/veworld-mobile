import { ImageSourcePropType } from "react-native"

const cleanify = require("./cleanify.png")
const mugshot = require("./mugshot.png")
const greencart = require("./greencart.png")
const nonfungiblebookclub = require("./nonfungiblebookclub.png")
const greenambassadorchallenge = require("./greenambassadorchallenge.png")
const evearn = require("./evearn.png")

export type DaoDapps = { img: ImageSourcePropType; href: string }

const daoDapps: DaoDapps[] = [
    { img: cleanify, href: "https://cleanify.vet" },
    { img: mugshot, href: "https://mugshot.vet" },
    { img: greencart, href: "https://www.greencart.vet" },
    { img: nonfungiblebookclub, href: "https://www.vesea.io/community/nonfungiblebookclub" },
    { img: greenambassadorchallenge, href: "https://greenambassadorchallenge.com/" },
    { img: evearn, href: "https://evearn.org/" },
]

const randomized = daoDapps.sort(() => Math.random() - 0.5)

export { randomized }
