import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState, useRef } from "react";
import makePicNft from '../contract/MakePicNFT.json';
import { CONTRACT_ADDRESS } from '../contract/contract.config';
import { ethers } from "ethers";
import * as IPFS from 'ipfs-core'
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {

  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}


const Home: NextPage = () => {
  const ref = useRef();

  const [currentAccount, setCurrentAccount] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [isMintting, setIsMintting] = useState(false);
  const [viewAddrOpenSea, setViewAddrOpenSea] = useState('');
  const [viewAddrRarible, setViewAddrRarible] = useState('');
  const [nftImage, setNftImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState<any>(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string;

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      setupEventListener();
      console.log("call setupEventListener() in checkIfWalletIsConnected");
    } else {
      console.log("No authorized account found");
    }
  }


  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string;

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener();
      console.log("call setupEventListener() in connectWallet");

    } catch (error) {
      console.log(error);
    }
  }


  // Setup our listener.
  const setupEventListener = async () => {

    console.log("try to setupEventListener()");

    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        // const provider = new ethers.providers.Web3Provider(ethereum as unknown as ExternalProvider);
        const provider = new ethers.providers.Web3Provider(ethereum as unknown as ethers.providers.ExternalProvider);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, makePicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!        
        connectedContract.on("NFTMintInfo", (from, tokenId, jsonUri) => {
          console.log(from, tokenId.toNumber(), jsonUri)
          //console.log("EventListener will send alert here.");          

          const rarible = `https://goerli.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}?tab=history`
          setViewAddrRarible(rarible)
          console.log("EventListener - rarible view address: " + rarible);

          const opensea = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          setViewAddrOpenSea(opensea)
          console.log("EventListener - opensea view address: " + opensea);

          // const viewAddr = `https://goerli.pixxiti.com/address/xxxxxxxxxxx`
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const uploadFile = (event: any) => {

    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setNftImage(i);
      const imgObjectUrl = URL.createObjectURL(i)
      console.log("selected a image, object url:" + imgObjectUrl)
      setCreateObjectURL(imgObjectUrl);

    }
  };

  const removeImg = () => {

    (document.getElementById("inputNftImg") as HTMLInputElement).value = "";
    setNftImage(null);
    setCreateObjectURL('');

  };

  const askContractToMintNft = async () => {

    if (!(nftName && nftDescription && nftImage)) { return }

    const ipfs = await IPFS.create({ repo: "ok" + Math.random() })
    const cidImg = (await ipfs.add(nftImage!)).cid
    const ipfsCidImg = "ipfs://" + cidImg

    console.log("ipfs cid img:" + ipfsCidImg)

    const meta = `{
      "name":"${nftName}",
      "description":"${nftDescription}",
      "image":"${ipfsCidImg}"
    }
    `
    const cidMeta = (await ipfs.add(meta)).cid
    const ipfsCidMeta = "ipfs://" + cidMeta
    console.log("ipfs cid meta:" + ipfsCidMeta)

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum as unknown as ethers.providers.ExternalProvider);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, makePicNft.abi, signer);

        setIsMintting(true)
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makePicNFT(ipfsCidMeta);

        console.log("Mining...please wait.")
        await nftTxn.wait();

        setNftName("")
        setNftDescription("")
        removeImg()
        setIsMintting(false)
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Connect to Wallet
    </button>
  );


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  */
  return (
    <>
      <Head>
        <title>mint your pic nft</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='bg-gray-100 w-screen h-screen flex flex-col justify-center items-center gap-2'>

        <div className='bg-white w-1/2 max-w-2xl 	min-w-[30rem] h-auto p-6 border rounded flex flex-col justify-center items-center gap-5'>

          <div className="p-2 text-4xl">Mint Pic NFT in Goerli!</div>


          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <div className="p-2 flex flex-col justify-center items-center gap-5">

              <div className='w-full p-2'>

                <div className="text-md">
                  name:
                </div>

                <div>
                  <input className="shadow appearance-none border rounded w-full min-w-[25rem] p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-600"
                    type="text" name="text" onChange={e => setNftName(e.target.value)} value={nftName} />
                </div>
              </div>

              <div className='w-full p-2'>

                <div className="text-md">
                  description:
                </div>

                <div>
                  <input className="shadow appearance-none border rounded w-full min-w-[25rem] p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-600"
                    type="text" name="text" onChange={e => setNftDescription(e.target.value)} value={nftDescription} />
                </div>
              </div>


              <div className='w-full p-2'>

                <div className="text-md">
                  image:
                </div>

                <div className='flex justify-between items-center'>
                  <input type="file" name="myImage" onChange={uploadFile} id='inputNftImg' />
                  {
                    nftImage ? <button onClick={removeImg} className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded">remove</button> : null
                  }
                </div>

                <div>
                  {
                    nftImage ? <img src={createObjectURL} className='pt-2' /> : null
                  }
                </div>
              </div>

              {

                nftName && nftDescription && nftImage
                  ?
                  (
                    isMintting ?
                      <button className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded opacity-50 cursor-not-allowed">Please wait Mintting... </button> :
                      <button onClick={askContractToMintNft} className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded">Mint NFT</button>
                  )
                  :
                  <button className="bg-blue-500 text-white p-2 rounded opacity-50 cursor-not-allowed">Mint NFT</button>
              }

              <div className='w-full h-auto p-2'>

                {
                  viewAddrOpenSea && viewAddrRarible
                    ?
                    <div>
                      Click to view NFT:
                    </div>
                    :
                    null
                }

                {
                  viewAddrOpenSea
                    ?
                    <a className='block break-all underline decoration-transparent hover:decoration-inherit' href={viewAddrOpenSea}> {viewAddrOpenSea} </a>
                    :
                    null
                }
                {
                  /* 
                  viewAddrRarible
                    ?
                    <a className='block break-all underline decoration-transparent hover:decoration-inherit' href={viewAddrRarible}> {viewAddrRarible} </a>
                    :
                    null 
                    */
                }
              </div>
            </div>
          )}

        </div>
      </div>

    </>
  );

}

export default Home
