import React from "react";
import Identicon from "identicon.js"
import "./navbar.css";

const Navbar = ({ user }) => {
	let data;
	if (user) {
		data = new Identicon(user, 420).toString();
	}
	return(
		<div className="navbar">
			<div>TokenSwap</div>
			<div>{ user }</div>
			<div><img width="30" height="30" alt="" src={`data:image/png;base64,${data}`}/></div>
		</div>
	)
}

export default Navbar;