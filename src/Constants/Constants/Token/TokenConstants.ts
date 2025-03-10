/* eslint-disable max-len */
import { FungibleToken, Network } from "~Model"
import { defaultMainNetwork } from "../Thor/ThorConstants"

export const getDefaultSelectedNetwork = (): Network => {
    return defaultMainNetwork
}

export const VET: FungibleToken = {
    name: "Vechain",
    symbol: "VET",
    address: "0x0",
    decimals: 18,
    custom: false,
    icon: "data:image/x-icon;base64,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",
}

export const VTHO: FungibleToken = {
    symbol: "VTHO",
    name: "Vethor",
    address: "0x0000000000000000000000000000456e65726779",
    decimals: 18,
    custom: false,
    icon: "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUmSURBVHgB7ZnfT1xFFMe/M3eXZYECVUNiahNi+mD0SRPjq0UNBluaWgVbUptq1MRQldimWmxcBGFpqsX4K5EmmlT7YBNjfNEGAf0DTBofNBhTLqW1WxZZdvmxP+8dz9zdlUJT9v4YoCZ+Ark/cvbec2bOnPnOXOA/DoNCun/ECcGxz+6DjRxHNuU3mWaCcRMaF3QUgMYG324wu208Aj4ohJx/mg5brHMb9pm0z7Jk0lgwCOso9OCcOQCbcCiia9hyvt6ufZacF4Z8/VJfkf+xnBANR3dhzu5zlAXAOZ61aysMRqmz1PnCCoLJY7inEeNwgJIxEPoe9Txg/8WphTIYGY2Czue8lfdcfP7uE9nn4BAlPcDL8JRd21xW+7f1i+NEMKYbIvs6XKAmhRhesmuamgsAhZSR0MBNmQYeC+9ADC7wHED3EB6mwzY7tplFP0wqnbLpRbHycBwL70r/CZd47wE/DtoxM6niJOcDy+8J9lm4OX0KHvAUQOgH3AbTXv6nyHlhMivvC7mvV/i1TnjEUwDcj2ZypqKUXS7jowDKKG2YlTYUQYpny7aHmuem4RGvKfSyHaP5WHDZtQl+PLx3VocCXAfQO4p7qJA8WMouSVUnl9byF8L6G3y/de4kFOE6AEPgcEkbqjiL8Xzri3zij/s13xEoxFUAoa9RRv48UspOOi+DKMiEBE1Yj/a3xOJQiKsAWB1aUUK45UgqLMbLl2o+2ImBtvhFKMaVFnpnGN/QL3evZjM9WWvpnaLW4Zq4nD+nIUz6mWkif7xOD2ma1EQ41NOU+RY2cbweCI1Sy4vVnV+YDVp6x3KscI964a6i7rduiqXT4sxgCnT1OnDeVQDkU0nZzH0mqu9YALMkj1h2ZDIKORXQpGatCQQKCxr+ce/OZAgOcRwAvfAAK5F4wap0iWcwzM8E8w2fn9uGyi8kX4ELHA3i7mE0kPN3wyNpmpVNo/hqNsYWA62hEM1vLnAUgHAgm29GJum3ZEVhUpvgWf/j4ba4KyktsV2FwkObazJabAYeJj/Z6onpSiv/OTcz0HD/ey3zv8EDtp0h5/fAo3aSeW+tByDHAX/eq/MS24OYcn8nDWC9hFlt4f8GFmhSk+kj18GUOqFT+xJfQgFKN7a6RnCWHrh35X0p5mJXq/PzAhP9HxyIvwFFKNtW6fkZW+lhNyxuZN7PXttU3Dr5avN4/BgUoiyAXA57hFxgrkAOWoN2IqhI/iEqAh1uy+XNULexxfDqyntSUiQTAVl+dZ9mNn7YEolCMUoC6B5BM1aoU9nqiakqeTpL+dM0cFDNCmwlSgKQ8mL5NUP0EqlRE0Jj/JlPXvj7d6wRngOw1CnDk9ffky2fI6FmmnjroxenzmMN8RwAM7BsP3NxthzxaKWsOv2n26O9WGO87QvR0pJx7C9ey+2Tmas1UjSdHmyPKKv1q+FtX+h262tMffE6OlGLbEa7UJsxX8M64S2FmPVRw0LOtLR1qAuYu08eubaAdcJ1AH2jVss3yXO5fJy5Uv0XuLH9i46IjnXEdQA5ASvHZb2/MlYnmOFrW2/nJa4+8oW+QwWV+kYpK6cv11Del3WeeVP/CRuAqx7glWgh5+tl3sciVV1njup92CBc9QA1/CE5UUUnaz4923kphA3EcQ8cH8F9VH4emPj1zl+2pSbbscE4DsDPcHh6olZPJrUdqqWxGxwF0HMeW+NTm+6NXKxrOBfSI7gFcBRAYj74UDLu7zjXM+boY/Qtw/6+LQ34H7X8A/Bm+tK3u+X3AAAAAElFTkSuQmCCiVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUmSURBVHgB7ZnfT1xFFMe/M3eXZYECVUNiahNi+mD0SRPjq0UNBluaWgVbUptq1MRQldimWmxcBGFpqsX4K5EmmlT7YBNjfNEGAf0DTBofNBhTLqW1WxZZdvmxP+8dz9zdlUJT9v4YoCZ+Ark/cvbec2bOnPnOXOA/DoNCun/ECcGxz+6DjRxHNuU3mWaCcRMaF3QUgMYG324wu208Aj4ohJx/mg5brHMb9pm0z7Jk0lgwCOso9OCcOQCbcCiia9hyvt6ufZacF4Z8/VJfkf+xnBANR3dhzu5zlAXAOZ61aysMRqmz1PnCCoLJY7inEeNwgJIxEPoe9Txg/8WphTIYGY2Czue8lfdcfP7uE9nn4BAlPcDL8JRd21xW+7f1i+NEMKYbIvs6XKAmhRhesmuamgsAhZSR0MBNmQYeC+9ADC7wHED3EB6mwzY7tplFP0wqnbLpRbHycBwL70r/CZd47wE/DtoxM6niJOcDy+8J9lm4OX0KHvAUQOgH3AbTXv6nyHlhMivvC7mvV/i1TnjEUwDcj2ZypqKUXS7jowDKKG2YlTYUQYpny7aHmuem4RGvKfSyHaP5WHDZtQl+PLx3VocCXAfQO4p7qJA8WMouSVUnl9byF8L6G3y/de4kFOE6AEPgcEkbqjiL8Xzri3zij/s13xEoxFUAoa9RRv48UspOOi+DKMiEBE1Yj/a3xOJQiKsAWB1aUUK45UgqLMbLl2o+2ImBtvhFKMaVFnpnGN/QL3evZjM9WWvpnaLW4Zq4nD+nIUz6mWkif7xOD2ma1EQ41NOU+RY2cbweCI1Sy4vVnV+YDVp6x3KscI964a6i7rduiqXT4sxgCnT1OnDeVQDkU0nZzH0mqu9YALMkj1h2ZDIKORXQpGatCQQKCxr+ce/OZAgOcRwAvfAAK5F4wap0iWcwzM8E8w2fn9uGyi8kX4ELHA3i7mE0kPN3wyNpmpVNo/hqNsYWA62hEM1vLnAUgHAgm29GJum3ZEVhUpvgWf/j4ba4KyktsV2FwkObazJabAYeJj/Z6onpSiv/OTcz0HD/ey3zv8EDtp0h5/fAo3aSeW+tByDHAX/eq/MS24OYcn8nDWC9hFlt4f8GFmhSk+kj18GUOqFT+xJfQgFKN7a6RnCWHrh35X0p5mJXq/PzAhP9HxyIvwFFKNtW6fkZW+lhNyxuZN7PXttU3Dr5avN4/BgUoiyAXA57hFxgrkAOWoN2IqhI/iEqAh1uy+XNULexxfDqyntSUiQTAVl+dZ9mNn7YEolCMUoC6B5BM1aoU9nqiakqeTpL+dM0cFDNCmwlSgKQ8mL5NUP0EqlRE0Jj/JlPXvj7d6wRngOw1CnDk9ffky2fI6FmmnjroxenzmMN8RwAM7BsP3NxthzxaKWsOv2n26O9WGO87QvR0pJx7C9ey+2Tmas1UjSdHmyPKKv1q+FtX+h262tMffE6OlGLbEa7UJsxX8M64S2FmPVRw0LOtLR1qAuYu08eubaAdcJ1AH2jVss3yXO5fJy5Uv0XuLH9i46IjnXEdQA5ASvHZb2/MlYnmOFrW2/nJa4+8oW+QwWV+kYpK6cv11Del3WeeVP/CRuAqx7glWgh5+tl3sciVV1njup92CBc9QA1/CE5UUUnaz4923kphA3EcQ8cH8F9VH4emPj1zl+2pSbbscE4DsDPcHh6olZPJrUdqqWxGxwF0HMeW+NTm+6NXKxrOBfSI7gFcBRAYj74UDLu7zjXM+boY/Qtw/6+LQ34H7X8A/Bm+tK3u+X3AAAAAElFTkSuQmCC",
}

