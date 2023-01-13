export const computeBarStyle = (
    isHero: boolean | undefined,
    isDark: boolean,
) => {
    if (isHero || isDark) {
        return "light-content"
    }

    return "dark-content"
}
