import { Form } from "react-bootstrap";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {Button} from "react-bootstrap";

function DashboardForm(props) {

	const formOptions = { resolver: yupResolver(props.formSchema) }
	const { register, formState, handleSubmit } = useForm(formOptions)
	const { errors } = formState

	return (
		<div>
			<Form style={{ margin: '30px' }} onSubmit={handleSubmit(props.submitHandler)}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Title:</Form.Label>
					<Form.Control
						name={props.title}
						type="text"
						defaultValue={props.title_placeholder === 'title' ? '' : props.title_placeholder}
						{...register(props.title)}
						className={`form-control ${errors.title ? 'is-invalid' : ''}`}
					/>
				</Form.Group>
				<Form.Label>Description:</Form.Label>
				<Form.Control
					as="textarea"
					aria-label="With textarea"
					defaultValue={props.description_placeholder === 'description' ? '' : props.description_placeholder}
					{...register(props.description)}
				/>
				<Button variant="danger" type="submit" style={{ marginTop: '10px' }}>
					Submit
				</Button>
			</Form>
		</div>
	);
}

export default DashboardForm