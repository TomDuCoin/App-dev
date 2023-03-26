import { useState, useEffect } from 'react';
import axios from '../axios/axios';
import { Card } from 'react-bootstrap';

function FormulaOneWidget(props) {
	const [teams, setTeams] = useState([]);
	const [hours, minutes, seconds] = props.timer.split(':');
	const refreshTimer = ((parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * 60 + parseInt(seconds, 10)) * 1000;

	const requestData = async () => {
		try {
			const resp = await axios.get(props.url,
				{headers: {
					"x-rapidapi-host": "api-formula-1.p.rapidapi.com",
					"x-rapidapi-key": "33308f8f2cd994c9b70c67543daa8520"
				}}
				);
			setTeams(resp.data);
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
		teams.map(team =>
			<Card style={{marginTop: '10px'}}>
			<Card.Img variant='top' src={team.urlToImage}/>
			<Card.Body>
				<Card.Title>{headline.title}</Card.Title>
				<Card.Text>
					{headline.content}
				</Card.Text>
			</Card.Body>
		</Card>
			)
	);
}