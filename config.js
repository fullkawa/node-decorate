module.exports = {
	/**
	 * clusterNum :
	 *  Number of Node.js clusters
	 */
	clusterNum : 2,
	
	/**
	 * port :
	 *  Run on this port number.
	 */
	port : 8124,
	// port : 80, // If you use this, you must start index.js with "sudo" command.

	/**
	 * serverURL :
	 */
	serverURL : 'http://127.0.0.1:8124',
	
	/**
	 * useLocalJquery :
	 *  If you use /lib/jquery.min.js, true.
	 */
	useLocalJquery : false,
	
	/**
	 * jqueryCDN :
	 *  URL provide jQuery script.
	 */
	jqueryCDN : 'http://code.jquery.com/jquery-1.8.1.min.js'
}
