export const computeBarStyle = (
    isHero: boolean | undefined,
    isDark: boolean,
) => {
    if (isHero) {
        return 'light-content'
    }

    if (isDark) {
        return 'light-content'
    }

    return 'dark-content'
}
