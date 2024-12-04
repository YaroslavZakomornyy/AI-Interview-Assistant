/**
 * Returns an absolute path to the transcript 
 * @param {string} userId 
 * @param {string} transcriptId 
 * @returns 
 */
function getTranscriptPath(userId, transcriptId){
    return `${global.appRoot}/data/transcripts/${userId}/${transcriptId}.txt`;
} 



export{
    getTranscriptPath
}