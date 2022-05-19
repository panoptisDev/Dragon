import Head from 'next/head'
import {useState, useEffect} from 'react'
import Image from "next/image";
// Components
import StakeCard from '../components/StakeCard'
import StakedCard from '../components/StakedCard'
import StakeStat from '../components/StakeStat'
import LoadingIndicator from '../components/LoadingIndicator'
import Modal from '../components/Modal'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faCoins, faLongArrowLeft, faLongArrowRight, faL } from '@fortawesome/free-solid-svg-icons'

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

const address = "0xDDfB8dB393165c3D8562178Ea29c23b2cde85D24"
const stakingAddress = "0xa1715189d2E7FF528D09a7dCc84171e74Bc3Af6D"
const tokenContractAddress = "0x61E828eb964cFb6Db92BE47fa9Db0e00942B40bE"

import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify'

const providerOptions = {
	// coinbasewallet: {
	// 	package: CoinbaseWalletSDK, 
	// 	options: {
	// 	appName: "Web 3 Modal Demo",
	// 	infuraId: "https://rinkeby.infura.io/v3/12a4aa4f06fe4bc7b5d50d73da475e2a" 
	// 	}
	// },
	walletconnect: {
		package: WalletConnect, 
		options: {
		infuraId: "https://rinkeby.infura.io/v3/12a4aa4f06fe4bc7b5d50d73da475e2a"
		}
	}
};


