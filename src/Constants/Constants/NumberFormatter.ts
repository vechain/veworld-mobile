const DE_NUMBER_FORMAT = new Intl.NumberFormat("de-DE", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const EN_NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const ES_NUMBER_FORMAT = new Intl.NumberFormat("es-ES", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const FR_NUMBER_FORMAT = new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const HI_NUMBER_FORMAT = new Intl.NumberFormat("hi-IN", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const IT_NUMBER_FORMAT = new Intl.NumberFormat("it-IT", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const JA_NUMBER_FORMAT = new Intl.NumberFormat("ja-JP", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const KO_NUMBER_FORMAT = new Intl.NumberFormat("ko-KR", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const NL_NUMBER_FORMAT = new Intl.NumberFormat("nl-NL", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const PL_NUMBER_FORMAT = new Intl.NumberFormat("pl-PL", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const PT_NUMBER_FORMAT = new Intl.NumberFormat("pt-PT", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const RU_NUMBER_FORMAT = new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const TR_NUMBER_FORMAT = new Intl.NumberFormat("tr-TR", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const ZH_CN_NUMBER_FORMAT = new Intl.NumberFormat("zh-CN", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const ZH_TW_NUMBER_FORMAT = new Intl.NumberFormat("zh-TW", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const VI_VN_NUMBER_FORMAT = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const BE_NUMBER_FORMAT = new Intl.NumberFormat("nl-BE", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const NumberFormatter = {
    "nl-BE": BE_NUMBER_FORMAT,
    "de-DE": DE_NUMBER_FORMAT,
    de: DE_NUMBER_FORMAT,
    "en-US": EN_NUMBER_FORMAT,
    en: EN_NUMBER_FORMAT,
    "es-ES": ES_NUMBER_FORMAT,
    es: ES_NUMBER_FORMAT,
    "fr-FR": FR_NUMBER_FORMAT,
    fr: FR_NUMBER_FORMAT,
    "hi-IN": HI_NUMBER_FORMAT,
    hi: HI_NUMBER_FORMAT,
    "it-IT": IT_NUMBER_FORMAT,
    it: IT_NUMBER_FORMAT,
    "ja-JP": JA_NUMBER_FORMAT,
    ja: JA_NUMBER_FORMAT,
    "ko-KR": KO_NUMBER_FORMAT,
    ko: KO_NUMBER_FORMAT,
    "nl-NL": NL_NUMBER_FORMAT,
    nl: NL_NUMBER_FORMAT,
    "pl-PL": PL_NUMBER_FORMAT,
    pl: PL_NUMBER_FORMAT,
    "pt-PT": PT_NUMBER_FORMAT,
    pt: PT_NUMBER_FORMAT,
    "ru-RU": RU_NUMBER_FORMAT,
    ru: RU_NUMBER_FORMAT,
    "tr-TR": TR_NUMBER_FORMAT,
    tr: TR_NUMBER_FORMAT,
    "zh-TW": ZH_TW_NUMBER_FORMAT,
    tw: ZH_TW_NUMBER_FORMAT,
    "vi-VN": VI_VN_NUMBER_FORMAT,
    vi: VI_VN_NUMBER_FORMAT,
    "zh-CN": ZH_CN_NUMBER_FORMAT,
    zh: ZH_CN_NUMBER_FORMAT,
}
