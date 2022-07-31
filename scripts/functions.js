const errorHandling = error => console.log(error);

// format date into <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
const formatDate = date => {
	const split = date.toString().split(" ");
	return `${split[0]}, ${split[2]} ${split[1]} ${split[3]} ${split[4]} GMT`;
}

const reposVersions = async (user, repos) => {
	return await fetch(`https://api.github.com/repos/${user}/${repos}/tags`).then(response => response.json()).then(body => body);
}

const reposFirstVersion = async (user, repos) => {
	return await reposVersions(user, repos).then(result => result[0].name);
}

const reposLastVersion = async (user, repos) => {
	return await reposVersions(user, repos).then(result => result[result.length-1].name);
}