const Stake = () => {
	const [walletAddress, setWalletAddress] = useState(null)
	const [isNFTLoading, SetIsNFTLoading] = useState(false)
	const [ownToken, setOwnToken] = useState([])
	const [isNFTUnstaking, setIsNFTUnstaking] = useState(false)
	const [isNFTStaking, setIsNFTStaking] = useState(false)
	const [isNFTApproving, setIsNFTApproving] = useState(false)
	const [isClaiming, setIsClaiming] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)


	const [isCheckedForUnstaking,setIsCheckedForUnstaking] = useState(false)
	const [isCheckedForStaking,setIsCheckedForStaking] = useState(false)



	const [ownStakedToken, setOwnStakedToken] = useState([])
	const [stats, setStats] = useState([])
	const [provider, setProvider] = useState();
	const [library, setLibrary] = useState();
	const [network, setNetwork] = useState();
	const [stakingTokenList, setStakingTokenList] = useState([])
	const [withdrawTokenList, setWithdrawTokenList] = useState([])

	const connect = async() =>{
		try {
			const web3Modal = new Web3Modal({
				providerOptions // required
			});
			const provider = await web3Modal.connect();
			const library = new ethers.providers.Web3Provider(provider);
			const accounts = await library.listAccounts();
			const network = await library.getNetwork();
			init_Status()

			setProvider(provider);
			setLibrary(library);
			if (accounts) 
				setWalletAddress(accounts[0]);
			setNetwork(network);
			if(network.chainId==4){
				// getNFT()
				// getStakedNFT()
			} else{
				errorToast("Please choose rinkeby")
			}
			
		  } catch (error) {
			console.error(error);
		  }

	}

	const errorToast = (error) =>{
		toast.error(error,{
		  position: toast.POSITION.BOTTOM_RIGHT,
		  autoClose: 3000,
		  transition: Slide
		})
	}

	const init_Status = () => {
		let statsOfNFT = []
		statsOfNFT.push({title:"Staking Power",value:0,descUp: "xSCALE",descDown: "per day"})
		statsOfNFT.push({title:"Total Earning",value:0,descUp: "xSCALE",descDown: "Last Update"})
		statsOfNFT.push({title:"Hold NFT",value:0,descUp: "Dragon",descDown: "Wallet"})
		statsOfNFT.push({title:"Staked NFT",value:0,descUp: "Dragon",descDown: "Contract"})
		setStats(statsOfNFT)
	}
	
	const disconnect = async() =>{
		setWalletAddress(null)
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
			errorToast("error in getNFT")
		}
		SetIsNFTLoading(false)
	}

	const onClickUnstakeNFT = (e) => {
		let tokenID = e.target.value
		let checked = e.target.checked
		let tokenlist = []
		let flag = true
		stakingTokenList.map((item)=>{
			if(item==Number(tokenID)-1){
				flag = false
			} else {
				tokenlist.push(item)
			}
		})
		if (flag){
			tokenlist.push(Number(tokenID)-1)
		}
		setStakingTokenList(tokenlist)
	}
	const onClickStakeNFT = (e) => {
		let tokenID = e.target.value
		let checked = e.target.checked
		let tokenlist = []
		let flag = true
		withdrawTokenList.map((item)=>{
			if(item==Number(tokenID)-1){
				flag = false
			} else {
				tokenlist.push(item)
			}
		})
		if (flag){
			tokenlist.push(Number(tokenID)-1)
		}
		setWithdrawTokenList(tokenlist)
	}

	const setAllNFTForStaking = (e) =>{
		let checked = e.target.checked
		let tokenList = []
		if(checked){
			ownToken.map((token)=>{
				tokenList.push(Number(token.edition)-1)
			})
			setIsCheckedForStaking(true)
		} else{
			setIsCheckedForStaking(false)
		}
		
		setStakingTokenList(tokenList)
	}

	const setAllNFTForUnStaking = (e) =>{
		let checked = e.target.checked
		let tokenList = []

		if(checked){
			tokenList = ownStakedToken
			setIsCheckedForUnstaking(true)
		} else{
			setIsCheckedForUnstaking(false)
		}

		setWithdrawTokenList(tokenList)
	}

	const stakeNFT = async(tokenID) => {
		try {
			setIsNFTApproving(true)
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			const nftContract = new ethers.Contract(address, mint, signer)
			const tx = await nftContract.approve(stakingAddress,tokenID)
			let receipt = await tx.wait();
			if(receipt!=null){
				setIsNFTApproving(false)
				setIsNFTStaking(true)
				try {
					let tx = await stakingContract.deposit([tokenID])
					receipt = await tx.wait();
					if(receipt!=null){
						getNFT()
						getStakedNFT()
						setIsProcessing(true)
					}
				} catch (error) {
					setIsProcessing(false)
				}
				setIsNFTStaking(false)
			}

		} catch (error) {
			setIsNFTApproving(false)
			setIsProcessing(false)
			// errorToast("staking nft error")
		}
	}

	const multiStaking = async() =>{
		try {
			setIsNFTApproving(true)
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)
			const nftContract = new ethers.Contract(address, mint, signer)
			let tx = await nftContract.setApprovalForAll(stakingAddress,true)
			let receipt = await tx.wait();
			if(receipt!=null){
				setIsNFTApproving(false)
				setIsNFTStaking(true)
				try {
					tx = await stakingContract.deposit(stakingTokenList)
					receipt = await tx.wait();
					if(receipt!=null){
						getNFT()
						getStakedNFT()
						setIsProcessing(true)
					}
				} catch (error) {
					setIsProcessing(false)
				}
				setIsNFTStaking(false)
			}

		} catch (error) {
			setIsNFTApproving(false)
			setIsProcessing(false)
		}
	}

	const unStakeNFT = async(tokenlist) => {
		setIsNFTUnstaking(true)
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const stakingContract = new ethers.Contract(stakingAddress, staking, signer)

			let tx = await stakingContract.withdraw(tokenlist)
			let receipt = await tx.wait();
			if(receipt!=null){
				getNFT()
				getStakedNFT()
				setIsProcessing(true)
			}
		} catch (error) {
			// errorToast("unskaking error")
			setIsProcessing(false)
		}
		setIsNFTUnstaking(false)
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
			errorToast("error in getStakedNFT")
		}
	}

	const claim = async() => {
		setIsClaiming(true)
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
				setIsProcessing(true)
				getInfo()
				// alert((BigNumber.from(afterBalance)-BigNumber.from(beforeBalance))/Math.pow(10,18) + "token was claimed")
			}
		} catch (error) {
			// errorToast("error in claim")
			setIsProcessing(false)

		}
		setIsClaiming(false)
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
			statsOfNFT.push({title:"Staking Power",value:(Number(per_earning) * Number(count_stakedToken)).toFixed("1"),descUp: "xSCALE",descDown: "per day"})
			statsOfNFT.push({title:"Total Earning",value:total_earning.toFixed("1"),descUp: "xSCALE",descDown: "Last Update"})
			statsOfNFT.push({title:"Hold NFT",value:count_unStakedToken,descUp: "Dragon",descDown: "Wallet"})
			statsOfNFT.push({title:"Staked NFT",value:count_stakedToken,descUp: "Dragon",descDown: "Contract"})
			setStats(statsOfNFT)

		} catch (error) {
			errorToast("getting info error")
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
						<FontAwesomeIcon icon={faWallet} className={"mr-2"} />
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
							<div className='is-flex is-align-items-center'>
								{isCheckedForStaking?
									<input  type="checkbox" className='mr-4' checked onChange={setAllNFTForStaking}/>
									:
									<input  type="checkbox" className='mr-4' onChange={setAllNFTForStaking}/>
								}
								
								<h2 className="title has-text-white is-4 is-uppercase mb-0">Not Staked</h2>
							</div>
							<button className="button is-white is-small is-rounded" disabled>Multi Staking</button>
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
							<div className='is-flex is-align-items-center'>
								{isCheckedForStaking?
									<input  type="checkbox" className='mr-4' checked onChange={setAllNFTForStaking}/>
									:
									<input  type="checkbox" className='mr-4' onChange={setAllNFTForStaking}/>
								}
								<h2 className="title has-text-white is-4 is-uppercase mb-0">Not Staked</h2>
							</div>
							{stakingTokenList.length==0?
								<button disabled className="button is-white is-small is-rounded" onClick={()=>multiStaking()}>Multi Staking</button>
								:
								<button  className="button is-white is-small is-rounded" onClick={()=>multiStaking()}>Multi Staking</button>					
							}
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
									<StakeCard title={`${nft.edition}`} image={`${nft.edition}`} onClickUnstakeNFT={onClickUnstakeNFT} stakeNFT={stakeNFT} stakingTokenList={stakingTokenList}/>
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
						<div className='is-flex is-align-items-center'>
							{isCheckedForUnstaking?
								<input  type="checkbox" className='mr-4' checked onChange={setAllNFTForUnStaking}/>
								:
								<input  type="checkbox" className='mr-4' onChange={setAllNFTForUnStaking}/>
							}
							<h2 className="title has-text-white is-4 is-uppercase mb-0">Staked</h2>
						</div>
						{withdrawTokenList.length==0?
							<button disabled className="button is-white is-small is-rounded" onClick={()=>unStakeNFT(withdrawTokenList)}>Multi withdraw</button>
							:
							<button className="button is-white is-small is-rounded" onClick={()=>unStakeNFT(withdrawTokenList)}>Multi withdraw</button>
						}
					</header>

					<div className="columns is-multiline is-mobile">
						{ownStakedToken.map((stakedNFT, index) => (
							<div key={index} className="column is-half-mobile is-one-third-tablet is-one-quarter-desktop is-one-fifth-widescreen">
								<StakedCard title={`${Number(stakedNFT)+1}`} image={`${Number(stakedNFT)+1}`} unStakeNFT={unStakeNFT} onClickStakeNFT={onClickStakeNFT} withdrawTokenList={withdrawTokenList} />
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
		if(walletAddress!=null){
			getNFT()
			getStakedNFT()
		}
	},[walletAddress])

	useEffect(()=>{
		if(walletAddress!=null){
			getInfo()
		}
	},[ownStakedToken,ownToken])


    return (
		<>
			<Head>
				<title>Stake NFT | Powerful Dragons</title>
				<meta name="keywords" content="nft, fantom" />
			</Head>
			<ToastContainer />
			
			{walletAddress?			
				<>
					<Header/>
					<Status/>
					<NotStakedItem/>
					<StakedItem/>
				</>:
				<ConnectWallet/>
			}
			<div id="modal-root"></div>
			<Modal
				isNFTUnstaking={isNFTUnstaking}
				isNFTApproving={isNFTApproving}
				isNFTStaking={isNFTStaking}
				isClaiming={isClaiming}
				isProcessing={isProcessing}
			/>
		</>
     );
}
 
export default Stake;