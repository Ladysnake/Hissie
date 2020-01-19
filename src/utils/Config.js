module.exports = function Config(jsonData) {
    this.token = jsonData.token;
    this.games = jsonData.games;
    this.ladysnakeGuildId = jsonData.ladysnakeGuildId;
    this.ladysnakeGeneralId = jsonData.ladysnakeGeneralId;
    this.ladysnakeConsoleId = jsonData.ladysnakeConsoleId;
};