import os from 'os';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import { prompt as prompts } from 'prompts';

type Config = {
	apiKey: string;
};

const configPath = `${os.homedir()}/.chatgpt-cli/config.json`;

const readConfig = (): Config | null => {
	if (!fs.existsSync(configPath)) {
		return null;
	}
	const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	return config;
};

// Returns config or create one if it doesn't exist
export const ensureConfig = async () => {
	let config = readConfig();
	if (config === null) {
		// Ask user for API key
		const apiKey = await prompts({
			type: 'text',
			name: 'value',
			message: 'Please enter your OpenAI API key',
		});

		config = {
			apiKey: apiKey.value,
		};

		// Check if API key is valid
		const configuration = new Configuration({
			apiKey: config.apiKey,
		});

		const openai = new OpenAIApi(configuration);
		try {
			await openai.listModels();
		} catch (e) {
			process.stdout.write('Invalid API key, please try again with a valid one.\n');
			process.exit();
		}

		// Save config
		fs.mkdirSync(`${os.homedir()}/.chatgpt-cli`, { recursive: true });
		fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
	}
};

export default {};
