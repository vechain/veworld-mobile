import { DecodedRequest } from "~Model"
import { SessionState } from "~Storage/Redux/Slices/ExternalDapps"

export const sessions: Record<string, SessionState> = {
    ["duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I="]: {
        address: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
        appName: "Example",
        appUrl: "https://vechainwalletlink.example",
        keyPair: {
            privateKey: "TuVDZhbjj4pEpHfN5RXZnJUYQviFIeq6GsbaaHrxDxk=",
            publicKey: "R8CAofxqD36EZe5YRwzcaXvFXEcVMNK/wlf0imZImlg=",
        },
        sharedSecret: "x9byIbHNkHxQlYX3X1okydH7mKPdsbia0kuRfsD4kec=",
    },
}

export const singCertEncodedRequest =
    // eslint-disable-next-line max-len
    "eyJ0eXBlIjoiZXh0ZXJuYWwtYXBwIiwiYXBwTmFtZSI6IkV4YW1wbGUiLCJhcHBVcmwiOiJodHRwczovL3ZlY2hhaW53YWxsZXRsaW5rLmV4YW1wbGUiLCJwdWJsaWNLZXkiOiJkdUE4ZTVuczBTbng0amJiaGtveTNKZitPT3Y4NzltdnhnNzZGQ1lmUjNJPSIsIm5vbmNlIjoiUXZXa0JvaUpBYjB2aklPcnlsMjBtWjIzR3UxNzI1UUoiLCJwYXlsb2FkIjoieTlnMGlwdDAwWDRsM216NjNVekZNTkJINWxwZjdRajR6eXFnNWtGa1FDVmVjYWFnUTBweUZlRjNpcExWcDFVR01uVTJFYUtGYVBqdkc3cExYbjViTlNFbzR3bTNRZ1lYNEVmV3BEUkhKMjk2ZldCV0RTZzdWOHIzQnF5MjdCeFZmRm9ZYk1HNjNPTGdTN1gzTTNCc1ZzVmQwOE93RWVkZ20yc2JFN0RpWVo0Z29KQXh5a1FOd2E0d2lqQXR1UWRVY0VudzNFdjlrS0FEckh1SzlTMmN3WlE2eVpvS0UwOFluUGdCRVA3SnpsTTZaaXVXMFByZHdwMEhHVGhWbDc2MjErWC9uS3RmbFpNaHdoL3hrWEdBcTRrUE1VUHE3cUFiZGxvZllWVUorbTVEd2xoOTVaUXJaOTQrbjhPaVV5dFQzQ1VadjNHbWNUa1k2SFFpa2FOT0JTdjBvZEFXc3VtczZKdDNiWXBJV2UzSTB2MXVJYVdPQXZQRGJTYXZpRW5LUitwa0ZhN0oraDJsak9wSUJWUG94Y3dGallJanNBVXpNL2NKUGlKNnV3WE55UWpPc3E2VGo4QVMrblRlaU9YMFA1SktacEYrTU9YbkJVVGVMdVdBYm9FK21MYUpHZFRQclVWSHQrRVlHUEZxUGZhZmFSdk83aGQzR3RPNUlVTlF3S3pjUEVwUGpxN3hNOTFSRTV0WStJZDNXUXR6ZXdmWDI3cFhQcHVibVpoK1hNblVHY3JrZldNWWJEc1R2QXJEY0JBNFg0QUtSL3BxZ3Q0UDQ5d1BqN1NuU3Fud0lvMU1kcHdIbTd0QysrYzBhNURoUkdlaHhrYnVrSjBYSjFiSlNneDZRLzlYRVF3S0dNUHV3MUtnaGplcUFkOEhSeGhiQ1d4Q3owbHkiLCJnZW5lc2lzSWQiOiIweDAwMDAwMDAwMGIyYmNlM2M3MGJjNjQ5YTAyNzQ5ZTg2ODc3MjFiMDllZDJlMTU5OTdmNDY2NTM2YjIwYmIxMjcifQ=="

