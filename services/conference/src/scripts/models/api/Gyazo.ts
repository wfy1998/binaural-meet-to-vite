export interface GayazoReturnType{
  url: string,
  size: [number, number],
}
export function uploadToGyazo<T extends number[]>(imageFile: File):Promise< GayazoReturnType> {
  const promise = new Promise<GayazoReturnType>((resolutionFunc, rejectionFunc) => {
    const formData = new FormData()
    formData.append('access_token', 'e9889a51fca19f2712ec046016b7ec0808953103e32cd327b91f11bfddaa8533')
    formData.append('imagedata', imageFile)
    fetch('https://upload.gyazo.com/api/upload', {method: 'POST', body: formData})
    .then(response => response.json())
    .then((responseJson) => {
      // console.log("URL = " + responseJson.url)
      //  To do, add URL and ask user position to place the image
      const img = new Image()
      img.src = responseJson.url
      img.onload = () => {
        const size:[number, number] = [img.width, img.height]
        const url = responseJson.url
        resolutionFunc({url, size})
      }
    })
    .catch((error) => {
      console.error(error)
      rejectionFunc({undefined, size:[0, 0]})
    })
  })

  return promise
}
