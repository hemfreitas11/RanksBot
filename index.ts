import { urlencoded, json } from 'body-parser'

import * as DiscordJS from 'discord.js'

import * as express from 'express'

const app = express()

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS']})
const TOKEN = 'ODk2MDQwNTQxODE5NjM3ODEw.YWBUyA.ij1GWc_I5-CD0R7P_0Yo6Vxk2X8'

let CACHED_PAYLOADS = {
	changes: {},
	links: {}
}

const SUCCESS_COLOR = "#2AFF00"
const ERROR_COLOR = "#FF1B00"
const SERVER_ID = '896041525597831188'

app.use(express.static('.'))
app.use(urlencoded({ extended: true }))
app.use(json())

client.login(TOKEN)

client.on('ready', () => {
	try {
		app.get('/f91a-kjd0-159f-ka91-8djk', (req, res) => {
			console.log(CACHED_PAYLOADS)

			if (!(!!Object.keys(CACHED_PAYLOADS.links).length) && !(!!Object.keys(CACHED_PAYLOADS.changes).length)) {
				res.send("{}")
			} else {
				res.send(JSON.stringify(CACHED_PAYLOADS))
				CACHED_PAYLOADS = {
					changes: {},
					links: {}
				}
			}
		})

		app.get('/wakeup', (req, res) => {
			res.send(1)
		})
		app.listen(4657, '0.0.0.0', () => {
			console.log('Bot started, watching role changes!')
		})
		
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
		})

	} catch (error) { console.log(error) }
})

client.on('guildMemberUpdate', (oldMember, newMember) => {
	console.log('111111111111111')
	if (oldMember.roles.cache.size < newMember.roles.cache.size) {
		newMember.roles.cache.forEach(role => {
			if (!oldMember.roles.cache.has(role.id)) {
				if (CACHED_PAYLOADS.changes[newMember.user.id]) {
					CACHED_PAYLOADS.changes[newMember.user.id].changes.push(`a-${role.id}`);
				} else {
					CACHED_PAYLOADS.changes[newMember.user.id] = {
						changes: [`a-${role.id}`]
					}
				}
			}
		});
	} else if (oldMember.roles.cache.size > newMember.roles.cache.size) {
		oldMember.roles.cache.forEach(role => {
			if (!newMember.roles.cache.has(role.id)) {
				if (CACHED_PAYLOADS.changes[newMember.user.id]) {
					CACHED_PAYLOADS.changes[newMember.user.id].changes.push(`r-${role.id}`);
				} else {
					CACHED_PAYLOADS.changes[newMember.user.id] = {
						changes: [`r-${role.id}`]
					}
				}
			}
		});
	}
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand) return
	try {
		const baseInteraction = interaction as DiscordJS.CommandInteraction
		let { commandName } = baseInteraction

		if (commandName == 'link') {
			await runLinkCommand(baseInteraction)
		} else if (commandName == 'emoji') {
			// await commandEmoji(interaction)
		}
	} catch (error) { console.log(error) }
})

async function runLinkCommand(interaction: DiscordJS.CommandInteraction) {
	let username = interaction.options.getString('nickname', true)
	let id = interaction.member.user.id
	let code = generateCode(5)

	CACHED_PAYLOADS.links[id] = {
		payload: `${username}-${code}`
	}

	const embed = buildEmbed(false, interaction.member.user).setURL('').setTitle(`**Started account linking**`).setColor("#2AFF00")
		.addFields(
			{ name: '\u200B', value: `To complete the process, please type \`/authorize ${code}\` in our Minecraft server while logged in as **${username}**.\n\u200B`, inline: true }
		)
	interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error)
}

function generateCode(length) {
	let result = '';
	let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function buildEmbed(isError, user) {
	let color = isError ? ERROR_COLOR : SUCCESS_COLOR
	const returnEmbed = new DiscordJS.MessageEmbed()
	returnEmbed
		.setTitle(`Placeholder title`)
		.setColor(color = isError)
		.setURL('https://discord.gg/pVTjJT9mXZ')
	if (user) {
		returnEmbed
			.setFooter(` • ${user.tag}`, user.displayAvatarURL({ format: 'png', size: 16 }))
			.setTimestamp(new Date())
	}
	return returnEmbed
}