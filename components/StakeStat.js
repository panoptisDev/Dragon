import styles from "../styles/Stake.module.scss";

const StakeStat = (props) => {
    return ( 
        <div className="box pl-4 pr-4 pb-4">
            <h5 className="has-text-primary mb-0 is-flex is-align-items-center">
                <span className={`${styles.value} is-size-4 is-size-3-tablet`}>{props.value}</span>
                <span className={`${styles.desc} is-size-7 is-size-6-tablet is-hidden-mobile`}>
                    {props.descUp} <br/> {props.descDown}
                </span>
            </h5>
            <h6 className={styles.title}>{props.title}</h6>
        </div>
    );
}

export default StakeStat;