import Head from "next/head"
import {useState, useEffect} from 'react'
// Components
import StakeCard from "../components/StakeCard"
import StakedCard from "../components/StakedCard"
import StakeStat from "../components/StakeStat"
import LoadingIndicator from '../components/LoadingIndicator';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faCoins, faLongArrowLeft, faLongArrowRight } from '@fortawesome/free-solid-svg-icons'

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react'

//Swiper CSS
import 'swiper/css'
import 'swiper/css/navigation'

import { Navigation } from 'swiper'

//connect wallet

import { BigNumber, ethers } from 'ethers'
//contract ABI
import mint  from "../services/abi/mint.json";
import staking from "../services/abi/staking.json"
import token from "../services/abi/token.json"
import axios from "axios";

// DATA

const stats = [
	{ title: "Staking Power", value: 10, descUp: "xSCALE", descDown: "per day" },
	{ title: "Staking Power", value: 10, descUp: "xSCALE", descDown: "per day" },
	{ title: "Staking Power", value: 10, descUp: "xSCALE", descDown: "per day" },
	{ title: "My Earnings", value: 100, descUp: "xSCALE", descDown: null },
]
const address = "0xDDfB8dB393165c3D8562178Ea29c23b2cde85D24"
const stakingAddress = "0xE2e7BF2fA3cD6fA0808f331D897849d5Ff074547"
const tokenContractAddress = "0x61E828eb964cFb6Db92BE47fa9Db0e00942B40bE"




