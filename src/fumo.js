const c = require('./config')
const Discord = require('discord.js')
const amiami = require("./amiami")

const config = c.getConfig()

const client = new Discord.Client(
	{ 
		intents: 
		[
			Discord.GatewayIntentBits.Guilds, 
			//Discord.GatewayIntentBits.MessageContent,
			Discord.GatewayIntentBits.GuildMessageReactions,
			Discord.GatewayIntentBits.GuildMessages,
			Discord.GatewayIntentBits.GuildEmojisAndStickers,
			Discord.GatewayIntentBits.DirectMessages
		] 
	}
)

client.on(
	"ready", 
	async () => {
		console.log(`Fumo in. | ${client.user.tag}`)

		client.user.setActivity('with fumos', { type: 'PLAYING' })

		console.log("Running on servers:")
		var guilds = client.guilds.cache.map(g => g)
		for(var i = 0; i < guilds.length; i += 1)
		{
			console.log(guilds[i].name + ": " + guilds[i].id)
		}

		var channel = client.channels.cache.get(config.channel_id)
		await channel.send("ᗜ‿ᗜ")

		for (var i = 0; i < config.searches.length; i += 1)
		{
			var items = await amiami.search(config.searches[i])
			console.log(items)
			await printStatus(channel, items)
		}
	}
)

client.login(config.discord_token)

async function printStatus(channel, items)
{
	for(var i = items.length - 1; i >= 0; i -= 1)
	{
		var availability = getAvailability(items[i])
		if (availability.includes("Closed"))
		{
			continue
		}
		const attachment = new Discord.AttachmentBuilder(`https://img.amiami.com${items[i].thumb_url}`, 'image.jpg');
		var msg = `## ${items[i].gname}`
		+ `\n## [${getAvailability(items[i])}](https://www.amiami.com/eng/detail/?gcode=${items[i].gcode})`
		+ ` (**${items[i].c_price_taxed}JPY**)`
		await channel.send({ content: msg, files: [attachment] })
	}
}

function getAvailability(item)
{
	var isSale = item['saleitem'] == 1
	var isLimited = item['list_store_bonus'] == 1 || item['list_amiami_limited'] == 1
	var isPreowned = item['condition_flg'] == 1
	var isPreorder = item['preorderitem'] == 1
	var isBackorder = item['list_backorder_available'] == 1
	var isClosed = item['order_closed_flg'] == 1

	if (isClosed)
	{
		if (isPreorder)
		{
				return "Pre-order Closed"
		}
		if (isBackorder)
		{
				return "Back-order Closed"
		}
		return "Order Closed"
	}
	if (isPreorder)
	{
			return "Pre-order"
	}
	if (isBackorder)
	{
			return "Back-order"
	}
	if (isPreowned)
	{
			return "Pre-owned"
	}
	if (isLimited)
	{
			return "Limited"
	}
	if (isSale)
	{
			return "On Sale"
	}
	return "Available"
}
