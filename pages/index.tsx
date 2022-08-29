import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import myBlessNft from '../utils/MyBlessNFT.json';
import { ethers } from "ethers";
import * as IPFS from 'ipfs-core'
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {

  interface Window {
    ethereum: MetaMaskInpageProvider;
  }

  // type ExternalProvider = {
  //   isMetaMask?: boolean;
  //   isStatus?: boolean;
  //   host?: string;
  //   path?: string;
  //   sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  //   send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
  //   request?: (request: { method: string, params?: Array<any> }) => Promise<any>
  // }
}

const CONTRACT_ADDRESS = "0x8E542a41088cfDBFdCF21B796413d7d8f363f65E";


const Home: NextPage = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [myBless, setMyBless] = useState("");
  const [isMintting, setIsMintting] = useState(false);
  const [justMintNft, setJustMintNft] = useState("");
  const [image, setImage] = useState(null);
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
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myBlessNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!        
        connectedContract.on("NFTMintInfo", (from, tokenId, bless) => {
          console.log(from, tokenId.toNumber(), bless)
          //console.log("EventListener will send alert here.");          
          //alert(`New NFT: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
          //alert(`https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}?tab=history`)
          const viewAddr = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          console.log("EventListener - view address" + viewAddr);          
          // const viewAddr = `https://goerli.pixxiti.com/address/0xCa57e178c9414FDF541beaf6097D85D9716A5359`
          setJustMintNft(viewAddr)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const uploadFile = (event:any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      const imgUrl = URL.createObjectURL(i)
      console.log("selected a image, object url:"+imgUrl)
      setCreateObjectURL(imgUrl);
    }
  };

  const sendToIpfs = async () => {

    if(image!=null){
      const ipfs = await IPFS.create({ repo: "ok" + Math.random() })
      const { cid } = await ipfs.add(image)
      console.log("ipfs create and add string, cid:"+cid)
    }

  }

  const askContractToMintNft = async () => {


    // const ipfs = await IPFS.create({ repo: "ok" + Math.random() })
    // const { cid } = await ipfs.add(myBless)
    // console.log("ipfs create and add string, cid:"+cid)

    // if(true){
    //   return;
    // }

    if (!myBless || myBless.length == 0) {
      alert("please input you brand")
      return;
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum as unknown as ethers.providers.ExternalProvider);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myBlessNft.abi, signer);

        setIsMintting(true)

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeBlessNFT("");

        console.log("Mining...please wait.")
        await nftTxn.wait();

        setMyBless("")
        setIsMintting(false)
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

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
        <title>mint your best wish</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='bg-gray-100 w-screen h-screen flex flex-col justify-center items-center gap-2'>

        <div className='bg-white w-1/2 max-w-2xl 	min-w-[30rem] h-auto p-6 border rounded flex flex-col justify-center items-center gap-5'>
        
        <img src={createObjectURL} />
        <input type="file" name="myImage" onChange={uploadFile} />
        <button
          className="btn btn-primary"
          type="submit"
          onClick={sendToIpfs}
        >
          Send to server
        </button>

          <div className="p-2 text-4xl">Mint your NFT!</div>

          <div className="p-2 text-2xl">
            Give your Bless ipfs here:
          </div>

          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <div className="p-2 flex flex-col justify-center items-center gap-5">
              <div>
                <input className="shadow appearance-none border rounded min-w-[25rem] p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-600"
                  type="text" name="text" onChange={e => setMyBless(e.target.value)} value={myBless} placeholder="ipfs://..." />
              </div>
              {
                isMintting ?
                  (<button className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded">Please wait Mintting... </button>) :
                  (<button onClick={askContractToMintNft} className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded">Mint NFT</button>)
              }
              {
                justMintNft.length == 0 ? null :
                <div className='w-full h-auto p-2 border rounded'>
                  <div>
                  Click to view last NFT you mint:
                  </div>
                  <a className='break-all underline decoration-transparent hover:decoration-inherit' href={justMintNft}> {justMintNft} </a>
                </div>
              }
            </div>
          )}

        </div>
      </div>

    </>
  );

}

export default Home
