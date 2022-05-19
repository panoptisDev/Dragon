import Head from 'next/head'
import {useState, useEffect} from 'react'
import Image from "next/image";

// CSS
import styles from "../styles/Stake.module.scss"

// Components
import StakeCard from '../components/StakeCard'
import StakedCard from '../components/StakedCard'
import StakeStat from '../components/StakeStat'
import LoadingIndicator from '../components/LoadingIndicator'
import Modal from '../components/Modal'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faCoins, faLongArrowLeft, faLongArrowRight, faArrowUpRightFromSquare, faPowerOff, faL } from '@fortawesome/free-solid-svg-icons'

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
	const [tmpOwnToken, setTempOwnToken] = useState([])
	const [countOfOwnNFT, setCountOwnNFT] = useState(0)

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
		statsOfNFT.push({title:"Not Staked",value:0,descUp: "Fetching...",descDown: null})
		statsOfNFT.push({title:"Staked",value:0,descUp: "Fetching...",descDown: null})
		statsOfNFT.push({title:"Staking Power",value:0,descUp: "Fetching...",descDown: null})
		statsOfNFT.push({title:"Total Rewards",value:0,descUp: "Fetching...",descDown: null})
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

			  const fetchURI = "https://ipfs.thirdweb.com/"+metadataURI.split(":")[0]+'/'+metadataURI.split(":")[1].split("//")[1]
			  axios
				.get(fetchURI)
				.then(data => {
					let nftData = data.data
					tokenlist.push(nftData)
					if(i==Number(count))
						setTempOwnToken(tokenlist)
				})
				.catch(error => console.log(error));
			  
			}
			setCountOwnNFT(Number(count))
		} catch (error) {
			errorToast("error in getNFT")
		}
		SetIsNFTLoading(false)
	}

	const sortNFT = () =>{
		let min_idx = 0;
		for (let i = 0; i <  tmpOwnToken.length-1; i++)
		{
			// Find the minimum element in unsorted array
			min_idx = i;
			for (let j = i + 1; j <  tmpOwnToken.length; j++)
			{	
				if (Number(tmpOwnToken[j].edition) < Number(tmpOwnToken[min_idx].edition))
				{
					min_idx = j;
				}
			}	
			// Swap the found minimum element with the first element
			let  temp = tmpOwnToken[min_idx];
			tmpOwnToken[min_idx] = tmpOwnToken[i];
			tmpOwnToken[i] = temp;
		}
		setOwnToken(tmpOwnToken)
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
			let min_idx = 0;

			for (let i = 0; i < tokenlist.length-1; i++)
			{
				// Find the minimum element in unsorted array
				min_idx = i;
				for (let j = i + 1; j < tokenlist.length; j++)
				{	
					if (Number(tokenlist[j]) < Number(tokenlist[min_idx]))
					{
						min_idx = j;
					}
				}	
				// Swap the found minimum element with the first element
				let  temp = tokenlist[min_idx];
				tokenlist[min_idx] = tokenlist[i];
				tokenlist[i] = temp;
			}
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
			statsOfNFT.push({title:"Not Staked",value:count_unStakedToken,descUp: "Dragons",descDown: null})
			statsOfNFT.push({title:"Staked",value:count_stakedToken,descUp: "Dragons",descDown: null})
			statsOfNFT.push({title:"Staking Power",value:(Number(per_earning) * Number(count_stakedToken)).toFixed("1"),descUp: "/ day",descDown: null})
			statsOfNFT.push({title:"Total Rewards",value:total_earning.toFixed("1"),descUp: "xSCALES",descDown: null})
			setStats(statsOfNFT)

		} catch (error) {
			errorToast("getting info error")
		}
	}

	const Header = () =>{
		return(
			<header className="has-background-black-bis">
				<div className="container is-max-wide pt-4 pb-4 is-flex is-align-items-center is-justify-content-space-between">
					<h1 className="title has-text-white is-6 m-0 is-uppercase">My Dragons</h1>
					<div>
						<button className="button is-success is-small is-rounded mr-3" onClick={()=>claim()}>
							<FontAwesomeIcon icon={faCoins} className={"mr-2"} />
							Claim Rewards
						</button>
						<button className="button is-danger is-small is-rounded" onClick={()=>disconnect()}>
							<FontAwesomeIcon icon={faPowerOff} style={{paddingTop: '3px', paddingBottom: '3px'}} />
							<span className="ml-2 is-hidden-mobile">Disconnect</span>
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

							<div key={index} className="column is-half-mobile is-half-tablet is-half-desktop is-one-quarter-fullhd">
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
								<h2 className="title has-text-white  is-size-5-mobile is-size-4-tablet is-uppercase mb-0">Not Staked</h2>
								{/* <label className="checkbox">
									{isCheckedForStaking?
										<input  type="checkbox" className='mr-4' checked onChange={setAllNFTForStaking}/>
										:
										<input  type="checkbox" className='mr-4' onChange={setAllNFTForStaking}/>
									}
									Select All
								</label> */}
							</div>
							{/* <button className="button is-white is-small is-rounded" disabled>Stake Multiple</button> */}
						</header>
						
						<div className="load is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
							<figure className="image is-96x96 mb-3">
								<img className="loadAnimation is-rounded" src="/loader.gif" />
							</figure>
							<strong className="has-text-primary">Fetching data from blockchain!</strong>
							<small className="has-text-grey">Congestion may slow down loading time.</small>
						</div>
					</div>
				</section>
			);
		} else{
			return(
				<section className="border-bottom">
					<div className="container is-max-wide">
						<header className="mb-5 is-flex is-align-items-center is-justify-content-space-between">
							<div className='is-flex is-align-items-center mr-auto'>
								<h2 className="title has-text-white is-size-5-mobile is-size-4-tablet is-uppercase mb-0">Not Staked</h2>
							</div>
							<label className="checkbox has-text-success">
								{isCheckedForStaking?
									<input  type="checkbox" className='mr-4 is-hidden' checked onChange={setAllNFTForStaking}/>
									:
									<input  type="checkbox" className='mr-4 is-hidden' onChange={setAllNFTForStaking}/>
								}
								<span className="mr-4">Select All</span>
							</label>
							{stakingTokenList.length==0?
								<button disabled className="button is-white is-small is-rounded" onClick={()=>multiStaking()}>Stake Multiple</button>
								:
								<button  className="button is-success is-small is-rounded" onClick={()=>multiStaking()}>Stake Multiple {stakingTokenList.length} Dragons</button>					
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
						<h2 className="title has-text-white is-size-5-mobile is-size-4-tablet is-uppercase mb-0 mr-auto">Staked</h2>

						<label className="checkbox has-text-success">
							{isCheckedForUnstaking?
								<input  type="checkbox" className='is-hidden' checked onChange={setAllNFTForUnStaking}/>
								:
								<input  type="checkbox" className='is-hidden' onChange={setAllNFTForUnStaking}/>
							}
							<span className="mr-4">Select All</span>
						</label>

						{withdrawTokenList.length==0?
							<button disabled className="button is-white is-small is-rounded" onClick={()=>unStakeNFT(withdrawTokenList)}>Unstake Multiple</button>
							:
							<button className="button is-success is-small is-rounded" onClick={()=>unStakeNFT(withdrawTokenList)}>Unstake Multiple {withdrawTokenList.length} Dragons</button>
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
			<div className={`${styles.connect} is-flex is-align-items-center is-justify-content-center`}>
				<Image className={styles.cover} src="/banner-stake.jpg" alt="Powerful Dragons Tavern" layout="fill" objectFit="cover" objectPosition="center" />

				<div className={`${styles.container}`}>
					<div className="box boxWithGradient boxLargerBorder boxLessShadow p-5 pt-6 has-text-centered">
						<figure className={styles.silver}>
							<Image src="/silver.png" width={100} height={100} alt={"Silver Scale"} />
						</figure>
						<h1 className="title is-size-3 is-size-2-tablet is-size-1-desktop is-uppercase mt-5 mb-0">Stake Your NFT</h1>
						<h2 className="title is-size-6 is-size-5-tablet is-size-4-desktop has-text-white has-text-weight-light mb-4">
							EARN <span className="has-text-grey-light">xSILVER TOKENS</span> DAILY
						</h2>
						<div className="mb-6">
							<a className="has-text-success" href="#">
								Read Whitepaper
								<FontAwesomeIcon icon={faArrowUpRightFromSquare} className={"ml-2"} />
							</a>
						</div>
						<button className="button is-accent is-rounded mb-2" onClick={()=>connect()}>
							<FontAwesomeIcon icon={faWallet} className={"mr-2"} />
							Connect Wallet
						</button>
					</div>
					<p className="has-text-centered">
						We are on <span className="tag is-info has-text-weight-bold">FANTOM</span>
					</p>
				</div>
			</div>
		);
	}

	useEffect(()=>{
		if(walletAddress!=null){
			getNFT()
			getStakedNFT()
		}
	},[walletAddress])

	useEffect(()=>{

		if(tmpOwnToken.length==countOfOwnNFT&&countOfOwnNFT!=0){
			sortNFT()
		}
	},[tmpOwnToken])

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