import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

class SpeechRecognizerService {
    /**
     * Initialize the SpeechRecognizerService.
     * @param {string} subscriptionKey - Your Azure Speech API subscription key.
     * @param {string} region - Your Azure Speech API region.
     */
    constructor(subscriptionKey, region) {
        this.speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
        this.speechConfig.speechRecognitionLanguage = 'en-US'; // Set default language
    }

    /**
     * Recognizes speech from an audio buffer.
     * @param {Buffer} audioBuffer - The audio file buffer (e.g., WAV format).
     * @returns {Promise<string>} - The recognized text or an error message.
     */
    recognizeSpeechFromBuffer(audioBuffer) {

        console.log(audioBuffer);

        return new Promise((resolve, reject) => {
            // Create an audio input stream from the buffer
            const audioConfig = AudioConfig.fromWavFileInput(audioBuffer);
            console.log("Configured audio config");
            // Create a SpeechRecognizer for each request
            
            const recognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

            recognizer.recognized = (s, e) => {
                console.log(`Recognized: ${e.result.text}`);
            };
            recognizer.canceled = (s, e) => {
                console.error(`Canceled: ${e.errorDetails}`);
                recognizer.close();
            };
            recognizer.sessionStarted = (s, e) => {
                console.log('Session started');
            };
            recognizer.sessionStopped = (s, e) => {
                console.log('Session stopped');
            };
            recognizer.speechStartDetected = (s, e) => {
                console.log('Speech started');
            };
            recognizer.speechEndDetected = (s, e) => {
                console.log('Speech ended');
            };
            




            console.log("Configured audio recognizer");

            recognizer.recognizeOnceAsync(result => {
                console.log("Done!");
                recognizer.close(); // Clean up the recognizer after the request

                if (result.reason === ResultReason.RecognizedSpeech) {
                    console.log('Recognized Speech:', result.text);
                    resolve(result.text);
                } else {
                    console.error('Speech Recognition Error:', result.errorDetails);
                    reject(new Error(result.errorDetails || 'Failed to recognize speech'));
                }
            });
        });
    }
}

export default SpeechRecognizerService;