import { createIconSet } from "@expo/vector-icons"
import { DesignSystemIconMap } from "~Assets"

export const Icon = createIconSet(
    DesignSystemIconMap,
    "DesignSystemIcons",
    require("~Assets/Fonts/DesignSystemIcons/DesignSystemIcons.ttf"),
)
