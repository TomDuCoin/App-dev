import { Form } from "react-bootstrap";
import { useState } from "react";
import { TimePicker } from '@mui/x-date-pickers';
import { Row, Button, Alert } from 'react-bootstrap';
import dayjs from "dayjs";
import { useForm } from 'react-hook-form';
import axios from '../axios/axios';
import { useLocalStorage } from "../hooks/useLocalStorage";

function WidgetSettings(props) {
	const [time, setTime] = useState(dayjs().set('hour', 0).set('minute', 2).set('second', 0));
	const [id] = useLocalStorage('id', undefined);
	const [token] = useLocalStorage('token', undefined);
	let settings = {}
	const { register, formState: { errors }, handleSubmit } = useForm();

	const submitHandler = async (data) => {
		props.widgetPattern["params"].map((param) =>
			param['value'] = data[param.name]
		)
		props.widgetPattern["timer"] = time.format('HH:mm:ss');
		if (props.widgetID === undefined) {
			await axios.post(
				process.env.REACT_APP_SERVER_API_URL + `/dashboards/${props.dashboardID}/widgets`,
				JSON.stringify(props.widgetPattern),
				{ headers: { 'Content-Type': 'application/json', 'X-User-ID': id, 'Authorization': `Basic ${token}` } }
			);
			props.getDashboards();
		} else {
			await axios.put(
				process.env.REACT_APP_SERVER_API_URL + `/dashboards/${props.dashboardID}/widgets/${props.widgetID}`,
				JSON.stringify(props.widgetPattern),
				{ headers: { 'Content-Type': 'application/json', 'X-User-ID': id, 'Authorization': `Basic ${token}` } }
			);
			props.getDashboards();
		}
	};

	const timeTriggerComp = (
		<div style={{ marginTop: "20px" }}>
			<Form.Group>
				<Form.Label>Set widget refresh trigger</Form.Label>
				<Row style={{ marginLeft: "2px" }}>
					<TimePicker
						format="HH:mm:ss"
						ampm={false}
						defaultValue={time}
						onChange={(value) => setTime(value)} />
				</Row>
			</Form.Group>
		</div>
	);
	console.log("name", props.name)
	if (props.name === "headlines") {
		settings = (
			<Form onSubmit={handleSubmit(submitHandler)}>
				<Form.Group>
					<Form.Label>Select a subject</Form.Label>
					<Form.Control
						name="subject"
						placeholder="tesla"
						{...register('subject', { required: true })}
						className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
					></Form.Control>
					{errors.subject && errors.subject.type === "required" && (
						<Alert role="alert" variant="danger" style={{ marginTop: '10px' }}>Subject is required</Alert>
					)}
				</Form.Group>
				<Form.Group>
					<Form.Label>How many headlines do you want to see ?</Form.Label>
					<Form.Control
						name="limit"
						type="number"
						{...register('limit', { required: true })}
						className={`form-control ${errors.limit ? 'is-invalid' : ''}`}
					></Form.Control>
					{errors.limit && errors.limit.type === "required" && (
						<Alert role="alert" variant="danger" style={{ marginTop: '10px' }}>gif limit is required</Alert>
					)}
				</Form.Group>
				{timeTriggerComp}
				<Button variant="primary" type="submit" style={{ marginTop: '30px' }}>
					Submit
				</Button>
			</Form >
		)
	}
	if (props.name === "trending") {
		settings = (
			<Form onSubmit={handleSubmit(submitHandler)}>
				<Form.Group>
					<Form.Label>How many trending gifs do you want to see ?</Form.Label>
					<Form.Control
						name="limit"
						type="number"
						{...register('limit', { required: true })}
						className={`form-control ${errors.limit ? 'is-invalid' : ''}`}
					></Form.Control>
					{errors.limit && errors.limit.type === "required" && (
						<Alert role="alert" variant="danger" style={{ marginTop: '10px' }}>gif limit is required</Alert>
					)}
				</Form.Group>
				{timeTriggerComp}
				<Button variant="primary" type="submit" style={{ marginTop: '30px' }}>
					Submit
				</Button>
			</Form >
		)
	}
	if (props.name === "APOD") {
		settings = (
			<Form onSubmit={handleSubmit(submitHandler)}>
				<Form.Group>
					<Form.Label>How many random Nasa photo do you want to see ?</Form.Label>
					<Form.Control
						name="count"
						type="number"
						{...register('count', { required: true })}
						className={`form-control ${errors.count ? 'is-invalid' : ''}`}
					></Form.Control>
					{errors.count && errors.count.type === "required" && (
						<Alert role="alert" variant="danger" style={{ marginTop: '10px' }}>Photo count is required</Alert>
					)}
				</Form.Group>
				{timeTriggerComp}
				<Button variant="primary" type="submit" style={{ marginTop: '30px' }}>
					Submit
				</Button>
			</Form >
		)
	}
	if (props.name === "Rankings") {
		settings = (
			<Form onSubmit={handleSubmit(submitHandler)}>
				<Form.Group>
					<Form.Label>Season year</Form.Label>
					<Form.Control
						name="season"
						type="number"
						{...register('season', { required: true })}
						className={`form-control ${errors.season ? 'is-invalid' : ''}`}
					></Form.Control>
					{errors.season && errors.season.type === "required" && (
						<Alert role="alert" variant="danger" style={{ marginTop: '10px' }}>Season year is required</Alert>
					)}
				</Form.Group>
				{timeTriggerComp}
				<Button variant="primary" type="submit" style={{ marginTop: '30px' }}>
					Submit
				</Button>
			</Form >
		)
	}
	return (
		<div>
			{settings}
		</div>
	);
}

// 64539eedbfd64343a80cf98a515c7177

export default WidgetSettings;