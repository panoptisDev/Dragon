import Image from "next/image";
import styles from "../styles/Stake.module.scss";
import { useEffect, useState } from 'react'

const StakedCard = (props) => {
    const [status, setStatus] = useState(false)
    useEffect(()=>{
        props.withdrawTokenList.map(item=>{
            if(Number(item) == Number(props.image)-1){
                setStatus(true)
            }
        })
    },[props])
    return ( 
        <div className={`${styles.stakeCard} ${styles.isStaked} has-text-centered`}>
            <h4 className="title is-6 mb-3">PWD#{props.title}</h4>
            {status?
                <input value={props.image} checked type="checkbox" onChange={props.onClickStakeNFT} />
                :
                <input value={props.image} type="checkbox" onChange={props.onClickStakeNFT} />
            }
            {/* <Image className={styles.image} src="/images/nft.png" width={200} height={240} layout="responsive" alt={"Powerful Dragon #1"} /> */}
            <Image className={styles.image} src={`https://gate.powerfuldragons.com/ipfs/QmVwbZacJv9hkov98YQnW6ZrHRcfH6VkhCTibqGH2Vr2Ji/${props.image}.png`} width={200} height={240} layout="responsive" alt={"Powerful Dragon #1"} />
            <div className={`${styles.reward} is-flex is-align-item-center is-justify-content-center mt-4`}>
                <Image src="/silver.png" width={23} height={23} />
                <span className="ml-2">4.8 / day</span>
            </div>
            <button className="button is-dark is-small is-rounded mt-4" onClick={()=>props.unStakeNFT([Number(props.image)-1])}>Untake</button>
        </div>
     );
}
 
export default StakedCard;