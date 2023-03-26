import { useRef, useState, useEffect} from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalStorage } from '../hooks/useLocalStorage';
import * as Yup from 'yup';
import axios from '../axios/axios';
import getUuid from 'uuid-by-string';
import { encode } from 'base-64';
import formatUserName from '../utils/utils';


function Register() {
	const navigate = useNavigate();
	const formSchema = Yup.object().shape({
		lastName: Yup.string()
			.required('Last name is mendatory'),
		firstName: Yup.string()
			.required('First name is mendatory'),
		email: Yup.string()
			.required('Email is mendatory'),
		password: Yup.string()
			.required('Password is mendatory')
			.min(3, 'Password must be at 3 char long'),
		confPassword: Yup.string()
			.required('Please confirm your password')
			.oneOf([Yup.ref('password')], 'Passwords does not match'),
	})
	const formOptions = { resolver: yupResolver(formSchema) }
	const { register, formState, handleSubmit } = useForm(formOptions)
	const { errors } = formState
	const [, setToken] = useLocalStorage('token', null);
	const [, setName] = useLocalStorage('name', '');
	const [, setId] = useLocalStorage('id', undefined);
	const errRef = useRef();

	const [errMsg, setErrMsg] = useState('');

	useEffect(() => {
		setErrMsg('');
	}, [])

	const submitHandler = async (data) => {
		const id = getUuid(data.email);
		const name = formatUserName(data.firstName, data.lastName);
		const json = JSON.stringify({_id: id, name: name, mail: data.email, pwd: data.password});
		const creds = encode(`${data.email}:${data.password}`);
		try {
			await axios.post(process.env.REACT_APP_SERVER_API_URL + '/users', json,
				{
					headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${creds}`},
				}
			)
			setToken(creds);
			setName(name);
			setId(id);
			navigate('/');
		} catch (err) {
			if (!err?.response) {
				setErrMsg('No Server Response');
			} else if (err.response?.status === 400) {
				setErrMsg('Missing form field');
			} else if (err.response?.status === 401) {
				setErrMsg('Unauthorized');
			}  else if (err.response?.status === 403) {
				setErrMsg('User already registered');
			}
			errRef.current?.focus();
		}
	}

	return (
		<Container style={{ 'width': '500px' }}>
			<h1 style={{ textAlign: 'center', marginTop: '5%', fontWeight: 'bold' }}>ZapyTek</h1>

			<Form style={{ marginTop: '10%' }} onSubmit={handleSubmit(submitHandler)}>
				<Row>

					<Col>
						<Form.Group className="mb-3" controlId="formBasicFirstName">
							<Form.Label>First name</Form.Label>
							<Form.Control
								name="firstName"
								type="name"
								placeholder="First name"
								{...register('firstName')}
								className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
							/>
							<div className="invalid-feedback">{errors.firstName?.message}</div>
						</Form.Group>
					</Col>

					<Col>
						<Form.Group className="mb-3" controlId="formBasicLastName">
							<Form.Label>Last name</Form.Label>
							<Form.Control
								name="lastName"
								type="name"
								placeholder="Last name"
								{...register('lastName')}
								className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
							/>
							<div className="invalid-feedback">{errors.lastName?.message}</div>
						</Form.Group>
					</Col>

				</Row>

				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						name="email"
						type="email"
						placeholder="Enter email"
						{...register('email')}
						className={`form-control ${errors.email ? 'is-invalid' : ''}`}
					/>
					<div className="invalid-feedback">{errors.email?.message}</div>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Password</Form.Label>
					<Form.Control
						name="password"
						type="password"
						placeholder="Password"
						{...register('password')}
						className={`form-control ${errors.password ? 'is-invalid' : ''}`}
					/>
					<div className="invalid-feedback">{errors.password?.message}</div>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicPassword">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						name="confPassword"
						type="password"
						placeholder="Confirm password"
						{...register('confPassword')}
						className={`form-control ${errors.confPassword ? 'is-invalid' : ''}`}
					/>
					<div className="invalid-feedback">{errors.confPassword?.message}</div>
				</Form.Group>

				<div className="text-center" style={{ marginTop: '7%' }}>
					<Link to='/login' style={{ fontSize: 14, textDecoration: 'none' }}>
						Already have an account ?
					</Link>
				</div>

				<div className="text-center">
					<Button variant="primary" type="submit" style={{ marginTop: '3%' }}>
						Submit
					</Button>
				</div>
				<div style={{marginTop: '5%'}}>
					{errMsg ? <Alert variant='danger' style={{textAlign: 'center'}}>{errMsg}</Alert> : <></>}
				</div>
			</Form>
		</Container>
	);
}

export default Register;