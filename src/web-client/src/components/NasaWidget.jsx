import { useState, useEffect } from 'react';
import axios from '../axios/axios';
import { Card } from 'react-bootstrap';

function NasaWidget(props) {
	const [photos, setPhotos] = useState([]);
	const [hours, minutes, seconds] = props.timer.split(':');
	const refreshTimer = ((parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * 60 + parseInt(seconds, 10)) * 1000;

	const requestData = async () => {
		try {
			const resp = await axios.get(props.url);
			setPhotos(resp.data);
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
				photos.map(photo =>
					<Card style={{marginTop: '10px'}}>
						<Card.Img variant='top' src={photo.url}/>
						<Card.Body>
							<Card.Title>{photo.title}</Card.Title>
							<Card.Text>
								{photo.explanation}
							</Card.Text>
						</Card.Body>
					</Card>
				)
			}
		</div>
	);
}

export default NasaWidget;