const App = require("./App");
const Discord = require('discord.js');
const express = require('express');
const lodash = require('lodash');
const google = require('google');
const http = require('http');
const request = require('request');
const ytdl = require('ytdl-core');

// Utils
const {grabJson, playAudio, randomNumber, numberToDieImg} = require('./utils');
const Config = require('./utils/Config');
const HealthStatus = require("./scales/HealthStatus");

// Creating the bot and config, then logging in
require('dotenv').load();
const hissie = new Discord.Client();
const config = new Config(grabJson('data/config.json'));
const userStates = new Map();

App.from(process.env.HissieToken)
	.addScale(HealthStatus.create())
	.run();