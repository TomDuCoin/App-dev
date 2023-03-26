import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import { Row, Col, Modal } from 'react-bootstrap';
import { IconButton, Menu, MenuItem } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GifyWidget from './GifyWidget';
import NewsApiWidget from './NewsApiWidget';
import NasaWidget from './NasaWidget';
import axios from '../axios/axios';
import { useLocalStorage } from "../hooks/useLocalStorage";
import WidgetSettings from './WidgetSettings';


function CardHeader(props) {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<Card.Header>
			<Row style={{ display: 'flex', alignItems: 'center' }}>
				<Col style={{ flex: 8 }}>
					{props.title}
				</Col>
				<Col style={{ flex: 1 }}>
					<IconButton onClick={handleClick}><MoreHorizIcon /></IconButton>
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
					>
						<MenuItem id={props.id} key='1.2' onClick={(event) => { handleClose(); props.onModify(event) }}>
							<Row>
								<Col>
									<AutoFixNormalIcon />
								</Col>
								<Col>
									{props.placeholderModify}
								</Col>
							</Row>
						</MenuItem>
						<MenuItem id={props.id} key='1.1' onClick={(event) => { handleClose(); props.onDelete(event) }}>
							<Row>
								<Col>
									<DeleteIcon />
								</Col>
								<Col>
									{props.placeholderDelete}
								</Col>
							</Row>
						</MenuItem>
					</Menu>
				</Col>
			</Row>
		</Card.Header>
	);
}


function DashboardCard(props) {
	const [id] = useLocalStorage('id', undefined);
	const [token] = useLocalStorage('token', undefined);
	const [isModifyOpen, setIsModifyOpen] = useState(false);
	const [widgetPattern, setWidgetPattern] = useState(undefined);

	const deleteWidget = async (event) => {
		await axios.delete(`${process.env.REACT_APP_SERVER_API_URL}/dashboards/${props.id}/widgets/${event.currentTarget.id}`,
			{ headers: { 'X-User-ID': id, 'Authorization': `Basic ${token}` } })
		props.onUpdate()
	}

	const modifyWidget = async (event) => {
		const selectedWidget = props.widgets.filter(widget => widget._id === event.currentTarget.id);
		if (selectedWidget.lenght < 1) {
			console.log('[ERROR]: selected widget id not found');
			return;
		}
		setWidgetPattern(selectedWidget[0]);
	}

	useEffect(() => {
		if (widgetPattern)
			setIsModifyOpen(true);
	}, [widgetPattern])

	const closeServices = () => setIsModifyOpen(false);

	return (
		<div>
			<Card style={{ width: '30em', margin: '10px' }}>
				<CardHeader {...props} />
				<Card.Body style={{ position: "relative" }}>
					<Card.Text>
						{props.description}
					</Card.Text>
					{
						props.widgets.map((widget) => {
							if (widget.name === 'headlines') {
								return (
									<Card border="danger" style={{marginTop: '10px'}}>
									<CardHeader
										title={widget.name}
										onDelete={deleteWidget}
										onModify={modifyWidget}
										id={widget._id}
										placeholderModify="modify widget"
										placeholderDelete="delete widget"
									/>
									<Card.Body>
										<NewsApiWidget url={widget.url} timer={widget.timer} />
									</Card.Body>
									</Card>
								)
							}
							if (widget.name === 'trending') {
								return (
								<Card border="danger" style={{marginTop: '10px'}}>
								<CardHeader
									title={widget.name}
									onDelete={deleteWidget}
									onModify={modifyWidget}
									id={widget._id}
									placeholderModify="modify widget"
									placeholderDelete="delete widget"
								/>
								<Card.Body>
									<GifyWidget url={widget.url} timer={widget.timer} />
								</Card.Body>
								</Card>
							)
							}
							if (widget.name === 'APOD') {
								return (
									<Card border="info" style={{marginTop: '10px'}}>
										<CardHeader
											title={widget.name}
											onDelete={deleteWidget}
											onModify={modifyWidget}
											id={widget._id}
											placeholderModify="modify widget"
											placeholderDelete="delete widget"
										/>
										<Card.Body>
											<NasaWidget url={widget.url} timer={widget.timer} />
										</Card.Body>
									</Card>
								)
							}
							return <div />;
						})
					}
					<div style={{
						width: '26em',
						height: '5em',
						borderRadius: '15px',
						borderStyle: "dotted",
						padding: "10px",
						margin: '10px',
						textAlign: 'center',
						cursor: 'pointer',
					}}
						onClick={() => props.clickService(props.id)}
					>
						<AddCircleOutlineIcon style={{ fontSize: '2em', bottom: 0 }} />
						<p>add widget</p>
					</div>
				</Card.Body>
			</Card>
			<Modal show={isModifyOpen} onHide={closeServices}>
				<Modal.Header closeButton>Modify Widget</Modal.Header>
				<div style={{ margin: '30px', display: 'flex', flexWrap: 'wrap' }}>
					<WidgetSettings
						widgetPattern={widgetPattern}
						widgetID={widgetPattern ? widgetPattern._id : undefined}
						dashboardID={props.id}
						name={widgetPattern ? widgetPattern.name : undefined}
						getDashboards={props.onUpdate}
					/>
				</div>
			</Modal>
		</div>
	);
}

export default DashboardCard;