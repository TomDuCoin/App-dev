import { Navigate, Outlet } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

export const PrivateRoutes = () => {
	const [user] = useLocalStorage("token", undefined);
	let isSet = 0;

	if (user === undefined) {
		isSet = 0;
	} else {
		isSet = 1;
	}
	return (
		isSet ? <Outlet /> : <Navigate to='/login' />
	)
}