export const B3TR: FungibleToken = {
    symbol: "B3TR",
    name: "B3TR",
    address: "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
    decimals: 18,
    custom: false,
    icon: "data:image/x-icon;base64,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",
}

export const VOT3: FungibleToken = {
    symbol: "VOT3",
    name: "VOT3",
    address: "0x76Ca782B59C74d088C7D2Cce2f211BC00836c602",
    decimals: 18,
    custom: false,
    icon: "data:image/x-icon;base64,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",
}

export const VBD_ICON =
    "data:image/icon-x;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAwCAYAAAC4wJK5AAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASCSURBVHgBxVrbVdtAEJ2VBN/QAVQQqCDmNzwCFWAqACoAKghUgFMB5tjJr5UO3EGcCvA3aDWZWQmw5d3Rri3BPYfjxz48d2fnKRS0jWPcAP3SBYy+AqodULhlvlcwBYQxvf6EOO5DX01hSShoCyx8lp+T0Bck7IY4V6kJAN7AIOnBEmiHxDGddpY/kGA7QetAXcMwvoFANE+CCeh8BFhem1Bgfgm/1m9DljRLYlUCBaaQxLtkIxPfBRE0Ca2vViTAIFvKuiELmtPEIf0wwj3Iv8YeKC0/7AiEpzBMNsETDWpCXcnjeEeudJs80In5i6O9witZsWGupieaIWG0IPwoG+tw7WIuFpg7r++ca7JsCzzRDAlU584xBb1QbxOKeRIcoEJh1C7Eg1jy+9EX51CO3hG8IHFAXuUwe4JMP8Gh/kvvj303oJTCPZe1ILpK1XEO/V4fgyciQwDw+i014LuN8ADfnv2iLcanzjGdu++8bEcpBCCi0+raR6IfUAfpKrHnEU9T8GacFAYgEk6jA/vPFyBB6457EFPn0EFNUIzjFAKg4CAbAQtsB6cA2840WVyLe+RW08U1LzRfjcCNKUnVL7bAf6TRMZEaS7alajdl4xwkZwvfm1SbHIFLEFvEXSW3YjnY01nIRMVpodsAkWzGEK1AukqvJzkLUxytkt2SHBl5TuOI5lG42CS5FlIAcBjhd/d8eJz7VBRIowaSQzCetEKkIGHuPF4KKy1GLvj4qmFqfR9eIEkgIjPyzGexvkYu21FK9rBn3hV28yDsuQre5JlPO5L4TFjEef4reylKv/t4rTnWdKAdbMALNSCgmjv1y4LdCbIN9jAqctvD61ViLaAjkC5sy3UGOZcczszpDhNFr5v0/Yloq6Uci0WR8SLkBVwdCqRNlctAyacPqbQs9tky3kQUvkzH47WeMxbVyUOEF1Nxs1nu1oaSPEz+OLPPpKzkLHuYk7+hwmgXBpSmSz0nHkN0pyF0WPZ6YmDy/xRCkWM1PthsLKUrt0vx6TqgYSbOS9xDbBuCG63ClvANkj6d1HZZ+PN16FtTkXqIdY7cKJBdbnUne3rSBCQ5rDYxB/Tvxkn3dhUUDYOOfVAZzcskCtWnUI/pktekHloLdQd6kDDw0AbiH2gDx6bK7IL7d43260n4aCNSfWgDmXY349iRlNr3bNnUaCOwEvNCkal23BPeZfJvY+5T1LQHuveErykc6XOKOe5eFWthQOlJCf/mmcrt3iewqK/FEZ6KBAzmywZ/EhxhFyrA5Z/uWMFXKNc9eRLJwEF0BuFdcZPYUZ80ScarPGer7MmlK3dA5O5K5Rq9fQ2fDS6wVHRfW7oyAe6kWxoFn0fC9/QZAgEzDB+NkKeqjBoCZgp8FEKFZ3gQMNOgbRQNM3p+gV1v4Rncu4qp5vdwHu2SWKbjx1VfTpVlwIOZBNqEeZoKWwErUnP6g2QSsKZlEr4Eljj9WbRLovgnlJpxfqqa3NLpLx04W9YEpylqsdE2K3wDUb9971S0PMk2FDXdkNo41NaR+kxL4D8HVw+MII5BMwAAAABJRU5ErkJggg=="

export const TEST_B3TR_ADDRESS = "0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F"

export const TEST_VOT3_ADDRESS = "0xa704c45971995467696ee9544da77dd42bc9706e"
