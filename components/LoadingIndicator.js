

const LoadingIndicator = () => {
	return (
		<div className="load is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
			<figure className="image is-96x96 mb-3">
				<img className="loadAnimation is-rounded" src="/loader.gif" />
			</figure>
			<strong className="has-text-primary">Fetching data from blockchain!</strong>
			<small className="has-text-grey">Congestion may slow loading times.</small>
		</div>
	);
};

export default LoadingIndicator;
