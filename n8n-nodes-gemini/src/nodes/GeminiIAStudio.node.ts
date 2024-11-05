import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    IDataObject,
} from 'n8n-workflow';
import axios from 'axios';

export class GeminiIAStudio implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Gemini IA Studio',
        name: 'geminiIAStudio',
        icon: 'file:gemini.svg',
        group: ['transform'],
        version: 1,
        description: 'Gera conteúdo usando a API do Gemini',
        defaults: {
            name: 'Gemini IA Studio',
            color: '#1F8A8E',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'geminiApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Título',
                name: 'title',
                type: 'string',
                default: '',
                required: true,
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const title = this.getNodeParameter('title', i) as string;
            const credentials = await this.getCredentials('geminiApi');
            const geminiApiKey = credentials.apiKey;

            // Chamada à API do Gemini para gerar conteúdo
            const geminiResponse = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: title,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 1,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                        responseMimeType: 'text/plain',
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const content = geminiResponse.data;

            returnData.push({
                json: {
                    title,
                    content,
                } as IDataObject,
            });
        }

        return [returnData];
    }
} 