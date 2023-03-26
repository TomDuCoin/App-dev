import React from "react";
import {Col, Row} from "react-bootstrap";

function NotFound() {
	return (
	<div style={{marginTop: "250px"}} className="text-center">
		<Row>
			<Col><h1 style={{ fontSize: "200px" }}>404</h1></Col>
		</Row>
		<Row>
			<Col><h1>Page not found</h1></Col>
		</Row>
	</div>
	)
}

export default NotFound;