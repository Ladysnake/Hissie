const HealthStatus = require("./HealthStatus");
const HissieGameActivity = require("./HissieGameActivity");
const UserManagement = require("./UserManagement");
const RichAnswers = require("./RichAnswers");

module.exports = {
	scales: [],
	simpleScales: [
		HissieGameActivity,
		HealthStatus,
		UserManagement,
		RichAnswers,
	],
};