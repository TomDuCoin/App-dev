import HomeNavBar from '../components/HomeNavBar';
import { useRef, useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { Modal, Alert, Button } from 'react-bootstrap';
import DashboardForm from '../components/DashboardForm';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useLocalStorage } from "../hooks/useLocalStorage";
import WidgetSettings from '../components/WidgetSettings';
import axios from '../axios/axios';
import * as Yup from 'yup';


function Home() {
	const [id] = useLocalStorage('id', undefined);
	const [token] = useLocalStorage('token', undefined);
	const [dashboards, setDashboards] = useState([]);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [toDisplay, setToDisplay] = useState([]);
	const [modaleTitle, setModalTite] = useState('');
	const [isModifyOpen, setIsModifyOpen] = useState(false);
	const [isServiceOpen, setIsServiceOpen] = useState(false);
	const [services, setServices] = useState([]);
	const [widgets, setWidgets] = useState([]);
	const [selectedWidget, setSelectedWidget] = useState({});
	const [selectedDashboard, setSelectedDashboard] = useState({})
	const [errMsg, setErrMsg] = useState('');
	const [selectID, setSelectedID] = useState(0);
	const [dashboardID, setDashboardID] = useState(0);

	const errRef = useRef();

	const formSchema = Yup.object().shape({
		title: Yup.string().required('Title is mandatory'),
	});

	const formSchemaModify = Yup.object().shape({
		modify_title: Yup.string().required('Title is mandatory'),
	});

	useEffect(() => {
		setErrMsg('');
	}, []);

	const submitHandler = async (data) => {
		const json = JSON.stringify({ title: data.title, description: data.description });
		try {
			await axios.post(process.env.REACT_APP_SERVER_API_URL + '/dashboards', json,
				{ headers: { 'Content-Type': 'application/json', 'X-User-ID': id, 'Authorization': `Basic ${token}`} });
			getDashboards();
		} catch (err) {
			if (!err?.response) {
				setErrMsg('No Server Response');
			} else if (err.response?.status === 400) {
				setErrMsg('Missing form field');
			} else if (err.response?.status === 401) {
				setErrMsg('Unauthorized');
			} else if (err.response?.status === 403) {
				setErrMsg('User already registered');
			}
			errRef.current?.focus();
		}
		setIsFormOpen(false);
	}

	const handleClose = () => setIsFormOpen(false);

	const modifyDashboard = async (event) => {
		setSelectedID(event.currentTarget.id)
	};

	const deleteDashboard = async (event) => {
		await axios.delete(process.env.REACT_APP_SERVER_API_URL + '/dashboards/' + event.currentTarget.id,
		{ headers: { 'X-User-ID': id, 'Authorization': `Basic ${token}` }});
		getDashboards();
	};

	const getDashboards = async () => {
		try {
		const resp = await axios.get(process.env.REACT_APP_SERVER_API_URL + '/dashboards',
			{ headers: { 'X-User-ID': id, 'Authorization': `Basic ${token}`} });
		setDashboards(resp.data);
		} catch(err) {
			if (!err?.response) {
				setErrMsg('No Server Response');
			} else if (err.response?.status === 400) {
				setErrMsg('Missing form field');
			} else if (err.response?.status === 401) {
				setErrMsg('Unauthorized');
			} else if (err.response?.status === 403) {
				setErrMsg('User already registered');
			}
			errRef.current?.focus();
		}
	};

	const updateDashboard = async (data) => {
		const modifications = JSON.stringify({
			title: data.modify_title,
			description: data.modify_description
		});
		await axios.put(process.env.REACT_APP_SERVER_API_URL + '/dashboards/' + selectedDashboard._id,
			modifications,
			{ headers: { 'Content-Type': 'application/json', 'X-User-ID': id } }
		)
		setIsModifyOpen(false);
		getDashboards();
	};

	const getServices = async (clickedDashboardID) => {
		const resp = await axios.get(process.env.REACT_APP_SERVER_API_URL + '/services',
		{ headers: { 'X-User-ID': id, 'Authorization': `Basic ${token}`} });
		setDashboardID(clickedDashboardID);
		setServices(resp.data.services);
	};

	const addDashboards = () => setIsFormOpen(true);

	const closeModify = () => setIsModifyOpen(false);

	const closeServices = () => setIsServiceOpen(false);

	useEffect(() => {
		getDashboards();
	}, [axios]);

	useEffect(() => {
		const dash = (dashboards.filter(dashboard => dashboard._id === selectID))[0]
		if (!dash)
			setSelectedDashboard({});
		else {
			setSelectedDashboard(dash);
		}
	}, [selectID, dashboards]);

	useEffect(() => {
		if (selectedDashboard?.title)
			setIsModifyOpen(true);
	}, [selectedDashboard]);

	const serviceClicked = async (event) => {
		setWidgets((services.filter(service => service._id === event.currentTarget.id)[0]['widgets']));
	};

	const widgetClicked = async (event) => {
		const widget = widgets.filter(widget => widget.name === event.currentTarget.id)[0];
		setSelectedWidget(widget);
	};

	useEffect(() => {
		setToDisplay(<WidgetSettings name={selectedWidget.name} widgetPattern={selectedWidget} dashboardID={dashboardID} getDashboards={getDashboards}/>)
	}, [selectedWidget]);

	useEffect(() => {
		setServices([]);
		setModalTite('Choose a widget');
		setToDisplay(
			<div>
				{widgets.map((widget, index) =>
					<Button id={widget.name} onClick={(event) => widgetClicked(event, widget.name)}>{widget.name}</Button>
				)}
			</div>
		);
	}, [widgets]);

	useEffect(() => {
		if (services.length > 0) {
			setModalTite('Choose a service');
			setToDisplay(
				services.map((service, index) =>
							<div style={{width: '9em', height: '9em', cursor: 'pointer'}} id={service._id} onClick={(event) => serviceClicked(event)}>
								<img
									src={process.env.PUBLIC_URL + (service.name.toLowerCase().replace(' ', '')) + '_logo.png'}
									alt=''
									style={{width: '9em', borderRadius: '10px'}}
								/>
							</div>
						)
			);
			setIsServiceOpen(true);
		}
	}, [services]);

	return (
		<div>
			<HomeNavBar />
			<div style={{ margin: '30px', display: 'flex', flexWrap: 'wrap' }}>
				{
					dashboards.map((dashboard, index) =>
						<DashboardCard
							title={dashboard.title}
							description={dashboard.description}
							id={dashboard._id}
							widgets={dashboard.widgets}
							onDelete={deleteDashboard}
							onModify={modifyDashboard}
							clickService={getServices}
							placeholderModify="modify dashboard"
							placeholderDelete="delete dashboard"
							onUpdate={getDashboards}
						/>)
				}
				<div style={{
					width: '18em',
					height: '18em',
					borderRadius: '15px',
					borderStyle: "dotted",
					padding: "10px",
					margin: '10px',
					textAlign: 'center',
					cursor: 'pointer'
				}}
					onClick={addDashboards}>
					<AddCircleOutlineIcon style={{ fontSize: '15em', marginTop: '10px' }} />
				</div>
				<Modal show={isFormOpen} onHide={handleClose}>
					<DashboardForm submitHandler={submitHandler}
					title='title'
					description='description'
					title_placeholder='title'
					description_placeholder='description'
					formSchema={formSchema}/>
					<div style={{ marginTop: '5%' }}>
						{errMsg ? <Alert variant='danger' style={{ textAlign: 'center' }}>{errMsg}</Alert> : <></>}
					</div>
				</Modal>
				<Modal show={isModifyOpen} onHide={closeModify}>
					<Modal.Header closeButton>Modifying dashboard: {selectedDashboard.title}</Modal.Header>
					<DashboardForm submitHandler={updateDashboard}
						title='modify_title'
						description='modify_description'
						title_placeholder={selectedDashboard.title}
						description_placeholder={selectedDashboard.description}
						formSchema={formSchemaModify}/>
				</Modal>
				<Modal show={isServiceOpen} onHide={closeServices}>
					<Modal.Header closeButton>{modaleTitle}</Modal.Header>
					<div style={{ margin: '30px', display: 'flex', flexWrap: 'wrap' }}>
					{toDisplay}
					</div>
				</Modal>
			</div>
		</div>
	)
};

export default Home;