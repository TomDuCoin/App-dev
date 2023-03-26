import {useState, useEffect } from 'react';
import axios from "../axios/axios";
import { Card } from 'react-bootstrap';


function NewsApiWidget(props) {
	const [headlines, setHeadlines] = useState([]);
	const [hours, minutes, seconds] = props.timer.split(':');
	const refreshTimer = ((parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * 60 + parseInt(seconds, 10)) * 1000;

	const requestData = async () => {
		try {
			const resp = await axios.get(props.url);
			console.log(headlines);
			setHeadlines(resp.data.articles);
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
			headlines.map(headline =>
				<Card style={{marginTop: '10px'}}>
					<Card.Img variant='top' src={headline.urlToImage}/>
					<Card.Body>
						<Card.Title>{headline.title}</Card.Title>
						<Card.Text>
							{headline.content}
						</Card.Text>
					</Card.Body>
				</Card>
			)}
		</div>
	);
}

export default NewsApiWidget;