export const singCertDecodedRequest: DecodedRequest = {
    appName: "Example",
    appUrl: "https://vechainwalletlink.example",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    nonce: "ueEFd1s6WDTG/OjqaWj92YcX/NFcKOIu",
    payload:
        // eslint-disable-next-line max-len
        "7sZ8dmuztg6ka7+O5ABZUBmI/MOupJArk0WlH4PuhYonmZ+Mge5lNiBMOUPpkVhyH4+rH0D19ZEXCKxE5ijDo0OnzgDzNuEk1MN5IPw0flo3K8Hv8ZMY9VTqwfmPNZkI4JWEcfk+jVtYBZA/dN8GRscrAFbf6DWfX6c8YSF1q7uVQz34Hjg/988EU33X/VVPp6jecKDoct7wLWnVn2pgizrxht8K6jJXZELayeBF6aspczhyuPNrYRRnW/BXM1SdMBIXNyfsAQ70S5W4Ia1WqKctN8B4h8zD9bpnEQ/BJMKLfl6bUhkuc8jcO8AxSSa2fJcs0VWucY0f4s6+QZ393wb1XBNWDwH57WwNvW8tQg4klzl1Gr72mX+PrT8Lv796J+IxYHos7AfsYO3gmij6o/iKnFre4Q5gGO9t16k81Zk95BVZZsoqfGNru7kH7KW3YWyRXgMbTK0h7kEG/2MiQRTnntGgEkSauhqMLMuwB3/HzEDchc1jpPfNp0gezi27wjcg+MjUYMg3bpncGd3bbPuVm2kcA2MkDR5mVUEgN0l5tWyDr6NiWq6oZXU1iSyhMvghOindGrHPtVxBKyGrh39pFae1ShUAK+AD8kD4Url9xGQ8J4XaccUyTHtfFYhpN5zVNaNoMFd5crPg6lu1bnaOa0BQlVZofkH2fhqT",
    publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
    type: "external-app",
}

export const singTypedDataDecodedRequest: DecodedRequest = {
    appName: "Example",
    appUrl: "https://vechainwalletlink.example",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    nonce: "BJj9Ej+t8QYIyDcGRfXrBtG3EGK0mu9S",
    payload:
        // eslint-disable-next-line max-len
        "Whm6iMil+ulV/f2suHSZrWgcdqCOetLbxsrOXq22h121xl9flmrdA9vT57hHlj2RX9lQbzGn5Fu9aWEkm9T4jQq859c+C+jUZ+Iw0GYn4muBhXLMniwUzmCsZXy0w+c/4GsHIP1isgbqs2tiEMdO1IwcoMVQCaSbKpIAAFw70Mnflz+bsvQ2qBbzs75G4sw70lDE3UAgtAkl3IRdB34C9qiY5KaKDTMP45vHmDPQdQywbx9P2WNB/HFVcrnc0GnCFyTBgVRk5X/k/l9YdPZSxZicL9Ioa6EWm7o0WBiLyyVjyvpyVcXFbPeU8fRUU1zGWxRCgBfvT7moLG9WXSI28o9SQ4yKzq3ZOgcz9lyX+K8442Iz7JD/3v4fCrXJ2z8haxwHe0uRaun0rkC9GDHjJMKfXdu6uJdIcQv9EtQ+AVGKuTO0vWwzWfquPfb+5PzpOf5o5vFBwGovtN6LdiE7odFydmWRs/pGN23nS4DIEtypCMiyeFlfIZdi81ILFjBC2/S5X2SL6CZOve7snZaDVDqfiQwKycPHw6uIx1uMEHeOxErmmFwWeYSKMW73TF35rj3EX/PnEj2vTk1n/Mf8tVwQZ6bFCcF0j0GVBNBgLe6yhVmMg1nEidMnNLGlCkaiwPyboS3INkV7feAkcUXYrh4DiJI1LiCSJ1peRnkM8k18oq5TdibmlA0RMo0MXUs0hKdv1Aj7ljgLtxqeozFcu6LDVUGHo98IOZfkw31hj/UGonTtRQPcgI1QpaFef4h0OWYrx8BTJ5pH4ZAcP3QCIHpEUx2eTkQ0mRaaU+IZMJ2w2SAtq/Y1unSOP/saL9rgd2HeGKN/pJvHz53Ktveo0UNblfn2BcbCqztH71DF61sbUAWXjM2aqXvxKPJokLxv+BEu1w==",
    publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
    type: "external-app",
}

