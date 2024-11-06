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
        displayName: 'Gemini IA Studio [8links]',
        name: 'geminiIAStudio',
        icon: 'file:8links.svg',
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
                displayName: 'Prompt',
                name: 'prompt',
                type: 'string',
                default: '',
                required: true,
            },
            {
                displayName: 'Top-P',
                name: 'topP',
                type: 'number',
                default: 0.95,
                required: false,
            },
            {
                displayName: 'Top-K',
                name: 'topK',
                type: 'number',
                default: 40,
                required: false,
            },
            {
                displayName: 'Temperatura',
                name: 'temperature',
                type: 'number',
                default: 1,
                required: false,
            },
            {
                displayName: 'Tamanho Máximo da Saída',
                name: 'maxOutputTokens',
                type: 'number',
                default: 8192,
                required: false,
            },
            {
                displayName: 'Formato de Saída',
                name: 'responseMimeType',
                type: 'options',
                options: [
                    {
                        name: 'application/json',
                        value: 'application/json',
                    },
                    {
                        name: 'text/plain',
                        value: 'text/plain',
                    },
                ],
                default: 'text/plain',
                required: false,
            },
            {
                displayName: 'Modelo',
                name: 'model',
                type: 'options',
                options: [
                    {
                        name: 'Gemini 1.5 Flash',
                        value: 'gemini-1.5-flash',
                    },
                    {
                        name: 'Gemini 1.5 Pro',
                        value: 'gemini-1.5-pro',
                    },
                    {
                        name: 'Gemini 1.0 Pro',
                        value: 'gemini-1.0-pro',
                    },
                ],
                default: 'gemini-1.5-flash',
                required: false,
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const prompt = this.getNodeParameter('prompt', i) as string;
            const credentials = await this.getCredentials('geminiApi');
            const geminiApiKey = credentials.apiKey;

            try {
                // Chamada à API do Gemini para gerar conteúdo
                const geminiResponse = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/${this.getNodeParameter('model', i)}:generateContent?key=${geminiApiKey}`,
                    {
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: this.getNodeParameter('temperature', i) as number,
                            topK: this.getNodeParameter('topK', i) as number,
                            topP: this.getNodeParameter('topP', i) as number,
                            maxOutputTokens: this.getNodeParameter('maxOutputTokens', i) as number,
                            responseMimeType: this.getNodeParameter('responseMimeType', i) as string,
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
                        prompt,
                        content,
                    } as IDataObject,
                });
            } catch (error) {
                // Tratamento de erro
                const status = (error as any).response?.status;
                const message = (error as any).response?.data?.error?.message || 'Erro desconhecido';
                throw new Error(`Erro ao chamar a API do Gemini: ${status} - ${message}`);
            }
        }

        return [returnData];
    }
} 