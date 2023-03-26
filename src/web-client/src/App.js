import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import { PrivateRoutes } from './hooks/PrivateRoutes'
import Redirect from './pages/Redirect';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';


function App() {
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<div style={{ height: "100%", width: "100%" }}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Register />} />
					<Route path="/redirect_oauth" element={<Redirect />} />
					<Route element={<PrivateRoutes />}>
						<Route path="/" element={<Home />} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</LocalizationProvider>
	);
}

export default App;
