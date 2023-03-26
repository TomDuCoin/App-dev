import { useRef, useState, useEffect } from 'react';
import { Row, Col, Button} from 'react-bootstrap';
import MuiButton from '@mui/material/Button';
import Container from "react-bootstrap/esm/Container";
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios/axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import getUuid from 'uuid-by-string';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Alert from 'react-bootstrap/Alert';
import { encode } from 'base-64';
import GoogleIcon from '@mui/icons-material/Google';


function Login() {
	const navigate = useNavigate();
	const formSchema = Yup.object().shape({
		email: Yup.string()
			.required('You need to provide your email'),
		password: Yup.string()
			.required('You need to provide a password')
	})
	const formOptions = { resolver: yupResolver(formSchema) }
	const { register, formState, handleSubmit } = useForm(formOptions)
	const { errors } = formState
	const [, setToken] = useLocalStorage('token', undefined);
	const [, setId] = useLocalStorage('id', undefined);
	const [, setName] = useLocalStorage('name', '');
	const errRef = useRef();

	const [errMsg, setErrMsg] = useState('');

	useEffect(() => {
		setErrMsg('');
	}, [])

	const submitHandler = async (data) => {
		const id = getUuid(data.email);
		const creds = encode(`${data.email}:${data.password}`);
		try {
			const resp = await axios.get(process.env.REACT_APP_SERVER_API_URL + '/users',
				{ params: { login: id }, headers: {'Authorization': `Basic ${creds}`}}
			);
			setToken(creds);
			setId(id);
			setName(resp.data.name);
			navigate('/');
		} catch (err) {
			if (!err?.response) {
				setErrMsg('No Server Response');
			} else if (err.response?.status === 400) {
				setErrMsg('Missing from field');
			} else if (err.response?.status === 401) {
				setErrMsg('User unkown');
			} else {
				setErrMsg('Login Failed');
			}
			errRef.current?.focus();
		}
	}
	return (
		<Container style={{ 'width': '550px' }}>
			<h1 style={{ textAlign: 'center', marginTop: '5%', fontWeight: 'bold' }}>Login</h1>

			<Form style={{ marginTop: '15%' }} onSubmit={handleSubmit(submitHandler)}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						placeholder="Enter email"
						{...register('email')}
						className={`form-control ${errors.email ? 'is-invalid' : ''}`}
					/>
					<div className="invalid-feedback">{errors.email?.message}</div>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Password"
						{...register('password')}
						className={`form-control ${errors.password ? 'is-invalid' : ''}`}
					/>
					<div className="invalid-feedback">{errors.password?.message}</div>
				</Form.Group>

				<div className="text-center" style={{ marginTop: '5%' }}>
					<Link to='/signup' style={{ fontSize: 14, textDecoration: 'none' }}>
						You don't have an account ?
					</Link>

				</div>
				<div className="text-center">
					<Button variant="primary" type="submit" style={{ marginTop: '3%' }}>
						Submit
					</Button>
				</div>
				<div style={{ marginTop: '5%' }}>
					{errMsg ? <Alert variant='danger' style={{ textAlign: 'center' }}>{errMsg}</Alert> : <></>}
				</div>
			</Form>
			<hr style={{ marginTop: '7%' }}></hr>
			<div style={{textAlign: 'center'}}>
				<a href='https://accounts.google.com/o/oauth2/v2/auth?client_id=768406115980-qjdk8o738cfui43s3lggdmg17mf5pj7f.apps.googleusercontent.com&redirect_uri=http://localhost:3000/redirect_oauth&response_type=code&scope=email+profile&access_type=offline'>
					<MuiButton variant='contained' endIcon={<GoogleIcon/>}>
						Connect with Google
					</MuiButton>
				</a>
			</div>
		</Container>
	)
}

export default Login;