import { useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import axios from '../axios/axios';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';

function Redirect() {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const [, setToken] = useLocalStorage('token', null);
	const [, setName] = useLocalStorage('name', '');
	const [, setId] = useLocalStorage('id', undefined);
	const navigate = useNavigate();

	const sendCodeToken = async () => {
		const json = JSON.stringify({code: searchParams.get('code')});

		try {
			const resp = await axios.post(process.env.REACT_APP_SERVER_API_URL + '/oauth/google',
			json,
			{
				headers: { 'Content-Type': 'application/json'},
			}
			)
			console.log(resp);
			setToken(resp.data.creds);
			setName(resp.data.name);
			setId(resp.data._id);
			navigate('/');
		} catch (err) {
			console.log(err);
			return;
		}
	};

	useEffect(() => {
		sendCodeToken();
	}, [])

	return (
		<div style={{
			position: 'relative'
			}}>
			<Spinner animation="border" style={{position: 'absolute', top: '50vh', left: '50%'}}/>
		</div>
	);
}

export default Redirect;