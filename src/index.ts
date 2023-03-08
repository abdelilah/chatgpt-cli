#!/usr/bin/env node
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { marked } from 'marked';
// @ts-ignore
import TerminalRenderer from 'marked-terminal';
import { prompt as prompts } from 'prompts';
import { ensureConfig } from './utils';

marked.setOptions({
	// Define custom renderer
	renderer: new TerminalRenderer(),
});

const main = async () => {
	await ensureConfig();

	// Get prompt either from argv if present, or ask for it
	let promptStr = process.argv[2];
	if (promptStr === undefined) {
		const prompt = await prompts({
			type: 'text',
			name: 'value',
			message: 'Please enter your prompt',
		});
		promptStr = prompt.value;

		if (!promptStr) {
			process.exit();
		}
	}

	const configuration = new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const openai = new OpenAIApi(configuration);
	const messages: ChatCompletionRequestMessage[] = [];

	do {
		messages.push({
			role: 'user',
			content: promptStr,
		});

		const completion = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages,
		});

		completion.data.choices.forEach((choice) => {
			if (choice.message?.role === 'assistant') {
				// @eslint-disable-next-line no-console
				console.log(marked(choice.message?.content));
				messages.push(choice.message);
			}
		});

		const prompt = await prompts({
			type: 'text',
			name: 'value',
			message: 'Please enter your prompt',
		});
		promptStr = prompt.value;
	} while (promptStr);
};

main();
