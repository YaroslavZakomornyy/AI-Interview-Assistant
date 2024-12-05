
/**
 * 
 * @param {string} transcript 
 */
export function parse(transcript){

    const chatHistory = [];
    const lines = transcript.split(/\r?\n/);
    for (let line of lines){
        if (line.length === 0) continue;
        console.log(line);
        let ind = line.indexOf("user:");
        
        if (ind != -1){
            chatHistory.push({sender: "user", text: line.slice(ind + 5).trim()});
        }
        else{
            ind = line.indexOf("interviewer:");
            console.log(line.slice(ind));
            if (ind != -1){
                chatHistory.push({sender: "ai", text: line.slice(ind + 12).trim()});
            }
            else{
                continue;
            }
        }
    }

    return chatHistory;
    
}

export default{
    parse
}