export const singTransactionDecodedRequest: DecodedRequest = {
    appName: "Example",
    appUrl: "https://vechainwalletlink.example",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    nonce: "tF1ZY+t4IMSbVm5HuEmJa3YOFo6VJ/yF",
    payload:
        // eslint-disable-next-line max-len
        "R0VeAtbym88F07ZFWLHWB37yRluxU5CLe63FZuPx+lYAKt99LHYnsmfXpZE7Gogxn8q+anvBUdDDqT3RbVKwqXihoGvJWZZcsGX7H1OMYUxtQZ5f2XK3LxG+scUBAGnXxJvSUvzxk5+qzritegIYXiwNRl4U7tEr9tNzMZPHnp8B9xn3qK3TtWt0ZjTeXEj6yzuXUE56EAfUf65VyE3eIUmXiKlTObdT1vcwvAL/oixXtgGz6paydbCwDzAD0ivnCh5W2AyAB1V72hLXAmCBAryVx94SYIzxp81K5dq/waHuSORYvV+rc/FXSwG28ZhVFMDVGXn1gQ6VuolGGQ6Av2/zPoMfV74oUa7/c+DKxpGLd1rlq1T12X2DT+NpExNv1gloHGcSZTMQxhIfVD3kCEk/fqMYkiv+YFm0cG+YU7fU6peqKkwLeJEgdMIa8N6r5v7B6zeY/LedQvShnguLAAsYmtV9u7iRmwr45LBVtDgB+Xqm7RXYVPy/x8Tcnr0hU1LHigMJ5QySp4ZjU+jri5nN6tyICQsL0mN9hqMKGhu77sT2se27Jgb39r8Ouqrd3taCJ05FcqUpjPnK5EpU/QjXz4S81nZpPfrmrrVsxoBP6oMXPQWCoR2YJ3F2AZct0rK6ezSiFmiAwrGHCnuiIJYejxM49kcbImonST1wT8eFxyrdqtbc5gT4Aw==",
    publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
    type: "external-app",
}

export const disconnectDecodedRequest: DecodedRequest = {
    appName: "Example",
    appUrl: "https://vechainwalletlink.example",
    genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
    nonce: "7KIfbdvGsmWtgcfZfilPM7A62p7TA7Bv",
    payload:
        // eslint-disable-next-line max-len
        "G2By7w7kj3b39lQhM+F1hlxMDExGiCtRXOJPGqVopc8GaX0DR2ONiqylCynwpN5vN6RRxhDxqRwuvaF6Btq3jtMbzLxzRxwnxldoNm2MEio1s3Do7RSrBAHxc95a+eIDGlyQFvI1j/mBLcvhipS6P4S690WKiWCstgS0VhHdi71QpcEffTum7n1JaHniVEk0BrYKc+5A12EWqFnBI8om912LmIXafX0t/NGbv3paTEupO0E9F0REpA+usfoP8VPu0WlqtJhDAsvUK92XuCXEGXV9pnMUY0X6DF1n7DrRZV7Jx7VgBkJn7kQ/EhlITttb7rAoyv/546JByEAnRADWcDvTA/aIFEepbP1+QT/LhSvbz0HFbkPFLSncDax02Ddlq/3FK8VsHJpERSI+aapBy5n3jYmg3c458ecjYi0WnhcfVfRojbD7vGwSXtVLSBvHUdGAnnaIc/40a40PaHPaTzYs0PxHIg==",
    publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
    type: "external-app",
}
