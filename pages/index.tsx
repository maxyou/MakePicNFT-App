import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import myEpicNft from '../utils/MyEpicNFT.json';
import { ethers } from "ethers";

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


const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x4280403668a7749C1012D3AB105C373bAE8cfEbD";



const Home: NextPage = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [myBrand, setMyBrand] = useState("");
  const [tokenId, setTokenId] = useState(0);
  const [maxNum, setMaxNum] = useState(0);
  const [isMintting, setIsMintting] = useState(false);
  const [justMintNft, setJustMintNft] = useState("");
  //const [count, setCount] = useState(0);


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
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!        
        connectedContract.on("NFTMintInfo", (from, tokenId, brand, mark) => {
          console.log(from, tokenId.toNumber(), brand, mark)
          //console.log("EventListener will send alert here.");          
          //alert(`New NFT: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
          //alert(`https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}?tab=history`)
          setJustMintNft(`https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}/items`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const getContractTokenId = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum as unknown as ethers.providers.ExternalProvider);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);

        console.log("try to get token id and max num...")
        let result = await connectedContract.getTokenId();

        setTokenId(result[0])
        setMaxNum(result[1])

        console.log(`Current token id is ${result[0]}, and max num is ${result[1]}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const askContractToMintNft = async () => {


    if (!myBrand || myBrand.length == 0) {
      alert("please input you brand")
      return;
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum as unknown as ethers.providers.ExternalProvider);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        setIsMintting(true)

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT(myBrand);

        console.log("Mining...please wait.")
        await nftTxn.wait();

        setMyBrand("")
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
    //console.log(`setInterval in useEffect - ${count}`);
    getContractTokenId()

    setInterval(() => {
      //console.log(`setInterval with count - ${count}`);
      //setCount(old => old + 1);      
      getContractTokenId()
    }, 5000);
  }, []);

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

        <div className='bg-white w-1/2 max-w-2xl 	min-w-[30rem] h-auto p-6 border rounded flex flex-col justify-center items-center gap-2'>

          <div className="p-2 text-4xl">Mint your NFT!</div>

          <div className="p-2 text-2xl">
            Give your greet here and mint it to NFT in {1 + parseInt(tokenId.toString())} of {maxNum.toString()}!
          </div>

          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <div className="p-2 flex flex-col justify-center items-center gap-3">
              <div>
                <input className="shadow appearance-none border rounded min-w-[25rem] p-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-600"
                  type="text" name="text" onChange={e => setMyBrand(e.target.value)} value={myBrand} placeholder="leave your wishes here!" />
              </div>
              {
                isMintting ?
                  (<button className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded">Please wait Mintting... </button>) :
                  (<button onClick={askContractToMintNft} className="bg-blue-500 min-w-fit hover:bg-blue-700 text-white p-2 rounded">Mint NFT</button>)
              }
              {
                justMintNft.length == 0 ? null :
                  <p className="sub-text"> <a href={justMintNft}>  Click to view last NFT you mint  </a>  </p>
              }
            </div>
          )}

        </div>
      </div>

    </>
  );

}

export default Home
