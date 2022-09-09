
# Make Picture NFT

Contract MakePicNFT inherit from ERC721URIStorage, which has a URI to store additional information. This project provide a web page to input information and upload a picture, and then call to mint.

Deployed: 

- https://make-pic-nft-app.vercel.app/

The contract MakePicNFT: https://github.com/maxyou/MakePicNFT-Contract

### How it works

1. Run js-ipfs node in your browser.
2. Write picture into ipfs by js-ipfs node.
3. Construct a JSON according to OpenSea format, with picture ipfs address.
4. Write this JSON into ipfs by js-ipfs node.
5. Call contract function to mint a NFT, with the JSON address as params.

### Defect

The picture and JSON are not pinned in ipfs. I'm not sure if OpenSea cache this files, and what will happen in the future.

### Screenshot
![](https://github.com/maxyou/MakePicNFT-App/blob/main/make-pic-nft-screenshot.png)
![](https://github.com/maxyou/MakePicNFT-App/blob/main/make-pic-nft-screenshot-2.png)
