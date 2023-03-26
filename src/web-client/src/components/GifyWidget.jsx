import { useState, useEffect } from "react";
import axios from '../axios/axios';

function GifyWidget(props) {
	const [gifs, setGifs] = useState([]);
	const [hours, minutes, seconds] = props.timer.split(':');
	const refreshTimer = ((parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * 60 + parseInt(seconds, 10)) * 1000;

	const requestData = async () => {
		try {
			const resp = await axios.get(props.url);
			console.log(resp.data)
			setGifs(resp.data.data);
		} catch(err) {
			console.log('[ERROR]: could not request News API');
		}
	};

	useEffect(() => {
		requestData();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			requestData();
		}, refreshTimer);
		return () => clearInterval(interval)
	}, []);

	return (
		<div>
			{
				gifs.map(gif => <img src={gif.images.fixed_height.url} alt={gif.type}/>)
			}
		</div>
	);
}

export default GifyWidget;