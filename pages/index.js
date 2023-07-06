import { ethers } from "ethers";
import NftCard from "../components/NftCard";
import Layout from "../components/Layout";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../engine/config";
import { useEffect, useState } from "react";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NotListed from "../components/NotListed";

export default function Home() {
  const [data, setData] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  //const [currAddress, updateCurrAddress] = useState("0x");
  const [message, updateMessage] = useState("");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const data = await marketContract.getMyMarketNfts();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.holder,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    setData(items);
    setLoadingState("loaded");
  }

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    await transaction.wait();

    loadNFTs();
  }
  if (loadingState === "loaded" && !data.length) return <NotListed />;

  return (
    <Layout>
      <div className="pt-20">
        {data.map((nft, i) => (
          <NftCard nft={nft} key={i} buyNFT={buyNFT}></NftCard>
        ))}
      </div>
    </Layout>
  );
}
