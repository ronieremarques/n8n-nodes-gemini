import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class GeminiApi implements ICredentialType {
    name = 'geminiApi';
    displayName = 'Gemini API';
    properties: INodeProperties[] = [
        {
            displayName: 'Chave da API do Gemini',
            name: 'apiKey',
            type: 'string',
            default: '',
            required: true,
            description: 'Chave da API do Gemini. Veja como obter: [link](https://cloud.google.com/generative-language/docs/getting-started).',
        },
    ];
} 