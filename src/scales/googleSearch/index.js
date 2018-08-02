import google from "google"

const states = ["called"];
const re = /.*(what|who) +(is|are) +.*\?/i

export default {
    install(hissie, toolbox){
        toolbox.on("message", message => {
            if(!(
                re.test(message.content)
                && states.includes(toolbox.getUserState(message.author))
            ))
                return;

            const messageWords = message.content.split(/(\b|\s)+/g)
            .map(word => word.toLowerCase());
            let inside;
            let search = '';
        
            // Takes the keywords to search
            messageWords.forEach(e => {
                if (e == '?') inside = false;
                if (inside) search += e;
                if (e == 'is' || e == 'are') inside = true;
            });
        
            // Makes the search and returns the first valid result of the three links on top
            if (search != '')
                google(search.trim(), (err, response) => {
                    if (err) console.error(err);
                    if (response.links[0] != null && response.links[1] != null && response.links[2] != null) {
                        if (response.links[0].link != null) message.channel.send(response.links[0].link);
                        else if (response.links[1].link != null) message.channel.send(response.links[1].link);
                        else if (response.links[2].link != null) message.channel.send(response.links[2].link);
                    }
                });
            else
                message.channel.send();
        });

        console.log("installed googleSearch scale");
    }
}