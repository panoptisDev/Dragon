import Image from "next/image"
import styles from "../styles/Stake.module.scss"
import { useEffect, useState } from 'react'


const StakeCard = (props) => {
    const [status, setStatus] = useState(false)
    useEffect(()=>{
        props.stakingTokenList.map(item=>{
            if(Number(item) == Number(props.image)-1){
                setStatus(true)
            }
        })

    },[props])

    return ( 
        <div className={`${styles.stakeCard} has-text-centered`}>
            <h4 className="title is-6 has-text-white mb-3">PWD#{props.title}</h4>
            {status?
                <input value={props.image} checked type="checkbox" onChange={props.onClickUnstakeNFT} />
                :
                <input value={props.image} type="checkbox" onChange={props.onClickUnstakeNFT} />
            }
            {/* <Image className={styles.image} src="/images/nft.png" width={200} height={240} layout="responsive" alt={"Powerful Dragon #1"} /> */}
            <Image className={styles.image} src={`https://gate.powerfuldragons.com/ipfs/QmVwbZacJv9hkov98YQnW6ZrHRcfH6VkhCTibqGH2Vr2Ji/${props.image}.png`} width={240} height={300} layout="responsive" alt={"Powerful Dragon #1"} />
            <button className="button is-primary is-small is-rounded mt-4" onClick={() => props.stakeNFT(Number(props.image)-1)}>Stake</button>
        </div>
     );
}
 
export default StakeCard;