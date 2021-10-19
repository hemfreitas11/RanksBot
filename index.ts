import { urlencoded, json } from 'body-parser'

import * as DiscordJS from 'discord.js'

import * as express from 'express'

const app = express()

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS']})
const TOKEN = process.env['TOKEN']

let CACHED_PAYLOADS = {
	changes: {},
	links: {}
}

const SUCCESS_COLOR = "#2AFF00"
const ERROR_COLOR = "#FF1B00"
const SERVER_ID = process.env['SERVER_ID']
const CACHED_CHANNELS = {}
const FALLBACK_CHANNEL = process.env['FBCHANNEL']

app.use(express.static('.'))
app.use(urlencoded({ extended: true }))
app.use(json())

client.login(TOKEN)

client.on('ready', () => {
	try {
		app.post('/f91a-kjd0-159f-ka91-8djk', (req, res) => {
			for (const discordId of Object.keys(req.body)) {
				const username = req.body[discordId];
				const guild = client.guilds.cache.get(SERVER_ID)
				const user = guild.members.cache.get(discordId)
				if (user) {
					let channel = undefined
					const storedChannel = CACHED_CHANNELS[discordId]
					if (storedChannel) {
						channel = guild.channels.cache.get(storedChannel)
					} else {
						channel = guild.channels.cache.get(FALLBACK_CHANNEL)
					}

					if (channel) {
						const embed = 
							buildEmbed(false, user.user)
								.setURL('')
								.setTitle(`**Account Linked Sucessfully**`)
								.addFields(
									{ name: '\u200B', value: `Congratulations <@${user.user.id}>, you have successfully linked **${username}** to this Discord account!.\n\u200B`, inline: true }
								)
						channel.send({embeds: [embed]})
					}
				}
				delete CACHED_CHANNELS[discordId]
			}

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

		app.listen((process.env['PORT'] as unknown as number), '0.0.0.0', () => {
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

	CACHED_CHANNELS[id] = interaction.channel.id

	const embed = buildEmbed(false, interaction.user).setURL('').setTitle(`**Started account linking**`)
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

function buildEmbed(isError, user: DiscordJS.User) {
	const returnEmbed = new DiscordJS.MessageEmbed()
	returnEmbed
		.setTitle(`Placeholder title`)
		.setColor(isError ? ERROR_COLOR : SUCCESS_COLOR)
		.setURL('https://discord.gg/pVTjJT9mXZ')
	if (user) {
		returnEmbed
			.setFooter(` • ${user.tag}`, user.displayAvatarURL({ format: 'png', size: 16 }))
			.setTimestamp(new Date())
	}
	return returnEmbed
}