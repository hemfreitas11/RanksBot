"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var body_parser_1 = require("body-parser");
var DiscordJS = require("discord.js");
var express = require("express");
var app = express();
var client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'] });
var TOKEN = process.env['TOKEN'];
var CACHED_PAYLOADS = {
    changes: {},
    links: {}
};
var SUCCESS_COLOR = "#2AFF00";
var ERROR_COLOR = "#FF1B00";
var SERVER_ID = process.env['SERVER_ID'];
var CACHED_CHANNELS = {};
var FALLBACK_CHANNEL = process.env['FBCHANNEL'];
app.use(express.static('.'));
app.use((0, body_parser_1.urlencoded)({ extended: true }));
app.use((0, body_parser_1.json)());
client.login(TOKEN);
client.on('ready', function () {
    try {
        app.post('/f91a-kjd0-159f-ka91-8djk', function (req, res) {
            console.log(CACHED_PAYLOADS);
            console.log(CACHED_CHANNELS);
            console.log(req);
            console.log(req.body);
            if (req.body) {
                for (var discordId in Object.keys(req.body)) {
                    var username = req.body[discordId];
                    var guild = client.guilds.cache.get(SERVER_ID);
                    var user = guild.members.cache.get(discordId);
                    if (user) {
                        var channel = undefined;
                        var storedChannel = CACHED_CHANNELS[discordId];
                        if (storedChannel) {
                            channel = guild.channels.cache.get(storedChannel);
                        }
                        else {
                            channel = guild.channels.cache.get(FALLBACK_CHANNEL);
                        }
                        if (channel) {
                            var embed = buildEmbed(false, user)
                                .setURL('')
                                .setTitle("**Account Linked Sucessfully**")
                                .addFields({ name: '\u200B', value: user.user.tag + " you have successfully linked **" + username + "** to this Discord account!*.\n\u200B", inline: true });
                            channel.send(embed);
                        }
                    }
                    delete CACHED_CHANNELS[discordId];
                }
            }
            if (!(!!Object.keys(CACHED_PAYLOADS.links).length) && !(!!Object.keys(CACHED_PAYLOADS.changes).length)) {
                res.send("{}");
            }
            else {
                res.send(JSON.stringify(CACHED_PAYLOADS));
                CACHED_PAYLOADS = {
                    changes: {},
                    links: {}
                };
            }
        });
        app.get('/wakeup', function (req, res) {
            res.send(1);
        });
        app.listen(process.env['PORT'], '0.0.0.0', function () {
            console.log('Bot started, watching role changes!');
        });
        client.guilds.cache.get(SERVER_ID).commands.create({
            name: "link",
            description: "Use this command to link your Minecraft username to your Discord account.",
            type: 'CHAT_INPUT',
            options: [
                {
                    type: 'STRING',
                    name: 'nickname',
                    description: 'Type your Minecraft nickname here',
                    required: true
                }
            ]
        });
    }
    catch (error) {
        console.log(error);
    }
});
client.on('guildMemberUpdate', function (oldMember, newMember) {
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        newMember.roles.cache.forEach(function (role) {
            if (!oldMember.roles.cache.has(role.id)) {
                if (CACHED_PAYLOADS.changes[newMember.user.id]) {
                    CACHED_PAYLOADS.changes[newMember.user.id].changes.push("a-" + role.id);
                }
                else {
                    CACHED_PAYLOADS.changes[newMember.user.id] = {
                        changes: ["a-" + role.id]
                    };
                }
            }
        });
    }
    else if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        oldMember.roles.cache.forEach(function (role) {
            if (!newMember.roles.cache.has(role.id)) {
                if (CACHED_PAYLOADS.changes[newMember.user.id]) {
                    CACHED_PAYLOADS.changes[newMember.user.id].changes.push("r-" + role.id);
                }
                else {
                    CACHED_PAYLOADS.changes[newMember.user.id] = {
                        changes: ["r-" + role.id]
                    };
                }
            }
        });
    }
});
client.on('interactionCreate', function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var baseInteraction, commandName, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!interaction.isCommand)
                    return [2 /*return*/];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                baseInteraction = interaction;
                commandName = baseInteraction.commandName;
                if (!(commandName == 'link')) return [3 /*break*/, 3];
                return [4 /*yield*/, runLinkCommand(baseInteraction)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                if (commandName == 'emoji') {
                    // await commandEmoji(interaction)
                }
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
function runLinkCommand(interaction) {
    return __awaiter(this, void 0, void 0, function () {
        var username, id, code, embed;
        return __generator(this, function (_a) {
            username = interaction.options.getString('nickname', true);
            id = interaction.member.user.id;
            code = generateCode(5);
            CACHED_PAYLOADS.links[id] = {
                payload: username + "-" + code
            };
            embed = buildEmbed(false, interaction.member.user).setURL('').setTitle("**Started account linking**")
                .addFields({ name: '\u200B', value: "To complete the process, please type `/authorize " + code + "` in our Minecraft server while logged in as **" + username + "**.\n\u200B", inline: true });
            interaction.reply({ embeds: [embed], ephemeral: true })["catch"](console.error);
            return [2 /*return*/];
        });
    });
}
function generateCode(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function buildEmbed(isError, user) {
    var returnEmbed = new DiscordJS.MessageEmbed();
    returnEmbed
        .setTitle("Placeholder title")
        .setColor(isError ? ERROR_COLOR : SUCCESS_COLOR)
        .setURL('https://discord.gg/pVTjJT9mXZ');
    if (user) {
        returnEmbed
            .setFooter(" \u2022 " + user.tag, user.displayAvatarURL({ format: 'png', size: 16 }))
            .setTimestamp(new Date());
    }
    return returnEmbed;
}
