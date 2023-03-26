import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Nav from 'react-bootstrap/Nav';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
//import { useGoogleLogout } from 'react-google-login';


function HomeNavBar() {
	const navigate = useNavigate();
	const [token, setToken] = useLocalStorage('token', undefined);
	const [name, setName] = useLocalStorage('name', '');
	const [, setId] = useLocalStorage('id', undefined);

	const handleOnSuccess = () => {
		console.log(`${token}`.concat(', successfully logout'));
	};

	const handleOnError = () => {
		console.log('[Error]: Google logout process failed');
	};

	//const { signOut } = useGoogleLogout({
	//	clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
	//	accessType: 'offline',
	//	onLogoutSuccess: handleOnSuccess,
	//	onFailure: handleOnError
	//});

	const handleClick = async (event) => {
		if (event === '1.1') {
			setToken(undefined);
			setName('');
			setId(undefined);
			navigate('/signup');
		//	signOut();
		}
	}

	return (
		<Navbar bg="light" variant="light" onSelect={handleClick}>
			<Container fluid style={{"height": "65px"}}>
				<Navbar.Brand href="/" style={{display: "flex", alignItems: "center", borderRadius: "0px", borderStyle: "solid", padding: "10px"}}>Rattrapage</Navbar.Brand>
				<Navbar.Collapse className="justify-content-between">
					<Nav>
						<h2>Dashboards/</h2>
					</Nav>
					<Nav>
						<NavDropdown
							id='profile-dropdown'
							title={
								<Row style={{display: "flex", alignItems: "center", borderStyle: "dashed", borderRadius: "25px"}}>
									<Col>
										<AccountCircleIcon style={{ fontSize: 40 }}/>
									</Col>
									<Col>
										<h5 style={{marginTop: "7px"}}>{name}</h5>
									</Col>
								</Row>
						}
							drop='start'
						>
							<NavDropdown.Item eventKey='1.1'>
								Logout
							</NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	)
}

export default HomeNavBar;