function formatUserName(firstName, lastName)
{
	firstName = firstName.toLowerCase().charAt(0).toUpperCase() + firstName.slice(1);
	lastName = lastName.toLowerCase().charAt(0).toUpperCase() + lastName.slice(1);
	return firstName + " " + lastName;
}

export default formatUserName;
