import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from 'stream';

/**
 * Converts text to speech using Azure Speech SDK.
 * @param {string} text - The text to synthesize into speech.
 * @param {string} subscriptionKey - Your Azure Speech API subscription key.
 * @param {string} region - Your Azure Speech API region.
 * @returns {Promise<Buffer>} - A promise that resolves to an audio buffer.
 */
async function textToSpeech(text, subscriptionKey, region) {
    return new Promise((resolve, reject) => {
        // Initialize Speech Config
        const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
        const audioConfig = AudioConfig.fromDefaultSpeakerOutput();

        const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            text,
            (result) => {
                synthesizer.close();
                if (result.reason === ResultReason.SynthesizingAudioCompleted)
                {
                    console.log('Synthesis complete.');
                    resolve(result.audioData); // Return audio data as a Buffer
                }
                else
                {
                    console.error('Speech synthesis failed:', result.errorDetails);
                    reject(new Error(result.errorDetails));
                }
            },
            (error) => {
                synthesizer.close();
                console.error('Error during synthesis:', error);
                reject(error);
            }
        );
    });
}

export default { textToSpeech };
