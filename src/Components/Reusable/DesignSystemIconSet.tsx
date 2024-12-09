import { createIconSet } from "@expo/vector-icons"
import designSystemIconMap from "~Assets/Fonts/DesignSystemIcons/DesignSystemIconMap.json"

export const Icon = createIconSet(
    designSystemIconMap,
    "DesignSystemIcons",
    require("~Assets/Fonts/DesignSystemIcons/DesignSystemIcons.ttf"),
)

export type IconKey = keyof typeof designSystemIconMap
