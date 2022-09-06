
# Make Picture NFT

MakePicNFT inherit from ERC721URIStorage. Mint function get URI params of JSON which include the link to a picture.

This project has been deployed online: 

- https://make-pic-nft-app.vercel.app/

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
