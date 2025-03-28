import React from "react"
import { BackButtonGenericHeader } from "~Components"
import { SearchBar } from "./SearchBar"

export const SearchHeader = () => {
    return <BackButtonGenericHeader rightElement={<SearchBar onTextChange={() => {}} />} />
}