const Stake = () => {
	const [walletAddress, setWalletAddress] = useState(null)
	const [isNFTLoading, SetIsNFTLoading] = useState(false)
	const [ownToken, setOwnToken] = useState([])
	const [ownStakedToken, setOwnStakedToken] = useState([])
	const [stats, setStats] = useState([])

	const connect = async() =>{
		const metamaskProvider = window.ethereum;
		try{
			await metamaskProvider.request({ method: 'eth_requestAccounts' });
			const provider = new ethers.providers.Web3Provider(metamaskProvider);
			const signer_metamask = provider.getSigner();
			
			const currentAccount = await signer_metamask.getAddress()
			setWalletAddress(currentAccount)
		} catch(error){
			alert("wallet connection error")
		}	

	}
	
	const disconnect = async() =>{
		
	}

	const getNFT = async() =>{
		SetIsNFTLoading(true)
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const nftContract = new ethers.Contract(address, mint, signer)
			let count = await nftContract.balanceOf(walletAddress)
			let  tokenlist = [];
			for (let  i = 0; i < Number(count); i++) {
			  let token = await nftContract.tokenOfOwnerByIndex(walletAddress, i);
	
			  const metadataURI = await nftContract.tokenURI(Number(token))
			  const fetchURI = "https://ipfs.io/"+metadataURI.split(":")[0]+'/'+metadataURI.split(":")[1].split("//")[1]
			  axios
				.get(fetchURI)
				.then(data => {
					let nftData = data.data
					tokenlist.push(nftData)
				})
				.catch(error => console.log(error));
			}
			setOwnToken(tokenlist)
		} catch (error) {
			alert("error in getNFT")
		}
		SetIsNFTLoading(false)
	}

	const stakeNFT = async(tokenID) => {
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			const nftContract = new ethers.Contract(address, mint, signer)
			const tn = await nftContract.approve(stakingAddress,Number(tokenID)-1)
			let receipt = await tn.wait();
			if(receipt!=null){
				let tokenlist = []
				tokenlist.push(Number(tokenID)-1)
				let tx = await stakingContract.deposit(tokenlist)
				receipt = await tx.wait();
				if(receipt!=null){
					getNFT()
					getStakedNFT()
				}
			}

		} catch (error) {
			alert("staking nft error")
		}
	}

	const unStakeNFT = async(tokenID) => {
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			let tokenlist = []

			tokenlist.push(Number(tokenID)-1)
			let tx = await stakingContract.withdraw(tokenlist)
			let receipt = await tx.wait();
			if(receipt!=null){
				getNFT()
				getStakedNFT()
			}

		} catch (error) {
			alert("unskaking error")
		}
	}

	const getStakedNFT = async() =>{
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			let count = await stakingContract.depositsOf(walletAddress)
			let tokenlist = []
			count.map((item_count) =>{
				tokenlist.push(Number(item_count))	
			})
			setOwnStakedToken(tokenlist)
		} catch (error) {
			alert("error in getStakedNFT")
		}
	}

	const claim = async() => {
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			const tokenContract = new ethers.Contract(tokenContractAddress, token,signer)
			const beforeBalance = await tokenContract.balanceOf(walletAddress)

			let tx = await stakingContract.claimRewards(ownStakedToken)
			let receipt = await tx.wait();

			if(receipt!=null){
				const afterBalance = await tokenContract.balanceOf(walletAddress)
				alert((BigNumber.from(afterBalance)-BigNumber.from(beforeBalance))/Math.pow(10,18) + "token was claimed")
			}

		} catch (error) {
			alert("error in claim")
		}
	}

	const getInfo = async() => {
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			let per_earning = await stakingContract.rate()
			per_earning = per_earning/Math.pow(10,18)*6000
			let total_earning  = 0
			const total_earning_Tx = await stakingContract.calculateRewards(walletAddress,ownStakedToken)
			total_earning_Tx.map((item) => {
				total_earning += item/Math.pow(10,18)
			})
			const count_stakedToken = ownStakedToken.length
			const count_unStakedToken = ownToken.length
			let statsOfNFT = []
			statsOfNFT.push({title:"Staking Power",value:per_earning,descUp: "xSCALE",descDown: "per day"})
			statsOfNFT.push({title:"Total Earning",value:total_earning.toFixed("1"),descUp: "xSCALE",descDown: "Last Update"})
			statsOfNFT.push({title:"Hold NFT",value:count_unStakedToken,descUp: "Dragon",descDown: "Wallet"})
			statsOfNFT.push({title:"Staked NFT",value:count_stakedToken,descUp: "Dragon",descDown: "Contract"})
			setStats(statsOfNFT)

		} catch (error) {
			alert("getting info error")
			console.log(error)
		}
	}

	const Header = () =>{
		return(		
		<header className="has-background-black-bis">
			<div className="container is-max-wide pt-4 pb-4 is-flex is-align-items-center is-justify-content-space-between">
				<h1 className="title has-text-white is-6 m-0 is-uppercase">My Collection</h1>
				<div>
					<button className="button is-success is-small is-rounded mr-3" onClick={()=>claim()}>
						<FontAwesomeIcon icon={faCoins} className={"mr-2"} />
						Claim
					</button>
					<button className="button is-danger is-small is-rounded" onClick={()=>disconnect()}>
						{/* <FontAwesomeIcon icon={faWallet} className={"mr-2"} /> */}
						Disconnect
					</button>
				</div>
			</div>
		</header>
		);
	}

	const Status = () =>{
		return(
			<section className="border-bottom">
				<div className="container is-max-wide">
					<div className="columns is-multiline is-mobile">

						{stats.map((stat, index) => (

							<div key={index} className="column is-half-mobile is-one-quarter-desktop">
								<StakeStat title={stat.title} value={stat.value} descUp={stat.descUp} descDown={stat.descDown} />
							</div>
						))}

					</div>
				</div>
			</section>
		);
	}

	const NotStakedItem = () =>{
		if(isNFTLoading){
			return(
				<section className="border-bottom" >
					<div className="container is-max-wide loading_center">
						<header className="mb-5 is-flex is-align-items-center is-justify-content-space-between">
							<h2 className="title has-text-white is-4 is-uppercase mb-0">Not Staked</h2>
							<button className="button is-white is-small is-rounded">Select Multiple</button>
						</header>
						<LoadingIndicator/>
					</div>
				</section>
			);
		} else{
			return(
				<section className="border-bottom">
					<div className="container is-max-wide">
						<header className="mb-5 is-flex is-align-items-center is-justify-content-space-between">
							<h2 className="title has-text-white is-4 is-uppercase mb-0">Not Staked</h2>
							<button className="button is-white is-small is-rounded">Select Multiple</button>
						</header>
	
						<Swiper
							modules={[Navigation]}
							navigation={{
								prevEl: '.prev',
								nextEl: '.next',
							}}
							slidesPerView={3}
							spaceBetween={8}
							breakpoints={{
								500: {
									slidesPerView: 4,
									spaceBetween: 16,
								},
								768: {
									slidesPerView: 5,
									spaceBetween: 16,
								},
								1024: {
									slidesPerView: 6,
									spaceBetween: 16,
								},
							}}
							>
	
							{ownToken.map((nft, index) => (
								<SwiperSlide key={index}>
									<StakeCard title={`${nft.edition}`} image={`${nft.edition}`} stakeNFT={stakeNFT}/>
								</SwiperSlide>
							))}
							
						</Swiper>
	
						<footer className="has-text-centered pt-5">
							<div className="prev button is-white is-outlined is-rounded mr-2"><FontAwesomeIcon icon={faLongArrowLeft} /></div>
							<div className="next button is-white is-outlined is-rounded ml-2"><FontAwesomeIcon icon={faLongArrowRight} /></div>
						</footer>
					</div>
				</section>
			);
		}

	}

	const StakedItem = () => {
		
		return(
			<section className="border-bottom">
				<div className="container is-max-wide">
					<header className="mb-5 is-flex is-align-items-center is-justify-content-space-between">
						<h2 className="title has-text-white is-4 is-uppercase mb-0">Staked</h2>
						<button className="button is-white is-small is-rounded">Select Multiple</button>
					</header>

					<div className="columns is-multiline is-mobile">
						{ownStakedToken.map((stakedNFT, index) => (
							<div key={index} className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen">
								<StakedCard title={`${Number(stakedNFT)+1}`} image={`${Number(stakedNFT)+1}`} unStakeNFT={unStakeNFT} />
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	const ConnectWallet = () =>{
		return(
			<section>
				<div className="container">
					<div className="column is-half">
						<div className="box is-flex">
							<button className="button is-primary is-rounded" onClick={()=>connect()}>
								<FontAwesomeIcon icon={faWallet} className={"mr-2"} />
								Connect Wallet
							</button>
						</div>
					</div>
				</div>
			</section>
		);
	}
	useEffect(()=>{
		connect()
	},[])

	useEffect(()=>{
		if(walletAddress){
			getNFT()
			getStakedNFT()
		}
	},[walletAddress])

	useEffect(()=>{
			getInfo()
	},[ownStakedToken,ownToken])

    return (
		<>
			<Head>
				<title>Stake NFT | Powerful Dragons</title>
				<meta name="keywords" content="nft, fantom" />
			</Head>
			{walletAddress?			
			<>
			<Header/>
			<Status/>
			<NotStakedItem/>
			<StakedItem/>
			</>:
			<ConnectWallet/>}
		</>
     );
}
 
export default Stake;