import { createIconSet } from "@expo/vector-icons"
import { designSystemIconMap } from "~Assets"

export const Icon = createIconSet(
    designSystemIconMap,
    "DesignSystemIcons",
    require("~Assets/Fonts/DesignSystemIcons/DesignSystemIcons.ttf"),
)
